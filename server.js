const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const { initializeDatabase } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Initialize database and start server
console.log('🚀 Starting server initialization...');
initializeDatabase()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🌾 KisanDrasti server running on port ${PORT}`);
            console.log(`📊 API available at /api`);
            console.log(`🏥 Health check at /health`);
            console.log(`🏠 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch(err => {
        console.error('FATAL ERROR: Failed to initialize database during startup');
        console.error(err);
        process.exit(1);
    });

module.exports = app;
