'use strict';

const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB.
 * Exits the process on unrecoverable connection errors.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('[DB] Connected to MongoDB successfully.');
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected. Attempting to reconnect…');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected.');
  });
}

module.exports = { connectDB };
