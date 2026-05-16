const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/wholesale/inquiry — public
router.post('/inquiry', async (req, res) => {
  try {
    const { productId, name, email, phone, quantityKg, requiredBy, deliveryCity, message } = req.body;
    if (!name || !email || !phone || !quantityKg || !deliveryCity) {
      return res.status(400).json({ success: false, error: 'Name, email, phone, quantity, and delivery city are required' });
    }
    if (parseFloat(quantityKg) < 500) {
      return res.status(400).json({ success: false, error: 'Minimum bulk order is 500kg' });
    }
    const inquiry = await prisma.wholesaleInquiry.create({
      data: {
        productId: productId || null,
        name, email, phone,
        quantityKg: parseFloat(quantityKg),
        requiredBy: requiredBy ? new Date(requiredBy) : null,
        deliveryCity,
        message: message || null
      }
    });
    res.status(201).json({ success: true, data: inquiry, message: 'Your inquiry has been received. We will contact you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/wholesale/admin — admin/staff list
router.get('/admin', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};
    const [inquiries, total] = await Promise.all([
      prisma.wholesaleInquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.wholesaleInquiry.count({ where })
    ]);
    const newCount = await prisma.wholesaleInquiry.count({ where: { status: 'new' } });
    res.json({ success: true, data: inquiries, total, pages: Math.ceil(total / parseInt(limit)), newCount });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PATCH /api/wholesale/admin/:id
router.patch('/admin/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status, adminNote, quotedPrice } = req.body;
    const inquiry = await prisma.wholesaleInquiry.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
        ...(quotedPrice !== undefined && { quotedPrice: parseFloat(quotedPrice) })
      }
    });
    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
