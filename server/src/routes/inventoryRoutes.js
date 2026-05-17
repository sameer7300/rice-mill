const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, denySupplier } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const LOW_STOCK_THRESHOLD = 500; // kg

// ─── PADDY STOCK ─────────────────────────────────────────────

router.get('/paddy', auth, denySupplier, async (req, res) => {
  try {
    const { q, grade, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (grade) where.qualityGrade = grade;
    if (q) where.OR = [
      { variety: { contains: q } },
      { supplier: { businessName: { contains: q } } }
    ];
    const [stocks, total] = await Promise.all([
      prisma.paddyStock.findMany({
        where,
        include: { supplier: { include: { user: { select: { name: true } } } } },
        orderBy: { receivedAt: 'desc' },
        skip, take: parseInt(limit)
      }),
      prisma.paddyStock.count({ where })
    ]);
    res.json({ stocks, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/paddy', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { variety, quantityKg, qualityGrade, supplierId, purchasePrice, notes } = req.body;
    if (!variety || !quantityKg) return res.status(400).json({ message: 'Variety and quantity required' });
    const stock = await prisma.paddyStock.create({
      data: {
        variety,
        quantityKg: parseFloat(quantityKg),
        qualityGrade: qualityGrade || 'A',
        supplierId: supplierId || null,
        purchasePrice: parseFloat(purchasePrice || 0),
        notes
      }
    });
    res.status(201).json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/paddy/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { variety, quantityKg, qualityGrade, purchasePrice, notes } = req.body;
    const stock = await prisma.paddyStock.update({
      where: { id: req.params.id },
      data: { variety, quantityKg: parseFloat(quantityKg), qualityGrade, purchasePrice: parseFloat(purchasePrice || 0), notes }
    });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── RICE STOCK ───────────────────────────────────────────────

router.get('/rice', auth, denySupplier, async (req, res) => {
  try {
    const { q, grade, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (grade) where.grade = grade;
    if (q) where.variety = { contains: q };
    const [stocks, total] = await Promise.all([
      prisma.riceStock.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit)
      }),
      prisma.riceStock.count({ where })
    ]);
    res.json({ stocks, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/rice', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { variety, grade, quantityKg, pricePerKg } = req.body;
    if (!variety || !quantityKg) return res.status(400).json({ message: 'Variety and quantity required' });
    const stock = await prisma.riceStock.create({
      data: { variety, grade: grade || 'A', quantityKg: parseFloat(quantityKg), pricePerKg: parseFloat(pricePerKg || 0) }
    });
    res.status(201).json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/rice/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { variety, grade, quantityKg, pricePerKg } = req.body;
    const stock = await prisma.riceStock.update({
      where: { id: req.params.id },
      data: { variety, grade, quantityKg: parseFloat(quantityKg), pricePerKg: parseFloat(pricePerKg || 0) }
    });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── SUMMARY & ALERTS ────────────────────────────────────────

router.get('/summary', auth, denySupplier, async (req, res) => {
  try {
    const [paddy, rice, lowPaddy, lowRice] = await Promise.all([
      prisma.paddyStock.aggregate({ _sum: { quantityKg: true }, _count: true }),
      prisma.riceStock.aggregate({ _sum: { quantityKg: true }, _count: true }),
      prisma.paddyStock.findMany({
        where: { quantityKg: { lte: LOW_STOCK_THRESHOLD } },
        select: { id: true, variety: true, quantityKg: true, qualityGrade: true }
      }),
      prisma.riceStock.findMany({
        where: { quantityKg: { lte: LOW_STOCK_THRESHOLD } },
        select: { id: true, variety: true, quantityKg: true, grade: true }
      })
    ]);
    res.json({
      totalPaddyKg: paddy._sum.quantityKg || 0,
      paddyEntries: paddy._count,
      totalRiceKg: rice._sum.quantityKg || 0,
      riceEntries: rice._count,
      lowStockAlerts: { paddy: lowPaddy, rice: lowRice }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
