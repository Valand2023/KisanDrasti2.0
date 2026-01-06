const dataCollector = require('../services/dataCollector');
const predictionEngine = require('../services/predictionEngine');
const db = require('../models/database');

// Get all crops
exports.getCrops = async (req, res) => {
    try {
        const crops = await db.getCrops();
        res.json(crops);
    } catch (error) {
        console.error('Error fetching crops:', error);
        res.status(500).json({ error: 'Failed to fetch crops' });
    }
};

// Compare prices across all sources
exports.comparePrices = async (req, res) => {
    try {
        const { cropId } = req.query;

        if (!cropId) {
            return res.status(400).json({ error: 'cropId is required' });
        }

        // Fetch prices from all sources
        const apmcData = await dataCollector.getAPMCPrice(cropId);
        const privateData = await dataCollector.getPrivateBuyerPrice(cropId);
        const fpoData = await dataCollector.getFPOPrice(cropId);

        // Get trends
        const apmcTrend = await predictionEngine.getTrend(cropId, 'apmc');
        const privateTrend = await predictionEngine.getTrend(cropId, 'private');
        const fpoTrend = await predictionEngine.getTrend(cropId, 'fpo');

        const response = {
            cropId,
            timestamp: new Date().toISOString(),
            apmc: {
                price: apmcData.price,
                location: apmcData.location,
                trend: apmcTrend
            },
            private: {
                price: privateData.price,
                location: privateData.location,
                trend: privateTrend
            },
            fpo: {
                price: fpoData.price,
                location: fpoData.location,
                trend: fpoTrend
            }
        };

        // Save query to database
        await db.saveQuery(cropId, response);

        res.json(response);
    } catch (error) {
        console.error('Error comparing prices:', error);
        res.status(500).json({ error: 'Failed to compare prices' });
    }
};

// Get price predictions
exports.getPredictions = async (req, res) => {
    try {
        const { cropId } = req.query;

        if (!cropId) {
            return res.status(400).json({ error: 'cropId is required' });
        }

        // Get historical data
        const historicalData = await db.getHistoricalPrices(cropId);

        // Generate predictions
        const forecast = await predictionEngine.predict(cropId, historicalData);

        // Identify best selling window
        const bestWindow = predictionEngine.identifyBestWindow(forecast);

        res.json({
            cropId,
            forecast,
            bestWindow,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating predictions:', error);
        res.status(500).json({ error: 'Failed to generate predictions' });
    }
};

// Get price alerts
exports.getAlerts = async (req, res) => {
    try {
        const { cropId } = req.query;

        if (!cropId) {
            return res.status(400).json({ error: 'cropId is required' });
        }

        const alerts = await predictionEngine.generateAlerts(cropId);

        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};

// Get available markets
exports.getMarkets = async (req, res) => {
    try {
        const markets = await db.getMarkets();
        res.json(markets);
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({ error: 'Failed to fetch markets' });
    }
};
