'use strict';

const express = require('express');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const prisma = new PrismaClient();

const PET_SPECIES = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'];
const PET_SEX = ['MALE', 'FEMALE'];

// ─── GET /api/pets  (my pets) ─────────────────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: { pets } });
  } catch (err) {
    console.error('[GET /pets]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch pets' });
  }
});

// ─── POST /api/pets ───────────────────────────────────────────────────────────
router.post(
  '/',
  authenticateToken,
  [
    body('name').trim().notEmpty().withMessage('Pet name is required'),
    body('species').isIn(PET_SPECIES).withMessage(`Species must be one of: ${PET_SPECIES.join(', ')}`),
    body('sex').isIn(PET_SEX).withMessage('Sex must be MALE or FEMALE'),
    body('breed').optional().trim(),
    body('age').optional().isFloat({ min: 0 }).withMessage('Age must be a non-negative number'),
    body('photoUrl').optional().isURL().withMessage('photoUrl must be a valid URL'),
    body('medicalHistory').optional().trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, species, breed, age, sex, photoUrl, medicalHistory } = req.body;

      const pet = await prisma.pet.create({
        data: {
          ownerId: req.user.id,
          name,
          species,
          breed,
          age: age !== undefined ? parseFloat(age) : undefined,
          sex,
          photoUrl,
          medicalHistory,
        },
      });

      return res.status(201).json({ success: true, data: { pet } });
    } catch (err) {
      console.error('[POST /pets]', err);
      return res.status(500).json({ success: false, error: 'Failed to create pet' });
    }
  }
);

// ─── GET /api/pets/:id ────────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pet = await prisma.pet.findUnique({
      where: { id: req.params.id },
      include: {
        consultations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true, type: true, status: true, symptoms: true,
            urgencyLevel: true, createdAt: true, consultationFee: true,
            vet: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    // Only the owner or a vet involved in a related consultation can view
    if (pet.ownerId !== req.user.id && req.user.role === 'PET_OWNER') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return res.status(200).json({ success: true, data: { pet } });
  } catch (err) {
    console.error('[GET /pets/:id]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch pet' });
  }
});

// ─── PUT /api/pets/:id ────────────────────────────────────────────────────────
router.put(
  '/:id',
  authenticateToken,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('species').optional().isIn(PET_SPECIES).withMessage(`Species must be one of: ${PET_SPECIES.join(', ')}`),
    body('sex').optional().isIn(PET_SEX).withMessage('Sex must be MALE or FEMALE'),
    body('age').optional().isFloat({ min: 0 }).withMessage('Age must be a non-negative number'),
    body('photoUrl').optional().isURL().withMessage('photoUrl must be a valid URL'),
    body('breed').optional().trim(),
    body('medicalHistory').optional().trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const existing = await prisma.pet.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Pet not found' });
      }

      if (existing.ownerId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const { name, species, breed, age, sex, photoUrl, medicalHistory } = req.body;

      const pet = await prisma.pet.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(species !== undefined && { species }),
          ...(breed !== undefined && { breed }),
          ...(age !== undefined && { age: parseFloat(age) }),
          ...(sex !== undefined && { sex }),
          ...(photoUrl !== undefined && { photoUrl }),
          ...(medicalHistory !== undefined && { medicalHistory }),
        },
      });

      return res.status(200).json({ success: true, data: { pet } });
    } catch (err) {
      console.error('[PUT /pets/:id]', err);
      return res.status(500).json({ success: false, error: 'Failed to update pet' });
    }
  }
);

module.exports = router;
