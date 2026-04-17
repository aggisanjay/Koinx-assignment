'use strict';

const Redis = require('ioredis');

const CHANNEL = 'crypto.update';

let publisher = null;

/**
 * Connects to Redis for publishing.
 */
async function connectRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  publisher = new Redis(redisUrl);

  publisher.on('connect', () => {
    console.log(`[Redis] Publisher connected.`);
  });

  publisher.on('error', (err) => {
    console.error('[Redis] Publisher error:', err.message);
  });
}

/**
 * Publishes a trigger message to the crypto.update channel.
 */
async function publishTrigger() {
  if (!publisher) {
    console.error('[Redis] Cannot publish – connection not established.');
    return;
  }

  const message = JSON.stringify({ trigger: 'update' });
  await publisher.publish(CHANNEL, message);
  console.log(`[Redis] Published trigger to "${CHANNEL}" at ${new Date().toISOString()}.`);
}

/**
 * Gracefully disconnects the Redis publisher.
 */
async function disconnectRedis() {
  if (publisher) {
    await publisher.quit();
    console.log('[Redis] Publisher disconnected.');
  }
}

module.exports = { connectRedis, publishTrigger, disconnectRedis };
