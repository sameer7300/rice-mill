const express = require('express');
const { getRates, SUPPORTED } = require('../lib/currency');

const router = express.Router();

// GET /api/currency/rates — cached PKR-based exchange rates
router.get('/rates', async (req, res) => {
  try {
    const allRates = await getRates();
    if (!allRates) {
      // Return hardcoded fallback so the store never breaks without an API key
      return res.json({
        success: true,
        base: 'PKR',
        cached: false,
        rates: { PKR: 1, USD: 0.00357, EUR: 0.00329, GBP: 0.00281, AED: 0.01311, SAR: 0.01339, CAD: 0.00487, AUD: 0.00546, OMR: 0.00137, QAR: 0.01300, KWD: 0.00110, BHD: 0.00134 },
      });
    }
    // Filter to supported currencies only
    const rates = Object.fromEntries(SUPPORTED.map(c => [c, allRates[c] || 1]));
    rates.PKR = 1;
    res.json({ success: true, base: 'PKR', cached: true, rates });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch rates' });
  }
});

module.exports = router;
