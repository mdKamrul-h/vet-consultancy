'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { validate } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'pawpet-super-secret-jwt-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function safeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role')
      .optional()
      .isIn(['PET_OWNER', 'VET'])
      .withMessage('Role must be PET_OWNER or VET'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, name, role = 'PET_OWNER' } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, passwordHash, name, role },
      });

      const token = signToken(user);

      return res.status(201).json({
        success: true,
        data: { user: safeUser(user), token },
      });
    } catch (err) {
      console.error('[POST /auth/register]', err);
      return res.status(500).json({ success: false, error: 'Registration failed' });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { vetProfile: true },
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = signToken(user);

      return res.status(200).json({
        success: true,
        data: { user: safeUser(user), token },
      });
    } catch (err) {
      console.error('[POST /auth/login]', err);
      return res.status(500).json({ success: false, error: 'Login failed' });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vetProfile: true,
        pets: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: { user: safeUser(user) } });
  } catch (err) {
    console.error('[GET /auth/me]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

module.exports = router;
