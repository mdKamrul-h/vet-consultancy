'use strict';

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const urgentMatcher = require('../services/urgentMatcher');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'pawpet-super-secret-jwt-key-2024';

/**
 * Authenticate a socket connection via the `token` query parameter.
 * Returns the decoded JWT payload or null.
 */
function authenticateSocket(socket) {
  const token = socket.handshake.query.token || socket.handshake.auth.token;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

/**
 * Register all Socket.io event handlers.
 * @param {import('socket.io').Server} io
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const user = authenticateSocket(socket);

    if (!user) {
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect(true);
      return;
    }

    console.log(`[socket] connected: ${user.id} (${user.role}) – socket ${socket.id}`);

    // Always join the personal user room so we can send targeted events
    socket.join(`user:${user.id}`);

    // ── consultation:join ────────────────────────────────────────────────────
    socket.on('consultation:join', async ({ consultationId }) => {
      if (!consultationId) return;

      try {
        // Verify the user actually belongs to this consultation
        const consultation = await prisma.consultation.findUnique({
          where: { id: consultationId },
          select: { ownerId: true, vetId: true },
        });

        if (!consultation) return;

        const isParticipant =
          consultation.ownerId === user.id || consultation.vetId === user.id;

        if (!isParticipant && user.role !== 'ADMIN') return;

        socket.join(`consultation:${consultationId}`);
        socket.emit('consultation:joined', { consultationId });
        console.log(`[socket] ${user.id} joined room consultation:${consultationId}`);
      } catch (err) {
        console.error('[socket] consultation:join error', err);
      }
    });

    // ── message:send ─────────────────────────────────────────────────────────
    socket.on('message:send', async ({ consultationId, content, messageType = 'TEXT' }) => {
      if (!consultationId || !content) return;

      try {
        const consultation = await prisma.consultation.findUnique({
          where: { id: consultationId },
          select: { ownerId: true, vetId: true, status: true },
        });

        if (!consultation) return;

        const isParticipant =
          consultation.ownerId === user.id || consultation.vetId === user.id;

        if (!isParticipant) return;

        if (!['IN_PROGRESS', 'VET_ACCEPTED'].includes(consultation.status)) {
          socket.emit('error', { message: 'Consultation is not active' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            consultationId,
            senderId: user.id,
            content,
            messageType,
          },
          include: { sender: { select: { id: true, name: true, avatar: true } } },
        });

        // Broadcast to the consultation room
        io.to(`consultation:${consultationId}`).emit('message:received', {
          id: message.id,
          consultationId,
          sender: message.sender,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error('[socket] message:send error', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── urgent:vet_action ────────────────────────────────────────────────────
    socket.on('urgent:vet_action', async ({ requestId, action }) => {
      if (user.role !== 'VET') {
        socket.emit('error', { message: 'Only vets can perform this action' });
        return;
      }

      if (!requestId || !['accept', 'decline'].includes(action)) return;

      if (action === 'decline') {
        // Nothing to do server-side for decline; client just stops showing the modal
        socket.emit('urgent:vet_action_ack', { requestId, action: 'decline' });
        return;
      }

      // action === 'accept'
      try {
        const result = await urgentMatcher.vetAcceptsRequest(requestId, user.id);

        socket.emit('urgent:vet_action_ack', {
          requestId,
          action: 'accept',
          consultationId: result.consultation.id,
          jitsiRoomId: result.jitsiRoomId,
          jitsiToken: result.jitsiToken,
          roomUrl: result.roomUrl,
        });
      } catch (err) {
        const msg = err.message || 'Failed to accept urgent request';
        socket.emit('error', { message: msg });
      }
    });

    // ── vet:status_change ────────────────────────────────────────────────────
    socket.on('vet:status_change', async ({ isOnline }) => {
      if (user.role !== 'VET') return;

      try {
        await prisma.vetProfile.update({
          where: { userId: user.id },
          data: { isOnline: Boolean(isOnline) },
        });

        // Broadcast to all connected clients so the vet list updates live
        io.emit('vet:status_changed', { vetId: user.id, isOnline: Boolean(isOnline) });
        console.log(`[socket] vet ${user.id} is now ${isOnline ? 'online' : 'offline'}`);
      } catch (err) {
        console.error('[socket] vet:status_change error', err);
      }
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`[socket] disconnected: ${user.id} – socket ${socket.id}`);

      // If a vet disconnects, mark them offline
      if (user.role === 'VET') {
        // Only mark offline if they have no other active sockets
        const socketsInRoom = await io.in(`user:${user.id}`).fetchSockets();
        if (socketsInRoom.length === 0) {
          try {
            await prisma.vetProfile.update({
              where: { userId: user.id },
              data: { isOnline: false },
            });
            io.emit('vet:status_changed', { vetId: user.id, isOnline: false });
          } catch (_) {
            // vet profile may not exist yet; ignore
          }
        }
      }
    });
  });
}

module.exports = { registerSocketHandlers };
