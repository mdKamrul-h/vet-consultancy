'use strict';

const express = require('express');
const { query, body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/vets ─────────────────────────────────────────────────────────────
// Query params: isOnline, specialty, consultType (VIDEO|CHAT), sort (rating|fee_asc|fee_desc|experience)
router.get(
  '/',
  [
    query('isOnline').optional().isBoolean().withMessage('isOnline must be true or false'),
    query('sort')
      .optional()
      .isIn(['rating', 'fee_asc', 'fee_desc', 'experience'])
      .withMessage('Invalid sort option'),
  ],
  validate,
  async (req, res) => {
    try {
      const { isOnline, specialty, sort } = req.query;

      const where = {};

      if (isOnline !== undefined) {
        where.isOnline = isOnline === 'true';
      }

      if (specialty) {
        where.specialty = { contains: specialty, mode: 'insensitive' };
      }

      const orderBy = buildOrderBy(sort);

      const vetProfiles = await prisma.vetProfile.findMany({
        where,
        orderBy,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true },
          },
        },
      });

      const vets = vetProfiles.map(formatVet);

      return res.status(200).json({ success: true, data: { vets, total: vets.length } });
    } catch (err) {
      console.error('[GET /vets]', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch vets' });
    }
  }
);

// ─── GET /api/vets/me/status ──────────────────────────────────────────────────
// Must be placed before /:id to avoid route conflict
router.get('/me/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'VET') {
      return res.status(403).json({ success: false, error: 'Only vets can access this endpoint' });
    }

    const profile = await prisma.vetProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Vet profile not found' });
    }

    return res.status(200).json({ success: true, data: { isOnline: profile.isOnline } });
  } catch (err) {
    console.error('[GET /vets/me/status]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch status' });
  }
});

// ─── PATCH /api/vets/me/status ────────────────────────────────────────────────
router.patch(
  '/me/status',
  authenticateToken,
  [body('isOnline').isBoolean().withMessage('isOnline must be a boolean')],
  validate,
  async (req, res) => {
    try {
      if (req.user.role !== 'VET') {
        return res.status(403).json({ success: false, error: 'Only vets can update status' });
      }

      const { isOnline } = req.body;

      const profile = await prisma.vetProfile.update({
        where: { userId: req.user.id },
        data: { isOnline },
      });

      // Broadcast via socket if available
      const io = req.app.get('io');
      if (io) {
        io.emit('vet:status_changed', { vetId: req.user.id, isOnline });
      }

      return res.status(200).json({ success: true, data: { isOnline: profile.isOnline } });
    } catch (err) {
      console.error('[PATCH /vets/me/status]', err);
      return res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  }
);

// ─── GET /api/vets/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const vetProfile = await prisma.vetProfile.findFirst({
      where: { userId: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true },
        },
      },
    });

    if (!vetProfile) {
      return res.status(404).json({ success: false, error: 'Vet not found' });
    }

    // Include recent reviews
    const reviews = await prisma.review.findMany({
      where: { vetId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: { vet: formatVet(vetProfile), reviews },
    });
  } catch (err) {
    console.error('[GET /vets/:id]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch vet' });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVet(profile) {
  const { user, ...vetData } = profile;
  return { ...user, vetProfile: vetData };
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'fee_asc':
      return { consultationFee: 'asc' };
    case 'fee_desc':
      return { consultationFee: 'desc' };
    case 'experience':
      return { experienceYears: 'desc' };
    case 'rating':
    default:
      return { rating: 'desc' };
  }
}

module.exports = router;
