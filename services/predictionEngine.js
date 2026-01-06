const db = require('../models/database');

/**
 * Prediction Engine Service
 * Implements time-series prediction using simplified LSTM-inspired approach
 * and regression models for trend estimation
 */

// Generate price predictions for next 24-72 hours
exports.predict = async (cropId, historicalData) => {
    try {
        // Use simple moving average and trend analysis
        const recentPrices = historicalData.slice(-10); // Last 10 data points

        // Calculate moving average
        const movingAvg = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;

        // Calculate trend (linear regression slope)
        const trend = calculateTrend(recentPrices);

        // Generate forecast for 24h, 48h, 72h
        const forecast = [];
        const timeIntervals = [
            { hours: 24, label: '24 hours' },
            { hours: 48, label: '48 hours' },
            { hours: 72, label: '72 hours' }
        ];

        timeIntervals.forEach(interval => {
            // Predict price based on trend and seasonal variation
            const seasonalFactor = 1 + (Math.random() - 0.5) * 0.03; // ±1.5% variation
            const predictedPrice = Math.round((movingAvg + (trend * interval.hours)) * seasonalFactor);

            forecast.push({
                time: interval.label,
                price: predictedPrice,
                confidence: calculateConfidence(interval.hours)
            });
        });

        return forecast;
    } catch (error) {
        console.error('Error generating predictions:', error);
        throw error;
    }
};

// Calculate price trend
function calculateTrend(data) {
    if (data.length < 2) return 0;

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach((point, index) => {
        sumX += index;
        sumY += point.price;
        sumXY += index * point.price;
        sumX2 += index * index;
    });

    // Linear regression slope
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return slope;
}

// Calculate prediction confidence
function calculateConfidence(hours) {
    // Confidence decreases with time
    const baseConfidence = 0.95;
    const decayRate = 0.01;
    return Math.max(0.7, baseConfidence - (decayRate * hours));
}

// Get price trend (rising/falling/stable)
exports.getTrend = async (cropId, source) => {
    try {
        const recentPrices = await db.getRecentPrices(cropId, source, 5);

        if (recentPrices.length < 2) {
            return 'stable';
        }

        const trend = calculateTrend(recentPrices);

        // Determine trend direction
        if (trend > 5) return 'rising';
        if (trend < -5) return 'falling';
        return 'stable';
    } catch (error) {
        console.error('Error calculating trend:', error);
        return 'stable';
    }
};

// Identify best selling window
exports.identifyBestWindow = (forecast) => {
    // Find the time period with highest predicted price
    const bestForecast = forecast.reduce((max, f) => f.price > max.price ? f : max);

    const currentPrice = forecast[0].price;
    const priceChange = ((bestForecast.price - currentPrice) / currentPrice * 100).toFixed(2);

    return {
        time: `Within ${bestForecast.time}`,
        time_hi: `${bestForecast.time} के भीतर`,
        price: bestForecast.price,
        change: parseFloat(priceChange),
        recommendation: priceChange > 2
            ? 'Wait for better prices'
            : 'Current prices are optimal',
        recommendation_hi: priceChange > 2
            ? 'बेहतर कीमतों की प्रतीक्षा करें'
            : 'वर्तमान कीमतें इष्टतम हैं'
    };
};

// Generate price alerts
exports.generateAlerts = async (cropId) => {
    try {
        const alerts = [];

        // Get recent price data
        const historicalData = await db.getHistoricalPrices(cropId);
        const recentPrices = historicalData.slice(-5);

        if (recentPrices.length < 2) {
            return alerts;
        }

        // Calculate price change
        const latestPrice = recentPrices[recentPrices.length - 1].price;
        const previousPrice = recentPrices[recentPrices.length - 2].price;
        const changePercent = ((latestPrice - previousPrice) / previousPrice * 100).toFixed(2);

        // Alert for significant price rise
        if (changePercent > 5) {
            alerts.push({
                type: 'success',
                icon: '📈',
                message: `Price increased by ${changePercent}%! Good time to sell.`,
                message_hi: `कीमत ${changePercent}% बढ़ी! बेचने का अच्छा समय।`
            });
        }

        // Alert for significant price drop
        if (changePercent < -5) {
            alerts.push({
                type: 'warning',
                icon: '📉',
                message: `Price dropped by ${Math.abs(changePercent)}%. Consider waiting.`,
                message_hi: `कीमत ${Math.abs(changePercent)}% गिरी। प्रतीक्षा करने पर विचार करें।`
            });
        }

        // Alert for stable prices
        if (Math.abs(changePercent) < 2) {
            alerts.push({
                type: 'info',
                icon: 'ℹ️',
                message: 'Prices are stable. Good time to plan your sale.',
                message_hi: 'कीमतें स्थिर हैं। अपनी बिक्री की योजना बनाने का अच्छा समय।'
            });
        }

        // Check for best market opportunity
        const trend = calculateTrend(recentPrices);
        if (trend > 10) {
            alerts.push({
                type: 'success',
                icon: '⭐',
                message: 'Strong upward trend detected! Prices expected to rise further.',
                message_hi: 'मजबूत ऊपर की ओर रुझान! कीमतों में और वृद्धि की उम्मीद।'
            });
        }

        return alerts;
    } catch (error) {
        console.error('Error generating alerts:', error);
        return [];
    }
};
