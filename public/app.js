// ===== Global State =====
let currentLanguage = 'en';
let currentCrop = null;
let priceData = null;
let predictionChart = null;

// ===== API Configuration =====
const API_BASE_URL = 'http://localhost:3000/api';

// ===== Translation Data =====
const translations = {
    en: {
        cropSelect: 'Choose a crop...',
        searchBtn: 'Compare Prices',
        loadingText: 'Loading prices...',
        bestPriceRecommendation: 'Best Price Recommendation',
        sellAt: 'Sell at',
        for: 'for',
        perQuintal: 'per quintal',
        priceRising: '📈 Price Rising',
        priceFalling: '📉 Price Falling',
        priceStable: '➡️ Price Stable',
        bestSellingTime: 'Best Selling Time',
        expectedPrice: 'Expected Price',
        priceChange: 'Price Change',
        recommendation: 'Recommendation'
    },
    hi: {
        cropSelect: 'फसल चुनें...',
        searchBtn: 'कीमतों की तुलना करें',
        loadingText: 'कीमतें लोड हो रही हैं...',
        bestPriceRecommendation: 'सर्वोत्तम मूल्य सिफारिश',
        sellAt: 'यहाँ बेचें',
        for: 'के लिए',
        perQuintal: 'प्रति क्विंटल',
        priceRising: '📈 कीमत बढ़ रही है',
        priceFalling: '📉 कीमत गिर रही है',
        priceStable: '➡️ कीमत स्थिर है',
        bestSellingTime: 'बेचने का सर्वोत्तम समय',
        expectedPrice: 'अपेक्षित मूल्य',
        priceChange: 'मूल्य परिवर्तन',
        recommendation: 'सिफारिश'
    }
};

// ===== DOM Elements =====
const elements = {
    langToggle: document.getElementById('langToggle'),
    notificationBtn: document.getElementById('notificationBtn'),
    notificationBadge: document.getElementById('notificationBadge'),
    cropSelect: document.getElementById('cropSelect'),
    searchBtn: document.getElementById('searchBtn'),
    alertsSection: document.getElementById('alertsSection'),
    alertsContainer: document.getElementById('alertsContainer'),
    comparisonSection: document.getElementById('comparisonSection'),
    predictionSection: document.getElementById('predictionSection'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    recommendationCard: document.getElementById('recommendationCard'),
    recommendationText: document.getElementById('recommendationText')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadCrops();
});

function initializeApp() {
    console.log('KisanDrasti initialized');
    updateLanguage();
}

function setupEventListeners() {
    elements.langToggle.addEventListener('click', toggleLanguage);
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cropSelect.addEventListener('change', handleCropChange);
}

// ===== Language Management =====
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    elements.langToggle.querySelector('.lang-text').textContent = currentLanguage === 'en' ? 'हिं' : 'EN';
    updateLanguage();
}

function updateLanguage() {
    document.querySelectorAll('[data-en]').forEach(element => {
        const enText = element.getAttribute('data-en');
        const hiText = element.getAttribute('data-hi');

        if (element.tagName === 'OPTION') {
            element.textContent = currentLanguage === 'en' ? enText : hiText;
        } else if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
            element.placeholder = currentLanguage === 'en' ? enText : hiText;
        } else {
            element.textContent = currentLanguage === 'en' ? enText : hiText;
        }
    });
}

// ===== API Calls =====
async function loadCrops() {
    try {
        const response = await fetch(`${API_BASE_URL}/crops`);
        const crops = await response.json();

        populateCropSelect(crops);
    } catch (error) {
        console.error('Error loading crops:', error);
        showAlert('error', 'Failed to load crops. Please refresh the page.');
    }
}

function populateCropSelect(crops) {
    elements.cropSelect.innerHTML = `<option value="" data-en="Choose a crop..." data-hi="फसल चुनें...">Choose a crop...</option>`;

    crops.forEach(crop => {
        const option = document.createElement('option');
        option.value = crop.id;
        option.setAttribute('data-en', crop.name_en);
        option.setAttribute('data-hi', crop.name_hi);
        option.textContent = currentLanguage === 'en' ? crop.name_en : crop.name_hi;
        elements.cropSelect.appendChild(option);
    });
}

