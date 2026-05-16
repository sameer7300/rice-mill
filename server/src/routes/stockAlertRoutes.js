const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/stock-alerts — public
router.post('/', async (req, res) => {
  try {
    const { productId, email, phone, notifyVia } = req.body;
    if (!productId || !email) return res.status(400).json({ success: false, error: 'Product and email required' });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    if (product.inStock) return res.status(400).json({ success: false, error: 'Product is already in stock' });
    // Upsert by email + productId
    const existing = await prisma.stockAlert.findFirst({ where: { productId, email } });
    if (existing) return res.json({ success: true, message: 'You are already on the waitlist for this product' });
    await prisma.stockAlert.create({
      data: { productId, email, phone: phone || null, notifyVia: notifyVia || 'email', userId: null }
    });
    res.status(201).json({ success: true, message: "You're on the waitlist! We'll notify you when it's back in stock." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stock-alerts/admin — admin/staff list
router.get('/admin', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const alerts = await prisma.stockAlert.findMany({
      include: { product: { select: { name: true, variety: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
