'use strict';

require('dotenv').config();

const { connectRedis, disconnectRedis } = require('./config/nats');
const { startTriggerJob } = require('./jobs/triggerJob');

async function bootstrap() {
  // Connect to NATS before scheduling the job
  await connectRedis();

  // Start the 15-minute cron job
  startTriggerJob();

  console.log('[App] worker-server is running.');

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[App] Received ${signal}. Shutting down gracefully…`);
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[App] Fatal startup error:', err.message);
  process.exit(1);
});
