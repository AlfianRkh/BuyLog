const express = require('express');
const router = express.Router();
const priceRadarController = require('../controllers/priceRadarController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Dashboard & Summary
router.get('/dashboard', priceRadarController.getDashboard);
router.get('/stats', priceRadarController.getStats);

// Watchlist
router.get('/watchlist', priceRadarController.getWatchlist);
router.post('/watchlist', priceRadarController.createWatchlist);
router.get('/watchlist/:idOrSlug', priceRadarController.getProductDetail);
router.put('/watchlist/:id', priceRadarController.updateWatchlist);
router.delete('/watchlist/:id', priceRadarController.deleteWatchlist);

// Logs
router.post('/logs', priceRadarController.recordLog);

// Sources / Platforms
router.get('/sources', priceRadarController.getSources);
router.post('/sources', priceRadarController.createSource);
router.put('/sources/:id', priceRadarController.updateSource);

// Categories for PriceRadar
router.get('/categories', priceRadarController.getCategories);
router.post('/categories', priceRadarController.createCategory);

module.exports = router;
