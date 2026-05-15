'use strict';

const express = require('express');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { generateJitsiToken } = require('../services/jitsi');

const router = express.Router();
const prisma = new PrismaClient();

const VALID_STATUSES = ['PENDING', 'MATCHING', 'NOTIFYING_VETS', 'VET_ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const URGENCY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// ─── POST /api/consultations ──────────────────────────────────────────────────
router.post(
  '/',
  authenticateToken,
  [
    body('petId').notEmpty().withMessage('petId is required'),
    body('type').isIn(['URGENT', 'REGULAR']).withMessage('type must be URGENT or REGULAR'),
    body('symptoms').trim().notEmpty().withMessage('symptoms description is required'),
    body('urgencyLevel').optional().isIn(URGENCY_LEVELS).withMessage(`urgencyLevel must be one of: ${URGENCY_LEVELS.join(', ')}`),
    body('vetId').optional().isString(),
    body('scheduledTime').optional().isISO8601().withMessage('scheduledTime must be a valid ISO8601 date'),
    body('consultMode').optional().isIn(['VIDEO', 'CHAT']).withMessage('consultMode must be VIDEO or CHAT'),
    body('consultationFee').isInt({ min: 0 }).withMessage('consultationFee must be a non-negative integer'),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        petId,
        type,
        symptoms,
        urgencyLevel = 'MEDIUM',
        vetId,
        scheduledTime,
        consultMode = 'VIDEO',
        consultationFee,
        promoDiscount = 0,
        platformFee = 50,
      } = req.body;

      // Verify the pet belongs to this user
      const pet = await prisma.pet.findUnique({ where: { id: petId } });
      if (!pet) {
        return res.status(404).json({ success: false, error: 'Pet not found' });
      }
      if (pet.ownerId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'This pet does not belong to you' });
      }

      // For REGULAR consultations a vetId is expected
      if (type === 'REGULAR' && vetId) {
        const vet = await prisma.user.findUnique({ where: { id: vetId } });
        if (!vet || vet.role !== 'VET') {
          return res.status(400).json({ success: false, error: 'Selected vet not found' });
        }
      }

      const consultation = await prisma.consultation.create({
        data: {
          petId,
          ownerId: req.user.id,
          vetId: type === 'REGULAR' ? (vetId || null) : null,
          type,
          status: type === 'URGENT' ? 'MATCHING' : 'PENDING',
          symptoms,
          urgencyLevel,
          scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
          consultMode,
          consultationFee: parseInt(consultationFee, 10),
          platformFee: parseInt(platformFee, 10),
          promoDiscount: parseInt(promoDiscount, 10),
        },
        include: {
          pet: true,
          owner: { select: { id: true, name: true, email: true, avatar: true } },
          vet: { select: { id: true, name: true, avatar: true } },
        },
      });

      return res.status(201).json({ success: true, data: { consultation } });
    } catch (err) {
      console.error('[POST /consultations]', err);
      return res.status(500).json({ success: false, error: 'Failed to create consultation' });
    }
  }
);

// ─── GET /api/consultations/my ────────────────────────────────────────────────
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { status, type } = req.query;

    const where = {};

    if (req.user.role === 'VET') {
      where.vetId = req.user.id;
    } else {
      where.ownerId = req.user.id;
    }

    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    }

    if (type && ['URGENT', 'REGULAR'].includes(type)) {
      where.type = type;
    }

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pet: true,
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        vet: { select: { id: true, name: true, avatar: true } },
        payment: true,
        review: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { consultations, total: consultations.length },
    });
  } catch (err) {
    console.error('[GET /consultations/my]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch consultations' });
  }
});

// ─── GET /api/consultations/:id ───────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const consultation = await prisma.consultation.findUnique({
      where: { id: req.params.id },
      include: {
        pet: true,
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        vet: { select: { id: true, name: true, avatar: true } },
        payment: true,
        review: true,
        urgentRequest: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!consultation) {
      return res.status(404).json({ success: false, error: 'Consultation not found' });
    }

    const isParticipant =
      consultation.ownerId === req.user.id ||
      consultation.vetId === req.user.id ||
      req.user.role === 'ADMIN';

    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return res.status(200).json({ success: true, data: { consultation } });
  } catch (err) {
    console.error('[GET /consultations/:id]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch consultation' });
  }
});

// ─── PATCH /api/consultations/:id/status ─────────────────────────────────────
router.patch(
  '/:id/status',
  authenticateToken,
  [
    body('status')
      .isIn(VALID_STATUSES)
      .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
  ],
  validate,
  async (req, res) => {
    try {
      const consultation = await prisma.consultation.findUnique({
        where: { id: req.params.id },
      });

      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }

      const isParticipant =
        consultation.ownerId === req.user.id ||
        consultation.vetId === req.user.id ||
        req.user.role === 'ADMIN';

      if (!isParticipant) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const { status } = req.body;

      const updated = await prisma.consultation.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          pet: true,
          owner: { select: { id: true, name: true, email: true, avatar: true } },
          vet: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Notify participants via socket
      const io = req.app.get('io');
      if (io) {
        io.to(`consultation:${updated.id}`).emit('consultation:status_changed', {
          consultationId: updated.id,
          status: updated.status,
        });
      }

      return res.status(200).json({ success: true, data: { consultation: updated } });
    } catch (err) {
      console.error('[PATCH /consultations/:id/status]', err);
      return res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  }
);

// ─── GET /api/consultations/:id/room ─────────────────────────────────────────
// Returns Jitsi room info and a fresh JWT for the requesting user
router.get('/:id/room', authenticateToken, async (req, res) => {
  try {
    const consultation = await prisma.consultation.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        vet: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!consultation) {
      return res.status(404).json({ success: false, error: 'Consultation not found' });
    }

    const isParticipant =
      consultation.ownerId === req.user.id || consultation.vetId === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (!consultation.jitsiRoomId) {
      return res.status(400).json({
        success: false,
        error: 'Video room not yet created for this consultation',
      });
    }

    const isModerator = consultation.vetId === req.user.id;
    const { token, roomUrl } = generateJitsiToken({
      roomName: consultation.jitsiRoomId,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: isModerator
        ? (consultation.vet?.avatar || '')
        : (consultation.owner?.avatar || ''),
      isModerator,
    });

    return res.status(200).json({
      success: true,
      data: {
        roomName: consultation.jitsiRoomId,
        token,
        roomUrl,
        domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
      },
    });
  } catch (err) {
    console.error('[GET /consultations/:id/room]', err);
    return res.status(500).json({ success: false, error: 'Failed to get room info' });
  }
});

module.exports = router;
