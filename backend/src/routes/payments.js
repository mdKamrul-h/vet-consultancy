'use strict';

const express = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const prisma = new PrismaClient();

const PAYMENT_METHODS = ['CARD', 'BKASH', 'NAGAD', 'MOBILE_BANKING'];

// ─── POST /api/payments ───────────────────────────────────────────────────────
// Initiate a payment for a consultation
router.post(
  '/',
  authenticateToken,
  [
    body('consultationId').notEmpty().withMessage('consultationId is required'),
    body('method')
      .isIn(PAYMENT_METHODS)
      .withMessage(`method must be one of: ${PAYMENT_METHODS.join(', ')}`),
  ],
  validate,
  async (req, res) => {
    try {
      const { consultationId, method } = req.body;

      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: { payment: true },
      });

      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }

      if (consultation.ownerId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      if (consultation.payment && consultation.payment.status === 'CONFIRMED') {
        return res.status(409).json({ success: false, error: 'Payment already confirmed for this consultation' });
      }

      const amount =
        consultation.consultationFee +
        consultation.platformFee -
        consultation.promoDiscount;

      let payment;

      if (consultation.payment) {
        // Update existing pending payment
        payment = await prisma.payment.update({
          where: { consultationId },
          data: { method, amount, status: 'PENDING', transactionId: null },
        });
      } else {
        payment = await prisma.payment.create({
          data: {
            consultationId,
            amount,
            method,
            status: 'PENDING',
          },
        });
      }

      // In a real system, this is where you'd call the payment gateway API.
      // We return a mock checkout token that the frontend would use.
      const checkoutToken = uuidv4();

      return res.status(201).json({
        success: true,
        data: {
          payment,
          amount,
          checkoutToken,
          redirectUrl: `${process.env.PAYMENT_GATEWAY_URL || 'https://pay.pawpet.local'}/checkout/${checkoutToken}`,
          instructions: getPaymentInstructions(method),
        },
      });
    } catch (err) {
      console.error('[POST /payments]', err);
      return res.status(500).json({ success: false, error: 'Failed to initiate payment' });
    }
  }
);

// ─── POST /api/payments/:id/confirm ──────────────────────────────────────────
// Confirm a payment (called by payment gateway webhook or manually for testing)
router.post(
  '/:id/confirm',
  authenticateToken,
  [
    body('transactionId').notEmpty().withMessage('transactionId is required'),
    body('status')
      .optional()
      .isIn(['CONFIRMED', 'FAILED'])
      .withMessage('status must be CONFIRMED or FAILED'),
  ],
  validate,
  async (req, res) => {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
        include: { consultation: true },
      });

      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }

      if (payment.consultation.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      if (payment.status === 'CONFIRMED') {
        return res.status(409).json({ success: false, error: 'Payment already confirmed' });
      }

      const { transactionId, status = 'CONFIRMED' } = req.body;

      const updatedPayment = await prisma.payment.update({
        where: { id: req.params.id },
        data: { status, transactionId },
      });

      // If payment confirmed, move consultation to IN_PROGRESS (for REGULAR) or keep VET_ACCEPTED
      if (status === 'CONFIRMED') {
        const consultation = payment.consultation;
        const nextStatus =
          consultation.status === 'VET_ACCEPTED' ? 'IN_PROGRESS' : consultation.status;

        await prisma.consultation.update({
          where: { id: consultation.id },
          data: { status: nextStatus },
        });

        const io = req.app.get('io');
        if (io) {
          io.to(`consultation:${consultation.id}`).emit('consultation:status_changed', {
            consultationId: consultation.id,
            status: nextStatus,
            paymentConfirmed: true,
          });
        }
      }

      return res.status(200).json({ success: true, data: { payment: updatedPayment } });
    } catch (err) {
      console.error('[POST /payments/:id/confirm]', err);
      return res.status(500).json({ success: false, error: 'Failed to confirm payment' });
    }
  }
);

// ─── GET /api/payments/:id ────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { consultation: { select: { ownerId: true, vetId: true } } },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const isParticipant =
      payment.consultation.ownerId === req.user.id ||
      payment.consultation.vetId === req.user.id ||
      req.user.role === 'ADMIN';

    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return res.status(200).json({ success: true, data: { payment } });
  } catch (err) {
    console.error('[GET /payments/:id]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch payment' });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPaymentInstructions(method) {
  const instructions = {
    BKASH: 'Send money to: 01700-000000. Use reference: PAWPET. Then confirm above.',
    NAGAD: 'Send money to: 01700-111111. Use reference: PAWPET. Then confirm above.',
    MOBILE_BANKING: 'Transfer to account 1234567890. Reference: PAWPET. Then confirm above.',
    CARD: 'You will be redirected to the secure card payment page.',
  };
  return instructions[method] || 'Follow on-screen payment instructions.';
}

module.exports = router;
