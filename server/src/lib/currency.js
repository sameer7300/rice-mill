/**
 * Currency utility — wraps ExchangeRate-API with 1-hour in-memory cache.
 * Base currency: PKR (all rates are PKR → X)
 */

const https = require('https');

// Cache: { rates: {USD: 0.0036, EUR: 0.0033, ...}, fetchedAt: Date }
let cache = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const SUPPORTED = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'CAD', 'AUD', 'OMR', 'QAR', 'KWD', 'BHD'];

async function fetchRates() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) return null;

  return new Promise((resolve) => {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/PKR`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.result === 'success') resolve(parsed.conversion_rates);
          else resolve(null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function getRates() {
  if (cache && (Date.now() - cache.fetchedAt) < CACHE_TTL_MS) {
    return cache.rates;
  }
  const rates = await fetchRates();
  if (rates) {
    cache = { rates, fetchedAt: Date.now() };
    return rates;
  }
  // Return cache even if stale rather than failing
  return cache?.rates || null;
}

// Convert amount in PKR to target currency
async function fromPKR(amountPKR, targetCurrency) {
  if (!targetCurrency || targetCurrency === 'PKR') return amountPKR;
  const rates = await getRates();
  if (!rates) return amountPKR;
  const rate = rates[targetCurrency];
  if (!rate) return amountPKR;
  return amountPKR * rate;
}

// Convert amount in source currency to PKR
async function toPKR(amount, sourceCurrency) {
  if (!sourceCurrency || sourceCurrency === 'PKR') return amount;
  const rates = await getRates();
  if (!rates) return amount;
  const rate = rates[sourceCurrency];
  if (!rate || rate === 0) return amount;
  return amount / rate; // amount in source / (PKR-per-source) = amount in PKR
  // Actually: rates are PKR→X, so 1 PKR = rate[X].
  // To convert X → PKR: divide by rate[X]
  // Wait, ExchangeRate-API with base PKR: rate[USD] = how many USD per 1 PKR
  // So to convert amount USD → PKR: amount / rate[USD]
}

// Get the exchange rate: how many units of currency per 1 PKR
async function getRate(currency) {
  if (!currency || currency === 'PKR') return 1;
  const rates = await getRates();
  if (!rates) return 1;
  return rates[currency] || 1;
}

module.exports = { getRates, fromPKR, toPKR, getRate, SUPPORTED };
