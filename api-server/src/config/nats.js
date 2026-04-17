'use strict';

const Redis = require('ioredis');
const { storeCryptoStats } = require('../services/cryptoService');

const CHANNEL = 'crypto.update';

let subscriber = null;

/**
 * Connects to Redis and subscribes to the crypto.update channel.
 * On receiving a trigger message, runs storeCryptoStats().
 */
async function connectRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  subscriber = new Redis(redisUrl);

  subscriber.on('connect', () => {
    console.log(`[Redis] Subscriber connected.`);
  });

  subscriber.on('error', (err) => {
    console.error('[Redis] Subscriber error:', err.message);
  });

  await subscriber.subscribe(CHANNEL);
  console.log(`[Redis] Subscribed to channel: "${CHANNEL}".`);

  subscriber.on('message', async (channel, message) => {
    if (channel !== CHANNEL) return;
    try {
      const data = JSON.parse(message);
      console.log(`[Redis] Received message on "${CHANNEL}":`, data);
      if (data.trigger === 'update') {
        await storeCryptoStats();
      }
    } catch (err) {
      console.error('[Redis] Error processing message:', err.message);
    }
  });
}

/**
 * Gracefully disconnects the Redis subscriber.
 */
async function disconnectRedis() {
  if (subscriber) {
    await subscriber.quit();
    console.log('[Redis] Subscriber disconnected.');
  }
}

module.exports = { connectRedis, disconnectRedis };
