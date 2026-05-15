'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const prisma = new PrismaClient();

// ─── POST /api/reviews ────────────────────────────────────────────────────────
router.post(
  '/',
  authenticateToken,
  [
    body('consultationId').notEmpty().withMessage('consultationId is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('rating must be an integer between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('comment must be <= 1000 chars'),
  ],
  validate,
  async (req, res) => {
    try {
      const { consultationId, rating, comment } = req.body;

      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: { review: true },
      });

      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }

      // Only the pet owner who had the consultation can leave a review
      if (consultation.ownerId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Only the consultation owner can leave a review' });
      }

      if (consultation.status !== 'COMPLETED') {
        return res.status(400).json({ success: false, error: 'Can only review completed consultations' });
      }

      if (!consultation.vetId) {
        return res.status(400).json({ success: false, error: 'Consultation has no associated vet' });
      }

      if (consultation.review) {
        return res.status(409).json({ success: false, error: 'Review already submitted for this consultation' });
      }

      // Create review and update vet rating in a transaction
      const [review] = await prisma.$transaction(async (tx) => {
        const newReview = await tx.review.create({
          data: {
            consultationId,
            reviewerId: req.user.id,
            vetId: consultation.vetId,
            rating: parseInt(rating, 10),
            comment,
          },
          include: {
            reviewer: { select: { id: true, name: true, avatar: true } },
            vet: { select: { id: true, name: true, avatar: true } },
          },
        });

        // Recalculate vet's aggregate rating
        const aggregate = await tx.review.aggregate({
          where: { vetId: consultation.vetId },
          _avg: { rating: true },
          _count: { id: true },
        });

        await tx.vetProfile.update({
          where: { userId: consultation.vetId },
          data: {
            rating: parseFloat((aggregate._avg.rating || 5.0).toFixed(1)),
            reviewsCount: aggregate._count.id,
          },
        });

        return [newReview];
      });

      return res.status(201).json({ success: true, data: { review } });
    } catch (err) {
      console.error('[POST /reviews]', err);
      return res.status(500).json({ success: false, error: 'Failed to submit review' });
    }
  }
);

// ─── GET /api/reviews/vet/:vetId ──────────────────────────────────────────────
router.get(
  '/vet/:vetId',
  [param('vetId').notEmpty().withMessage('vetId is required')],
  validate,
  async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;

      // Verify vet exists
      const vet = await prisma.user.findUnique({
        where: { id: req.params.vetId },
        select: { id: true, role: true },
      });

      if (!vet || vet.role !== 'VET') {
        return res.status(404).json({ success: false, error: 'Vet not found' });
      }

      const [reviews, total] = await prisma.$transaction([
        prisma.review.findMany({
          where: { vetId: req.params.vetId },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit, 10),
          skip: parseInt(offset, 10),
          include: {
            reviewer: { select: { id: true, name: true, avatar: true } },
          },
        }),
        prisma.review.count({ where: { vetId: req.params.vetId } }),
      ]);

      const aggregate = await prisma.review.aggregate({
        where: { vetId: req.params.vetId },
        _avg: { rating: true },
      });

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          total,
          averageRating: aggregate._avg.rating
            ? parseFloat(aggregate._avg.rating.toFixed(1))
            : null,
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10),
        },
      });
    } catch (err) {
      console.error('[GET /reviews/vet/:vetId]', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
    }
  }
);

module.exports = router;
