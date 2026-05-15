'use strict';

const express = require('express');
const { body, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const prisma = new PrismaClient();

const CATEGORIES = [
  'ALL', 'URGENT_RESCUE', 'LOST_FOUND', 'ADOPTION',
  'MEDICAL_HELP', 'FOSTER_NEEDED', 'VET_CONSULTANCY',
  'SUPPLIES', 'SUCCESS_STORIES',
];

// ─── GET /api/community/posts ─────────────────────────────────────────────────
router.get(
  '/posts',
  optionalAuth,
  [
    query('category').optional().isIn(CATEGORIES).withMessage(`Invalid category`),
    query('status').optional().isIn(['ACTIVE', 'CLOSED']).withMessage('Invalid status'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be >= 0'),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        category,
        status = 'ACTIVE',
        limit = 20,
        offset = 0,
      } = req.query;

      const where = {};

      if (category && category !== 'ALL') {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      const [posts, total] = await prisma.$transaction([
        prisma.communityPost.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit, 10),
          skip: parseInt(offset, 10),
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
          },
        }),
        prisma.communityPost.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: { posts, total, limit: parseInt(limit, 10), offset: parseInt(offset, 10) },
      });
    } catch (err) {
      console.error('[GET /community/posts]', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
  }
);

// ─── POST /api/community/posts ────────────────────────────────────────────────
router.post(
  '/posts',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    body('content').trim().notEmpty().withMessage('content is required'),
    body('category').isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),
    body('location').optional().trim(),
    body('imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL'),
  ],
  validate,
  async (req, res) => {
    try {
      const { title, content, category, location, imageUrl } = req.body;

      const post = await prisma.communityPost.create({
        data: {
          authorId: req.user.id,
          title,
          content,
          category: category === 'ALL' ? 'ALL' : category,
          location,
          imageUrl,
        },
        include: {
          author: { select: { id: true, name: true, avatar: true, role: true } },
        },
      });

      return res.status(201).json({ success: true, data: { post } });
    } catch (err) {
      console.error('[POST /community/posts]', err);
      return res.status(500).json({ success: false, error: 'Failed to create post' });
    }
  }
);

// ─── GET /api/community/posts/:id ────────────────────────────────────────────
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Increment response count view tracking could be added here
    return res.status(200).json({ success: true, data: { post } });
  } catch (err) {
    console.error('[GET /community/posts/:id]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch post' });
  }
});

// ─── PATCH /api/community/posts/:id/status ────────────────────────────────────
router.patch(
  '/posts/:id/status',
  authenticateToken,
  [body('status').isIn(['ACTIVE', 'CLOSED']).withMessage('status must be ACTIVE or CLOSED')],
  validate,
  async (req, res) => {
    try {
      const post = await prisma.communityPost.findUnique({ where: { id: req.params.id } });

      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const updated = await prisma.communityPost.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
        include: {
          author: { select: { id: true, name: true, avatar: true, role: true } },
        },
      });

      return res.status(200).json({ success: true, data: { post: updated } });
    } catch (err) {
      console.error('[PATCH /community/posts/:id/status]', err);
      return res.status(500).json({ success: false, error: 'Failed to update post status' });
    }
  }
);

// ─── PATCH /api/community/posts/:id/respond ──────────────────────────────────
// Increment response count (called when someone replies to a post)
router.patch('/posts/:id/respond', authenticateToken, async (req, res) => {
  try {
    const post = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: { responseCount: { increment: 1 } },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    return res.status(200).json({ success: true, data: { post } });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    console.error('[PATCH /community/posts/:id/respond]', err);
    return res.status(500).json({ success: false, error: 'Failed to update response count' });
  }
});

module.exports = router;
