'use strict';

const { PrismaClient } = require('@prisma/client');
const { createJitsiSession } = require('./jitsi');

const prisma = new PrismaClient();

// Redis and io are injected after initialisation to avoid circular deps
let redisClient = null;
let ioInstance = null;

const REQUEST_TTL_SECONDS = 300; // 5 minutes total request window
const NOTIFY_INTERVAL_MS = 30_000; // re-notify every 30 seconds

/**
 * Inject dependencies after startup.
 * @param {import('ioredis').Redis} redis
 * @param {import('socket.io').Server} io
 */
function init(redis, io) {
  redisClient = redis;
  ioInstance = io;
}

// ─── Redis key helpers ────────────────────────────────────────────────────────

function requestKey(requestId) {
  return `urgent:request:${requestId}`;
}

function notifiedKey(requestId) {
  return `urgent:notified:${requestId}`;
}

// ─── Core matching logic ──────────────────────────────────────────────────────

/**
 * Start the urgent matching process for a newly created UrgentRequest.
 * Notifies all currently online vets via Socket.io.
 *
 * @param {string} requestId   - UrgentRequest.id
 * @param {string} consultationId
 * @param {object} consultationSnapshot - safe subset to send to vets
 */
async function startMatching(requestId, consultationId, consultationSnapshot) {
  if (!redisClient || !ioInstance) {
    throw new Error('urgentMatcher not initialised – call init() first');
  }

  // Persist request metadata in Redis with TTL
  await redisClient.setex(
    requestKey(requestId),
    REQUEST_TTL_SECONDS,
    JSON.stringify({ consultationId, consultationSnapshot, status: 'waiting' })
  );

  // First notification round
  await notifyOnlineVets(requestId, consultationSnapshot);

  // Schedule re-notification rounds every 30 s until TTL
  const intervalHandle = setInterval(async () => {
    const raw = await redisClient.get(requestKey(requestId));
    if (!raw) {
      clearInterval(intervalHandle);
      return;
    }

    const state = JSON.parse(raw);
    if (state.status !== 'waiting') {
      clearInterval(intervalHandle);
      return;
    }

    await notifyOnlineVets(requestId, consultationSnapshot);
  }, NOTIFY_INTERVAL_MS);

  // Auto-cancel after TTL
  setTimeout(async () => {
    clearInterval(intervalHandle);
    const raw = await redisClient.get(requestKey(requestId));
    if (!raw) return;
    const state = JSON.parse(raw);
    if (state.status === 'waiting') {
      await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: 'CANCELLED' },
      });
      ioInstance.to(`consultation:${consultationId}`).emit('consultation:status_changed', {
        consultationId,
        status: 'CANCELLED',
        reason: 'No vet available – request expired',
      });
      await redisClient.del(requestKey(requestId));
      await redisClient.del(notifiedKey(requestId));
    }
  }, REQUEST_TTL_SECONDS * 1000);
}

/**
 * Notify online vets that have not yet been notified about this request.
 */
async function notifyOnlineVets(requestId, consultationSnapshot) {
  // Get all online vets
  const onlineVets = await prisma.user.findMany({
    where: { role: 'VET', vetProfile: { isOnline: true } },
    select: { id: true, name: true },
  });

  if (onlineVets.length === 0) return;

  // Track already-notified vet IDs in Redis set
  const alreadyNotified = await redisClient.smembers(notifiedKey(requestId));

  const newVets = onlineVets.filter((v) => !alreadyNotified.includes(v.id));
  if (newVets.length === 0) {
    // All online vets already notified – re-notify everyone as a reminder
    for (const vet of onlineVets) {
      ioInstance.to(`user:${vet.id}`).emit('urgent:vet_notified', {
        requestId,
        reminder: true,
        consultation: consultationSnapshot,
      });
    }
    return;
  }

  const pipeline = redisClient.pipeline();
  for (const vet of newVets) {
    pipeline.sadd(notifiedKey(requestId), vet.id);
    ioInstance.to(`user:${vet.id}`).emit('urgent:vet_notified', {
      requestId,
      reminder: false,
      consultation: consultationSnapshot,
    });
  }
  pipeline.expire(notifiedKey(requestId), REQUEST_TTL_SECONDS);
  await pipeline.exec();

  // Also persist notified vet IDs in the DB
  const allNotifiedIds = [...new Set([...alreadyNotified, ...newVets.map((v) => v.id)])];
  await prisma.urgentRequest.update({
    where: { id: requestId },
    data: { notifiedVetIds: allNotifiedIds },
  });
}

