module.exports = {
    // Server configuration
    port: process.env.PORT || 3000,

    // Database configuration
    database: {
        path: './kisandrasti.db',
        options: {
            verbose: console.log
        }
    },

    // API configuration
    api: {
        baseUrl: '/api',
        version: 'v1'
    },

    // Data update intervals (in milliseconds)
    updateIntervals: {
        priceRefresh: 30000,      // 30 seconds
        predictionCache: 300000,  // 5 minutes
        alertCheck: 60000         // 1 minute
    },

    // Language settings
    languages: {
        default: 'en',
        supported: ['en', 'hi']
    },

    // Price variation limits (for alerts)
    priceAlerts: {
        significantRise: 5,    // % increase
        significantDrop: -5,   // % decrease
        stableRange: 2         // ±% for stable
    },

    // Prediction settings
    prediction: {
        historicalDays: 30,
        forecastHours: [24, 48, 72],
        confidenceThreshold: 0.7
    }
};
