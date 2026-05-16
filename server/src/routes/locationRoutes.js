const express = require('express');
const https = require('https');

const router = express.Router();

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'AlNoorRiceMills/1.0 (info@alnoorice.pk)' } }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// GET /api/location/suggest?q=karachi&country=PK
// country is optional — supports worldwide search
router.get('/suggest', async (req, res) => {
  try {
    const { q, lat, lng } = req.query;
    if (!q && (!lat || !lng)) {
      return res.status(400).json({ success: false, error: 'q or lat+lng required' });
    }

    let url;
    if (lat && lng) {
      // Reverse geocode
      url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&addressdetails=1`;
    } else {
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;
    }

    const data = await httpsGet(url);
    const results = Array.isArray(data) ? data : [data];

    const suggestions = results.map(r => {
      const a = r.address || {};
      return {
        displayName: r.display_name || '',
        city: a.city || a.town || a.village || a.county || '',
        state: a.state || a.province || '',
        country: a.country || '',
        countryCode: (a.country_code || '').toUpperCase(),
        postalCode: a.postcode || '',
        latitude: parseFloat(r.lat || 0),
        longitude: parseFloat(r.lon || 0)
      };
    }).filter(s => s.displayName);

    res.json({ success: true, data: suggestions });
  } catch (err) {
    // Return empty suggestions on error — don't break the form
    res.json({ success: true, data: [], error: err.message });
  }
});

module.exports = router;