/**
 * Handle a vet accepting an urgent request.
 *
 * @param {string} requestId
 * @param {string} vetUserId
 * @returns {{ consultation: object, jitsiRoomId: string, jitsiToken: string }}
 */
async function vetAcceptsRequest(requestId, vetUserId) {
  if (!redisClient || !ioInstance) {
    throw new Error('urgentMatcher not initialised');
  }

  const raw = await redisClient.get(requestKey(requestId));
  if (!raw) {
    throw Object.assign(new Error('Request expired or not found'), { statusCode: 404 });
  }

  const state = JSON.parse(raw);
  if (state.status !== 'waiting') {
    throw Object.assign(new Error('Request already accepted or cancelled'), { statusCode: 409 });
  }

  // Atomically mark as accepted
  state.status = 'accepted';
  await redisClient.setex(requestKey(requestId), 60, JSON.stringify(state)); // short TTL after accept

  const urgentRequest = await prisma.urgentRequest.findUnique({
    where: { id: requestId },
    include: { consultation: { include: { owner: true, pet: true } } },
  });

  if (!urgentRequest) {
    throw Object.assign(new Error('Urgent request record not found'), { statusCode: 404 });
  }

  const vet = await prisma.user.findUnique({ where: { id: vetUserId } });
  if (!vet) {
    throw Object.assign(new Error('Vet not found'), { statusCode: 404 });
  }

  const { consultation } = urgentRequest;

  // Build Jitsi session
  const { roomName, ownerToken, vetToken, roomUrl } = createJitsiSession({
    consultationId: consultation.id,
    owner: { id: consultation.owner.id, name: consultation.owner.name, avatar: consultation.owner.avatar },
    vet: { id: vet.id, name: vet.name, avatar: vet.avatar },
  });

  // Update DB: UrgentRequest + Consultation
  const [updatedRequest, updatedConsultation] = await prisma.$transaction([
    prisma.urgentRequest.update({
      where: { id: requestId },
      data: { acceptedVetId: vetUserId, acceptedAt: new Date() },
    }),
    prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        vetId: vetUserId,
        status: 'VET_ACCEPTED',
        jitsiRoomId: roomName,
        jitsiToken: ownerToken, // store owner token; vet token returned directly
      },
    }),
  ]);

  // Notify the owner
  ioInstance.to(`user:${consultation.ownerId}`).emit('urgent:vet_accepted', {
    requestId,
    consultationId: consultation.id,
    vet: { id: vet.id, name: vet.name, avatar: vet.avatar },
  });

  // Notify all parties the session is ready
  ioInstance.to(`consultation:${consultation.id}`).emit('urgent:session_ready', {
    consultationId: consultation.id,
    jitsiRoomId: roomName,
    roomUrl,
    ownerToken,
    vetToken,
  });

  // Inform other notified vets the request is taken
  const notifiedIds = await redisClient.smembers(notifiedKey(requestId));
  for (const vid of notifiedIds) {
    if (vid !== vetUserId) {
      ioInstance.to(`user:${vid}`).emit('urgent:request_taken', { requestId });
    }
  }

  // Cleanup Redis
  await redisClient.del(requestKey(requestId));
  await redisClient.del(notifiedKey(requestId));

  return {
    consultation: updatedConsultation,
    jitsiRoomId: roomName,
    jitsiToken: vetToken,
    roomUrl,
    ownerToken,
  };
}

module.exports = { init, startMatching, vetAcceptsRequest };