async function fetchPrices(cropId) {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/compare?cropId=${cropId}`);
        const data = await response.json();

        priceData = data;
        displayPrices(data);
        loadPredictions(cropId);
        loadAlerts(cropId);

    } catch (error) {
        console.error('Error fetching prices:', error);
        showAlert('error', 'Failed to load prices. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function loadPredictions(cropId) {
    try {
        const response = await fetch(`${API_BASE_URL}/predict?cropId=${cropId}`);
        const predictions = await response.json();

        displayPredictions(predictions);
    } catch (error) {
        console.error('Error loading predictions:', error);
    }
}

async function loadAlerts(cropId) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts?cropId=${cropId}`);
        const alerts = await response.json();

        displayAlerts(alerts);
        updateNotificationBadge(alerts.length);
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// ===== Display Functions =====
function displayPrices(data) {
    // Display APMC price
    document.getElementById('apmcPrice').textContent = `₹${data.apmc.price.toLocaleString()}`;
    document.getElementById('apmcLocation').textContent = data.apmc.location;
    displayTrend('apmcTrend', data.apmc.trend);

    // Display Private Buyer price
    document.getElementById('privatePrice').textContent = `₹${data.private.price.toLocaleString()}`;
    document.getElementById('privateLocation').textContent = data.private.location;
    displayTrend('privateTrend', data.private.trend);

    // Display FPO price
    document.getElementById('fpoPrice').textContent = `₹${data.fpo.price.toLocaleString()}`;
    document.getElementById('fpoLocation').textContent = data.fpo.location;
    displayTrend('fpoTrend', data.fpo.trend);

    // Highlight best price
    highlightBestPrice(data);

    // Show recommendation
    showRecommendation(data);

    // Show sections
    elements.comparisonSection.style.display = 'block';
}

function displayTrend(elementId, trend) {
    const element = document.getElementById(elementId);
    const trendText = translations[currentLanguage][`price${trend.charAt(0).toUpperCase() + trend.slice(1)}`];
    element.textContent = trendText;
    element.className = `price-trend ${trend}`;
}

function highlightBestPrice(data) {
    // Remove existing highlights
    document.querySelectorAll('.price-card').forEach(card => {
        card.classList.remove('best-price');
    });

    // Find best price
    const prices = [
        { type: 'apmc', price: data.apmc.price },
        { type: 'private', price: data.private.price },
        { type: 'fpo', price: data.fpo.price }
    ];

    const bestPrice = prices.reduce((max, p) => p.price > max.price ? p : max);

    // Highlight best price card
    const cards = document.querySelectorAll('.price-card');
    const index = prices.findIndex(p => p.type === bestPrice.type);
    if (cards[index]) {
        cards[index].classList.add('best-price');
    }
}

function showRecommendation(data) {
    const prices = [
        { type: 'APMC Mandi', typeHi: 'APMC मंडी', location: data.apmc.location, price: data.apmc.price },
        { type: 'Private Buyer', typeHi: 'निजी खरीदार', location: data.private.location, price: data.private.price },
        { type: 'FPO', typeHi: 'FPO', location: data.fpo.location, price: data.fpo.price }
    ];

    const bestPrice = prices.reduce((max, p) => p.price > max.price ? p : max);

    const typeText = currentLanguage === 'en' ? bestPrice.type : bestPrice.typeHi;
    const sellAtText = translations[currentLanguage].sellAt;
    const forText = translations[currentLanguage].for;
    const perQuintalText = translations[currentLanguage].perQuintal;

    elements.recommendationText.textContent =
        `${sellAtText} ${typeText} (${bestPrice.location}) ${forText} ₹${bestPrice.price.toLocaleString()} ${perQuintalText}`;

    elements.recommendationCard.style.display = 'flex';
}

