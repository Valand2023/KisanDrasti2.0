const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const seedData = require('./seedData');

const DB_PATH = path.join(__dirname, '..', 'kisandrasti.db');
let db = null;

// Initialize database
exports.initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }

            console.log('📁 Connected to SQLite database');

            // Create tables
            createTables()
                .then(() => seedData.seedDatabase(db))
                .then(() => {
                    console.log('✅ Database initialized successfully');
                    resolve();
                })
                .catch(reject);
        });
    });
};

// Create database tables
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Crops table
            db.run(`
                CREATE TABLE IF NOT EXISTS crops (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name_en TEXT NOT NULL,
                    name_hi TEXT NOT NULL,
                    category TEXT,
                    base_price INTEGER DEFAULT 2000,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating crops table:', err);
            });

            // Markets table
            db.run(`
                CREATE TABLE IF NOT EXISTS markets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    location TEXT NOT NULL,
                    type TEXT NOT NULL,
                    state TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating markets table:', err);
            });

            // Prices table
            db.run(`
                CREATE TABLE IF NOT EXISTS prices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    crop_id INTEGER NOT NULL,
                    source TEXT NOT NULL,
                    price INTEGER NOT NULL,
                    location TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (crop_id) REFERENCES crops(id)
                )
            `, (err) => {
                if (err) console.error('Error creating prices table:', err);
            });

            // Predictions table
            db.run(`
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    crop_id INTEGER NOT NULL,
                    predicted_price INTEGER NOT NULL,
                    prediction_time TEXT NOT NULL,
                    confidence REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (crop_id) REFERENCES crops(id)
                )
            `, (err) => {
                if (err) console.error('Error creating predictions table:', err);
            });

            // Farmer queries table
            db.run(`
                CREATE TABLE IF NOT EXISTS farmer_queries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    crop_id INTEGER NOT NULL,
                    query_data TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (crop_id) REFERENCES crops(id)
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating farmer_queries table:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

// Get all crops
exports.getCrops = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM crops ORDER BY name_en', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Get crop by ID
exports.getCropById = (cropId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM crops WHERE id = ?', [cropId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Get latest price for a crop from a specific source
exports.getLatestPrice = (cropId, source) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT price FROM prices 
             WHERE crop_id = ? AND source = ? 
             ORDER BY timestamp DESC LIMIT 1`,
            [cropId, source],
            (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(row.price);
                } else {
                    // Return base price if no historical data
                    db.get('SELECT base_price FROM crops WHERE id = ?', [cropId], (err, crop) => {
                        if (err) reject(err);
                        else resolve(crop ? crop.base_price : 2000);
                    });
                }
            }
        );
    });
};

// Get recent prices for trend analysis
exports.getRecentPrices = (cropId, source, limit = 5) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT price, timestamp FROM prices 
             WHERE crop_id = ? AND source = ? 
             ORDER BY timestamp DESC LIMIT ?`,
            [cropId, source, limit],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.reverse()); // Oldest to newest
                }
            }
        );
    });
};

// Get historical prices for predictions
exports.getHistoricalPrices = (cropId, days = 30) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT price, timestamp FROM prices 
             WHERE crop_id = ? 
             AND timestamp >= datetime('now', '-${days} days')
             ORDER BY timestamp ASC`,
            [cropId],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
};

// Save price data
exports.savePrice = (cropId, source, price, location) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO prices (crop_id, source, price, location) 
             VALUES (?, ?, ?, ?)`,
            [cropId, source, price, location],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
};

// Save farmer query
exports.saveQuery = (cropId, queryData) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO farmer_queries (crop_id, query_data) 
             VALUES (?, ?)`,
            [cropId, JSON.stringify(queryData)],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
};

// Get all markets
exports.getMarkets = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM markets ORDER BY name', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Close database connection
exports.closeDatabase = () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
};
