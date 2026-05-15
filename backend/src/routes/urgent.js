'use strict';

const express = require('express');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const urgentMatcher = require('../services/urgentMatcher');

const router = express.Router();
const prisma = new PrismaClient();

// ─── POST /api/urgent/request ─────────────────────────────────────────────────
// Start an urgent matching session for an existing URGENT consultation
router.post(
  '/request',
  authenticateToken,
  [
    body('consultationId').notEmpty().withMessage('consultationId is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { consultationId } = req.body;

      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
          pet: true,
          owner: { select: { id: true, name: true, avatar: true } },
        },
      });

      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }

      if (consultation.ownerId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      if (consultation.type !== 'URGENT') {
        return res.status(400).json({ success: false, error: 'Consultation is not of type URGENT' });
      }

      if (!['PENDING', 'MATCHING'].includes(consultation.status)) {
        return res.status(400).json({
          success: false,
          error: `Cannot start matching for a consultation with status: ${consultation.status}`,
        });
      }

      // Check if an urgent request already exists
      const existing = await prisma.urgentRequest.findUnique({
        where: { consultationId },
      });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Urgent request already active for this consultation' });
      }

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Update consultation status
      await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: 'NOTIFYING_VETS' },
      });

      const urgentRequest = await prisma.urgentRequest.create({
        data: {
          consultationId,
          notifiedVetIds: [],
          expiresAt,
        },
      });

      // Snapshot sent to vets (exclude sensitive data)
      const consultationSnapshot = {
        id: consultation.id,
        petName: consultation.pet.name,
        petSpecies: consultation.pet.species,
        symptoms: consultation.symptoms,
        urgencyLevel: consultation.urgencyLevel,
        consultationFee: consultation.consultationFee,
        consultMode: consultation.consultMode,
        ownerName: consultation.owner.name,
      };

      // Start the async matching process (non-blocking)
      urgentMatcher.startMatching(urgentRequest.id, consultationId, consultationSnapshot).catch((err) => {
        console.error('[urgentMatcher.startMatching]', err);
      });

      return res.status(201).json({
        success: true,
        data: {
          requestId: urgentRequest.id,
          consultationId,
          expiresAt,
          status: 'NOTIFYING_VETS',
        },
      });
    } catch (err) {
      console.error('[POST /urgent/request]', err);
      return res.status(500).json({ success: false, error: 'Failed to start urgent matching' });
    }
  }
);

// ─── GET /api/urgent/:requestId/status ───────────────────────────────────────
router.get('/:requestId/status', authenticateToken, async (req, res) => {
  try {
    const urgentRequest = await prisma.urgentRequest.findUnique({
      where: { id: req.params.requestId },
      include: {
        consultation: {
          select: {
            id: true, status: true, vetId: true, jitsiRoomId: true,
            ownerId: true,
            vet: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!urgentRequest) {
      return res.status(404).json({ success: false, error: 'Urgent request not found' });
    }

    const isOwner = urgentRequest.consultation.ownerId === req.user.id;
    const isNotifiedVet = urgentRequest.notifiedVetIds.includes(req.user.id);
    const isAcceptedVet = urgentRequest.acceptedVetId === req.user.id;

    if (!isOwner && !isNotifiedVet && !isAcceptedVet && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return res.status(200).json({
      success: true,
      data: {
        requestId: urgentRequest.id,
        consultationId: urgentRequest.consultationId,
        consultationStatus: urgentRequest.consultation.status,
        acceptedVet: urgentRequest.consultation.vet,
        notifiedVetCount: urgentRequest.notifiedVetIds.length,
        acceptedAt: urgentRequest.acceptedAt,
        expiresAt: urgentRequest.expiresAt,
        jitsiRoomId: urgentRequest.consultation.jitsiRoomId,
      },
    });
  } catch (err) {
    console.error('[GET /urgent/:requestId/status]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch request status' });
  }
});

// ─── POST /api/urgent/:requestId/accept ──────────────────────────────────────
// Called by a vet (via HTTP fallback if socket is unavailable)
router.post(
  '/:requestId/accept',
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== 'VET') {
        return res.status(403).json({ success: false, error: 'Only vets can accept urgent requests' });
      }

      const result = await urgentMatcher.vetAcceptsRequest(req.params.requestId, req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          consultationId: result.consultation.id,
          jitsiRoomId: result.jitsiRoomId,
          jitsiToken: result.jitsiToken,
          roomUrl: result.roomUrl,
          ownerToken: result.ownerToken,
        },
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      console.error('[POST /urgent/:requestId/accept]', err);
      return res.status(statusCode).json({ success: false, error: err.message || 'Failed to accept request' });
    }
  }
);

module.exports = router;
