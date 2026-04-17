'use strict';

const { Router } = require('express');
const { getStats, getDeviation } = require('../controllers/cryptoController');

const router = Router();

/**
 * @route  GET /stats
 * @query  coin {string} - One of: bitcoin | ethereum | matic-network
 * @desc   Returns the latest price, market cap, and 24h change for the coin.
 */
router.get('/stats', getStats);

/**
 * @route  GET /deviation
 * @query  coin {string} - One of: bitcoin | ethereum | matic-network
 * @desc   Returns the standard deviation of the price for the last 100 records.
 */
router.get('/deviation', getDeviation);

module.exports = router;
