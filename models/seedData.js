/**
 * Seed Data for KisanDrasti Database
 * Populates initial data for crops, markets, and historical prices
 */

exports.seedDatabase = (db) => {
    return new Promise((resolve, reject) => {
        // Check if data already exists
        db.get('SELECT COUNT(*) as count FROM crops', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row.count > 0) {
                console.log('📊 Database already seeded');
                resolve();
                return;
            }

            console.log('🌱 Seeding database with initial data...');

            db.serialize(() => {
                // Insert crops
                const crops = [
                    { name_en: 'Wheat', name_hi: 'गेहूं', category: 'Cereal', base_price: 2050 },
                    { name_en: 'Rice', name_hi: 'चावल', category: 'Cereal', base_price: 2800 },
                    { name_en: 'Cotton', name_hi: 'कपास', category: 'Cash Crop', base_price: 5500 },
                    { name_en: 'Sugarcane', name_hi: 'गन्ना', category: 'Cash Crop', base_price: 3100 },
                    { name_en: 'Maize', name_hi: 'मक्का', category: 'Cereal', base_price: 1850 },
                    { name_en: 'Soybean', name_hi: 'सोयाबीन', category: 'Oilseed', base_price: 4200 },
                    { name_en: 'Mustard', name_hi: 'सरसों', category: 'Oilseed', base_price: 5100 },
                    { name_en: 'Chickpea', name_hi: 'चना', category: 'Pulse', base_price: 5300 },
                    { name_en: 'Pigeon Pea', name_hi: 'अरहर', category: 'Pulse', base_price: 6200 },
                    { name_en: 'Onion', name_hi: 'प्याज', category: 'Vegetable', base_price: 2200 },
                    { name_en: 'Potato', name_hi: 'आलू', category: 'Vegetable', base_price: 1500 },
                    { name_en: 'Tomato', name_hi: 'टमाटर', category: 'Vegetable', base_price: 1800 }
                ];

                const cropStmt = db.prepare(
                    'INSERT INTO crops (name_en, name_hi, category, base_price) VALUES (?, ?, ?, ?)'
                );

                crops.forEach(crop => {
                    cropStmt.run(crop.name_en, crop.name_hi, crop.category, crop.base_price);
                });

                cropStmt.finalize();

                // Insert markets
                const markets = [
                    { name: 'Azadpur Mandi', location: 'Delhi', type: 'APMC', state: 'Delhi' },
                    { name: 'Vashi APMC', location: 'Mumbai', type: 'APMC', state: 'Maharashtra' },
                    { name: 'Koyambedu Market', location: 'Chennai', type: 'APMC', state: 'Tamil Nadu' },
                    { name: 'Yeshwanthpur APMC', location: 'Bangalore', type: 'APMC', state: 'Karnataka' },
                    { name: 'Gaddiannaram Mandi', location: 'Hyderabad', type: 'APMC', state: 'Telangana' },
                    { name: 'AgriCorp Pvt Ltd', location: 'Pan India', type: 'Private', state: 'Multiple' },
                    { name: 'FarmFresh Traders', location: 'North India', type: 'Private', state: 'Multiple' },
                    { name: 'Kisan Producer Co-op', location: 'Punjab', type: 'FPO', state: 'Punjab' },
                    { name: 'Maharashtra Farmers FPO', location: 'Maharashtra', type: 'FPO', state: 'Maharashtra' }
                ];

                const marketStmt = db.prepare(
                    'INSERT INTO markets (name, location, type, state) VALUES (?, ?, ?, ?)'
                );

                markets.forEach(market => {
                    marketStmt.run(market.name, market.location, market.type, market.state);
                });

                marketStmt.finalize();

                // Insert historical price data for the last 30 days
                const priceStmt = db.prepare(
                    `INSERT INTO prices (crop_id, source, price, location, timestamp) 
                     VALUES (?, ?, ?, ?, ?)`
                );

                const sources = ['apmc', 'private', 'fpo'];
                const now = new Date();

                // Generate historical data for each crop
                crops.forEach((crop, cropIndex) => {
                    const cropId = cropIndex + 1;

                    // Generate 30 days of historical data
                    for (let day = 30; day >= 0; day--) {
                        const date = new Date(now);
                        date.setDate(date.getDate() - day);

                        sources.forEach(source => {
                            // Calculate price with realistic variation
                            let basePrice = crop.base_price;

                            // Add source-based premium
                            if (source === 'private') {
                                basePrice *= 1.05; // 5% premium
                            } else if (source === 'fpo') {
                                basePrice *= 1.08; // 8% premium
                            }

                            // Add daily variation (±3%)
                            const variation = (Math.random() - 0.5) * 0.06;
                            const price = Math.round(basePrice * (1 + variation));

                            // Add seasonal trend (slight upward trend)
                            const trendFactor = 1 + ((30 - day) * 0.001);
                            const finalPrice = Math.round(price * trendFactor);

                            const location = source === 'apmc' ? 'Azadpur Mandi, Delhi' :
                                source === 'private' ? 'AgriCorp Pvt Ltd' :
                                    'Kisan Producer Co-op, Punjab';

                            priceStmt.run(
                                cropId,
                                source,
                                finalPrice,
                                location,
                                date.toISOString()
                            );
                        });
                    }
                });

                priceStmt.finalize(() => {
                    console.log('✅ Database seeded successfully');
                    console.log(`   - ${crops.length} crops added`);
                    console.log(`   - ${markets.length} markets added`);
                    console.log(`   - ${crops.length * 31 * 3} historical price records added`);
                    resolve();
                });
            });
        });
    });
};
