'use strict';

const mongoose = require('mongoose');

/**
 * Schema for storing cryptocurrency statistics.
 * Each document represents a single price snapshot for one coin.
 */
const cryptoStatSchema = new mongoose.Schema(
  {
    coin: {
      type: String,
      required: true,
      enum: ['bitcoin', 'ethereum', 'matic-network'],
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    marketCap: {
      type: Number,
      required: true,
    },
    change24h: {
      type: Number,
      required: true,
    },
    fetchedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    // Disable __v field for cleaner documents
    versionKey: false,
  }
);

// Compound index for efficient per-coin sorted queries
cryptoStatSchema.index({ coin: 1, fetchedAt: -1 });

const CryptoStat = mongoose.model('CryptoStat', cryptoStatSchema);

module.exports = CryptoStat;
