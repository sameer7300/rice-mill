const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const currency = require('../lib/currency');

const router = express.Router();
const prisma = new PrismaClient();

function parseCountries(zone) {
  try { return JSON.parse(zone.countries || '[]'); } catch { return []; }
}

// Find the best matching zone for a country code
function matchZone(zones, countryCode) {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  // 1. Exact country match
  const exact = zones.find(z => parseCountries(z).includes(code));
  if (exact) return exact;
  // 2. Catch-all wildcard
  const catchAll = zones.find(z => parseCountries(z).includes('*'));
  return catchAll || null;
}

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/shipping/zones — active zones list (for frontend display)
router.get('/zones', async (req, res) => {
  try {
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: zones });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/shipping/calculate?country=US&weightKg=25&subtotalUSD=150
// Returns shipping fee in USD and PKR, zone info, estimated days
router.get('/calculate', async (req, res) => {
  try {
    const { country, weightKg = 0, subtotalPKR = 0 } = req.query;
    const kg = parseFloat(weightKg) || 0;
    const subtotal = parseFloat(subtotalPKR) || 0;

    // Convert subtotal PKR → USD for freeAbove comparison
    const usdRate = await currency.getRate('USD');
    const subtotalUSD = subtotal * usdRate;

    // Get domestic zone first (Pakistan)
    const isDomestic = !country || country.toUpperCase() === 'PK';

    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    let zone = null;
    if (isDomestic) {
      zone = zones.find(z => z.isDomestic);
    } else {
      zone = matchZone(zones.filter(z => !z.isDomestic), country);
    }

    if (!zone) {
      return res.json({
        success: true,
        available: false,
        message: 'Shipping not available to this location. Please contact us.',
        feeUSD: null,
        feePKR: null,
      });
    }

    // Check free shipping threshold
    if (zone.freeAbove && subtotalUSD >= zone.freeAbove) {
      return res.json({
        success: true,
        available: true,
        free: true,
        feeUSD: 0,
        feePKR: 0,
        zone: { id: zone.id, name: zone.name, minDays: zone.minDays, maxDays: zone.maxDays },
      });
    }

    // Calculate fee in USD
    const feeUSD = zone.baseFee + (zone.perKgRate * kg);

    // Convert to PKR
    const pkrRate = usdRate === 0 ? 1 : 1 / usdRate; // how many PKR per 1 USD
    // Actually: usdRate = PKR per USD (from ExchangeRate PKR base: rate[USD] = 0.0036 means 1 PKR = 0.0036 USD)
    // So 1 USD = 1/usdRate PKR
    const feePKR = usdRate > 0 ? feeUSD / usdRate : feeUSD * 280; // fallback 280 if no rate

    res.json({
      success: true,
      available: true,
      free: false,
      feeUSD: Math.round(feeUSD * 100) / 100,
      feePKR: Math.round(feePKR),
      zone: { id: zone.id, name: zone.name, minDays: zone.minDays, maxDays: zone.maxDays },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shipping/zones/all — all zones (admin/staff)
router.get('/zones/all', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const zones = await prisma.shippingZone.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: zones });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/shipping/zones
router.post('/zones', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, countries, baseFee, perKgRate, minDays, maxDays, freeAbove, isDomestic, sortOrder } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Zone name is required' });
    const zone = await prisma.shippingZone.create({
      data: {
        name,
        countries: JSON.stringify(Array.isArray(countries) ? countries : []),
        baseFee: parseFloat(baseFee) || 0,
        perKgRate: parseFloat(perKgRate) || 0,
        minDays: parseInt(minDays) || 5,
        maxDays: parseInt(maxDays) || 21,
        freeAbove: freeAbove ? parseFloat(freeAbove) : null,
        isDomestic: !!isDomestic,
        sortOrder: parseInt(sortOrder) || 0,
      },
    });
    res.status(201).json({ success: true, data: zone });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/shipping/zones/:id
router.put('/zones/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, countries, baseFee, perKgRate, minDays, maxDays, freeAbove, isDomestic, isActive, sortOrder } = req.body;
    const zone = await prisma.shippingZone.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(countries !== undefined && { countries: JSON.stringify(Array.isArray(countries) ? countries : []) }),
        ...(baseFee !== undefined && { baseFee: parseFloat(baseFee) }),
        ...(perKgRate !== undefined && { perKgRate: parseFloat(perKgRate) }),
        ...(minDays !== undefined && { minDays: parseInt(minDays) }),
        ...(maxDays !== undefined && { maxDays: parseInt(maxDays) }),
        ...(freeAbove !== undefined && { freeAbove: freeAbove ? parseFloat(freeAbove) : null }),
        ...(isDomestic !== undefined && { isDomestic: !!isDomestic }),
        ...(isActive !== undefined && { isActive: !!isActive }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
      },
    });
    res.json({ success: true, data: zone });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/shipping/zones/:id
router.delete('/zones/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.shippingZone.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/shipping/zones/reorder
router.patch('/zones/reorder', auth, requireRole('admin'), async (req, res) => {
  try {
    const { ids } = req.body; // ordered array of zone IDs
    if (!Array.isArray(ids)) return res.status(400).json({ success: false, error: 'ids array required' });
    await Promise.all(ids.map((id, i) => prisma.shippingZone.update({ where: { id }, data: { sortOrder: i } })));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
