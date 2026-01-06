const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');

// Get all available crops
router.get('/crops', priceController.getCrops);

// Get price comparison for a specific crop
router.get('/compare', priceController.comparePrices);

// Get price predictions
router.get('/predict', priceController.getPredictions);

// Get price alerts
router.get('/alerts', priceController.getAlerts);

// Get available markets
router.get('/markets', priceController.getMarkets);

module.exports = router;
