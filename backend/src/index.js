'use strict';

require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { Server: SocketIOServer } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

const authRoutes = require('./routes/auth');
const vetsRoutes = require('./routes/vets');
const petsRoutes = require('./routes/pets');
const consultationsRoutes = require('./routes/consultations');
const urgentRoutes = require('./routes/urgent');
const paymentsRoutes = require('./routes/payments');
const communityRoutes = require('./routes/community');
const reviewsRoutes = require('./routes/reviews');

const { registerSocketHandlers } = require('./socket/handlers');
const urgentMatcher = require('./services/urgentMatcher');

// ─── App & HTTP server ────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Make io available to route handlers via req.app.get('io')
app.set('io', io);

// ─── Redis ────────────────────────────────────────────────────────────────────

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 5) return null; // stop retrying
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => console.log('[redis] connected'));
redis.on('error', (err) => console.warn('[redis] error:', err.message));

// ─── Prisma ───────────────────────────────────────────────────────────────────

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// ─── Security middleware ──────────────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

app.use(limiter);

// ─── Body parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', async (req, res) => {
  let dbStatus = 'ok';
  let redisStatus = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  try {
    await redis.ping();
  } catch {
    redisStatus = 'error';
  }

  const healthy = dbStatus === 'ok';
  return res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/vets', vetsRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/urgent', urgentRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/reviews', reviewsRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Socket handlers & matcher init ──────────────────────────────────────────

registerSocketHandlers(io);

// Connect Redis then init the urgent matcher (non-blocking on failure)
redis
  .connect()
  .then(() => {
    urgentMatcher.init(redis, io);
    console.log('[urgentMatcher] initialised');
  })
  .catch((err) => {
    console.warn('[redis] could not connect on startup – urgent matching may be degraded:', err.message);
    // Still init with potentially-disconnected client; retries are configured above
    urgentMatcher.init(redis, io);
  });

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  try {
    await prisma.$connect();
    console.log('[prisma] connected to database');
  } catch (err) {
    console.error('[prisma] failed to connect:', err.message);
    process.exit(1);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Pawpet backend running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    console.log(`[server] Health: http://localhost:${PORT}/health`);
  });
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown(signal) {
  console.log(`[server] ${signal} received – shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    redis.disconnect();
    console.log('[server] shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
