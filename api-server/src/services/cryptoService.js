'use strict';

const axios = require('axios');
const CryptoStat = require('../models/CryptoStat');

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const SUPPORTED_COINS = ['bitcoin', 'ethereum', 'matic-network'];

// CoinGecko IDs — matic-network migrated to POL but we expose it as matic-network per assignment spec
const COINGECKO_ID_MAP = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'matic-network': 'polygon-ecosystem-token',
};

/**
 * Fetches the current price (USD), market cap (USD), and 24h change (%)
 * for bitcoin, ethereum, and matic-network from CoinGecko, then persists
 * each as a new CryptoStat document in MongoDB.
 *
 * Uses the /coins/markets endpoint which always returns explicit, reliable
 * fields regardless of API key tier.
 */
async function storeCryptoStats() {
  console.log('[CryptoService] Fetching stats from CoinGecko…');

  try {
    const headers = {};
    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
    }

    // Build the CoinGecko IDs list using the mapping
    const geckoIds = SUPPORTED_COINS.map((c) => COINGECKO_ID_MAP[c]).join(',');

    const { data } = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: geckoIds,
        price_change_percentage: '24h',
      },
      headers,
      timeout: 10_000,
    });

    // Log raw response at debug level so issues are easy to diagnose
    console.log('[CryptoService] Raw API response:', JSON.stringify(data));

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[CryptoService] Unexpected API response shape — no data to store.');
      return;
    }

    // Build a reverse map: geckoId → assignmentCoinName
    const reverseMap = Object.fromEntries(
      Object.entries(COINGECKO_ID_MAP).map(([k, v]) => [v, k])
    );

    const now = new Date();
    const documents = data
      .filter((coin) => {
        if (coin.current_price === null || coin.current_price === undefined) {
          console.warn(`[CryptoService] Skipping ${coin.id} — current_price is null (may be migrated/delisted).`);
          return false;
        }
        return true;
      })
      .map((coin) => ({
        coin: reverseMap[coin.id] ?? coin.id,   // store under assignment name
        price: coin.current_price,
        marketCap: coin.market_cap,
        change24h: coin.price_change_percentage_24h ?? coin.price_change_percentage_24h_in_currency ?? 0,
        fetchedAt: now,
      }));

    if (documents.length === 0) {
      console.warn('[CryptoService] No matching coins in API response.');
      return;
    }

    await CryptoStat.insertMany(documents);
    console.log(`[CryptoService] Stored ${documents.length} records at ${now.toISOString()}.`);
    documents.forEach((d) =>
      console.log(`  → ${d.coin}: $${d.price} | cap: $${d.marketCap} | 24h: ${d.change24h?.toFixed(2)}%`)
    );
  } catch (err) {
    console.error('[CryptoService] Failed to fetch/store stats:', err.message);
    // Do not rethrow – allow the caller (NATS listener, cron) to continue running
  }
}

module.exports = { storeCryptoStats };
