# KisanDrasti - Smart Crop Price Platform

🌾 A Web 2.0 platform that provides real-time crop price comparison across APMC Mandis, Private Buyers, and FPOs, empowering farmers with transparent pricing and intelligent predictions.

## Features

- **Real-time Price Comparison**: Compare prices across multiple sources instantly
- **Smart Predictions**: 24-72 hour price forecasts using time-series analysis
- **Best Selling Window**: AI-powered recommendations for optimal selling time
- **Price Alerts**: Get notified about significant price changes
- **Multi-language Support**: Available in English and Hindi
- **Mobile-Friendly**: Responsive design for easy access on any device

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **APIs**: RESTful API architecture

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:\KisanDrasti2.0
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
KisanDrasti2.0/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Styling and design
│   └── app.js              # Frontend JavaScript
├── routes/
│   └── api.js              # API route definitions
├── controllers/
│   └── priceController.js  # Business logic
├── services/
│   ├── dataCollector.js    # Data collection from sources
│   └── predictionEngine.js # Price prediction algorithms
├── models/
│   ├── database.js         # Database connection & queries
│   └── seedData.js         # Initial data seeding
├── server.js               # Express server setup
├── package.json            # Dependencies
└── README.md               # This file
```

## API Endpoints

### Get All Crops
```
GET /api/crops
```
Returns list of all available crops.

### Compare Prices
```
GET /api/compare?cropId={id}
```
Returns current prices from APMC, Private Buyers, and FPOs for the specified crop.

### Get Predictions
```
GET /api/predict?cropId={id}
```
Returns 24-72 hour price predictions and best selling window.

### Get Alerts
```
GET /api/alerts?cropId={id}
```
Returns price alerts and trend notifications.

### Get Markets
```
GET /api/markets
```
Returns list of all available markets.

## Usage

1. **Select a Crop**: Choose from the dropdown menu
2. **Compare Prices**: Click "Compare Prices" to see current rates
3. **View Predictions**: Scroll down to see price forecasts
4. **Check Alerts**: Review price trend notifications
5. **Switch Language**: Toggle between English and Hindi

## System Workflow

```
Data Sources → Data Collection → Pre-Processing → Prediction Engine → Web Interface
     ↓              ↓                  ↓                  ↓                ↓
  APMC Mandi    Normalize         Remove          LSTM Model        Price Cards
  Private       ₹/quintal        Duplicates       Regression        Predictions
  FPO Rates                                       Trend Analysis    Alerts
```

## Features in Detail

### Price Comparison
- Real-time data from multiple sources
- Automatic best price highlighting
- Location-specific pricing
- Trend indicators (rising/falling/stable)

### Prediction Engine
- Time-series forecasting
- Linear regression for trend estimation
- Confidence scoring
- Best selling window identification

### Alerts System
- Price rise notifications
- Price drop warnings
- Stable market indicators
- Trend-based recommendations

## Development

### Adding New Crops
Edit `models/seedData.js` and add crop information to the crops array.

### Integrating Real APIs
Replace mock data in `services/dataCollector.js` with actual API calls to:
- Government APMC APIs
- Private buyer platforms
- FPO networks

### Customizing Predictions
Modify algorithms in `services/predictionEngine.js` to implement:
- Advanced LSTM models
- Seasonal adjustments
- Regional variations

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions, please contact the KisanDrasti team.

---

**Empowering farmers with transparent pricing** 🌾