function displayPredictions(predictions) {
    // Display chart
    displayPredictionChart(predictions.forecast);

    // Display prediction details
    const detailsContainer = document.getElementById('predictionDetails');
    detailsContainer.innerHTML = `
        <div class="prediction-item">
            <span>${translations[currentLanguage].expectedPrice} (24h):</span>
            <strong>₹${predictions.forecast[0].price.toLocaleString()}</strong>
        </div>
        <div class="prediction-item">
            <span>${translations[currentLanguage].expectedPrice} (48h):</span>
            <strong>₹${predictions.forecast[1].price.toLocaleString()}</strong>
        </div>
        <div class="prediction-item">
            <span>${translations[currentLanguage].expectedPrice} (72h):</span>
            <strong>₹${predictions.forecast[2].price.toLocaleString()}</strong>
        </div>
    `;

    // Display selling window
    displaySellingWindow(predictions.bestWindow);

    elements.predictionSection.style.display = 'block';
}

function displayPredictionChart(forecast) {
    const ctx = document.getElementById('predictionChart').getContext('2d');

    if (predictionChart) {
        predictionChart.destroy();
    }

    predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecast.map(f => f.time),
            datasets: [{
                label: currentLanguage === 'en' ? 'Predicted Price (₹/quintal)' : 'अनुमानित मूल्य (₹/क्विंटल)',
                data: forecast.map(f => f.price),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function (value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function displaySellingWindow(window) {
    const container = document.getElementById('sellingWindowContent');

    const timeText = currentLanguage === 'en' ? window.time : window.time_hi;
    const recommendationText = currentLanguage === 'en' ? window.recommendation : window.recommendation_hi;

    container.innerHTML = `
        <div class="window-item">
            <div class="window-label">${translations[currentLanguage].bestSellingTime}</div>
            <div class="window-value">${timeText}</div>
        </div>
        <div class="window-item">
            <div class="window-label">${translations[currentLanguage].expectedPrice}</div>
            <div class="window-value">₹${window.price.toLocaleString()}</div>
        </div>
        <div class="window-item">
            <div class="window-label">${translations[currentLanguage].priceChange}</div>
            <div class="window-value" style="color: ${window.change > 0 ? '#10b981' : '#ef4444'}">
                ${window.change > 0 ? '+' : ''}${window.change}%
            </div>
        </div>
        <div class="window-item">
            <div class="window-label">${translations[currentLanguage].recommendation}</div>
            <div class="window-value">${recommendationText}</div>
        </div>
    `;
}

function displayAlerts(alerts) {
    if (alerts.length === 0) {
        elements.alertsSection.style.display = 'none';
        return;
    }

    elements.alertsContainer.innerHTML = '';

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.type}`;

        const message = currentLanguage === 'en' ? alert.message : alert.message_hi;

        alertDiv.innerHTML = `
            <span class="alert-icon">${alert.icon}</span>
            <span class="alert-text">${message}</span>
        `;

        elements.alertsContainer.appendChild(alertDiv);
    });

    elements.alertsSection.style.display = 'block';
}

function updateNotificationBadge(count) {
    elements.notificationBadge.textContent = count;
    if (count > 0) {
        elements.notificationBadge.style.display = 'block';
    } else {
        elements.notificationBadge.style.display = 'none';
    }
}

// ===== Event Handlers =====
function handleCropChange(event) {
    currentCrop = event.target.value;
}

function handleSearch() {
    if (!currentCrop) {
        showAlert('warning', currentLanguage === 'en' ? 'Please select a crop first' : 'कृपया पहले एक फसल चुनें');
        return;
    }

    fetchPrices(currentCrop);
}

// ===== Utility Functions =====
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.innerHTML = `
        <span class="alert-icon">${type === 'error' ? '❌' : '⚠️'}</span>
        <span class="alert-text">${message}</span>
    `;

    elements.alertsContainer.appendChild(alertDiv);
    elements.alertsSection.style.display = 'block';

    setTimeout(() => {
        alertDiv.remove();
        if (elements.alertsContainer.children.length === 0) {
            elements.alertsSection.style.display = 'none';
        }
    }, 5000);
}

// ===== Auto-refresh prices every 30 seconds =====
setInterval(() => {
    if (currentCrop) {
        fetchPrices(currentCrop);
    }
}, 30000);
