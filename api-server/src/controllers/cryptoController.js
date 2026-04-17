'use strict';

const CryptoStat = require('../models/CryptoStat');

const VALID_COINS = new Set(['bitcoin', 'ethereum', 'matic-network']);

/**
 * Calculates the population standard deviation of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
function calcStdDeviation(values) {
  const n = values.length;
  if (n === 0) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  return Math.sqrt(variance);
}

/**
 * GET /stats?coin=<coin>
 * Returns the latest price, marketCap, and 24hChange for the requested coin.
 */
async function getStats(req, res) {
  const { coin } = req.query;

  if (!coin || !VALID_COINS.has(coin)) {
    return res.status(400).json({
      error: `Invalid coin. Must be one of: ${[...VALID_COINS].join(', ')}.`,
    });
  }

  try {
    const latest = await CryptoStat.findOne({ coin })
      .sort({ fetchedAt: -1 })
      .select('price marketCap change24h -_id')
      .lean();

    if (!latest) {
      return res.status(404).json({
        error: `No data found for coin: ${coin}. The background job may not have run yet.`,
      });
    }

    return res.status(200).json({
      price: latest.price,
      marketCap: latest.marketCap,
      '24hChange': latest.change24h,
    });
  } catch (err) {
    console.error('[Controller] getStats error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * GET /deviation?coin=<coin>
 * Returns the standard deviation of the price across the last 100 stored records
 * for the requested coin.
 */
async function getDeviation(req, res) {
  const { coin } = req.query;

  if (!coin || !VALID_COINS.has(coin)) {
    return res.status(400).json({
      error: `Invalid coin. Must be one of: ${[...VALID_COINS].join(', ')}.`,
    });
  }

  try {
    const records = await CryptoStat.find({ coin })
      .sort({ fetchedAt: -1 })
      .limit(100)
      .select('price -_id')
      .lean();

    if (records.length === 0) {
      return res.status(404).json({
        error: `No data found for coin: ${coin}. The background job may not have run yet.`,
      });
    }

    const prices = records.map((r) => r.price);
    const deviation = parseFloat(calcStdDeviation(prices).toFixed(2));

    return res.status(200).json({ deviation });
  } catch (err) {
    console.error('[Controller] getDeviation error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = { getStats, getDeviation };
