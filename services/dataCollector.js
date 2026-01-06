const db = require('../models/database');

/**
 * Data Collector Service
 * Simulates fetching data from multiple sources:
 * - APMC Mandi Price Feeds
 * - Private Buyer Rates
 * - FPO Demand Prices
 */

// Simulate APMC Mandi price feed
exports.getAPMCPrice = async (cropId) => {
    try {
        // In production, this would call actual APMC API
        // For now, we simulate with realistic data

        const crop = await db.getCropById(cropId);
        const basePrice = await db.getLatestPrice(cropId, 'apmc');

        // Add realistic variation (±5%)
        const variation = (Math.random() - 0.5) * 0.1;
        const currentPrice = Math.round(basePrice * (1 + variation));

        // Simulate different APMC locations
        const locations = [
            'Azadpur Mandi, Delhi',
            'Vashi APMC, Mumbai',
            'Koyambedu Market, Chennai',
            'Yeshwanthpur APMC, Bangalore',
            'Gaddiannaram Mandi, Hyderabad'
        ];

        return {
            price: currentPrice,
            location: locations[Math.floor(Math.random() * locations.length)],
            source: 'APMC',
            timestamp: new Date().toISOString(),
            unit: 'quintal'
        };
    } catch (error) {
        console.error('Error fetching APMC price:', error);
        throw error;
    }
};

// Simulate Private Buyer price feed
exports.getPrivateBuyerPrice = async (cropId) => {
    try {
        const crop = await db.getCropById(cropId);
        const basePrice = await db.getLatestPrice(cropId, 'private');

        // Private buyers typically offer 3-8% more than APMC
        const premium = 0.03 + (Math.random() * 0.05);
        const variation = (Math.random() - 0.5) * 0.08;
        const currentPrice = Math.round(basePrice * (1 + premium + variation));

        const buyers = [
            'AgriCorp Pvt Ltd',
            'FarmFresh Traders',
            'GreenHarvest Co.',
            'Rural Agro Solutions',
            'Kisan Connect Buyers'
        ];

        return {
            price: currentPrice,
            location: buyers[Math.floor(Math.random() * buyers.length)],
            source: 'Private',
            timestamp: new Date().toISOString(),
            unit: 'quintal'
        };
    } catch (error) {
        console.error('Error fetching private buyer price:', error);
        throw error;
    }
};

// Simulate FPO price feed
exports.getFPOPrice = async (cropId) => {
    try {
        const crop = await db.getCropById(cropId);
        const basePrice = await db.getLatestPrice(cropId, 'fpo');

        // FPOs typically offer 5-10% more due to collective bargaining
        const premium = 0.05 + (Math.random() * 0.05);
        const variation = (Math.random() - 0.5) * 0.06;
        const currentPrice = Math.round(basePrice * (1 + premium + variation));

        const fpos = [
            'Kisan Producer Co-op, Punjab',
            'Maharashtra Farmers FPO',
            'UP Growers Association',
            'Karnataka Agri Collective',
            'Haryana Farmers Union'
        ];

        return {
            price: currentPrice,
            location: fpos[Math.floor(Math.random() * fpos.length)],
            source: 'FPO',
            timestamp: new Date().toISOString(),
            unit: 'quintal'
        };
    } catch (error) {
        console.error('Error fetching FPO price:', error);
        throw error;
    }
};

// Normalize price data (ensure all prices are in ₹/quintal)
exports.normalizePrice = (price, unit) => {
    const conversionRates = {
        'quintal': 1,
        'kg': 100,
        'ton': 0.1,
        'pound': 220.46
    };

    return Math.round(price * (conversionRates[unit] || 1));
};

// Remove duplicate entries
exports.removeDuplicates = (priceData) => {
    const seen = new Set();
    return priceData.filter(item => {
        const key = `${item.source}-${item.location}-${item.price}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};
