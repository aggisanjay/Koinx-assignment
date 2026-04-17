'use strict';

require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/db');
const { connectRedis, disconnectRedis } = require('./config/nats');
const cryptoRoutes = require('./routes/crypto');

const { storeCryptoStats } = require('./services/cryptoService');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Connect to Redis and subscribe
  await connectRedis();

  // 3. Seed data immediately on startup (no need to wait 15 min for first cron tick)
  console.log('[App] Running initial crypto stats fetch…');
  await storeCryptoStats();

  // 4. Create Express app
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // Crypto routes
  app.use('/', cryptoRoutes);

  // 404 handler
  app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error('[App] Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  });

  // 4. Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`[App] api-server listening on port ${PORT}.`);
  });

  // 5. Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[App] Received ${signal}. Shutting down gracefully…`);
    server.close(async () => {
      await disconnectRedis();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[App] Fatal startup error:', err.message);
  process.exit(1);
});
