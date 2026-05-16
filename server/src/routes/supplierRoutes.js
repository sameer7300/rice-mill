const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (q) where.OR = [
      { businessName: { contains: q } },
      { user: { name: { contains: q } } },
      { phone: { contains: q } }
    ];
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true, isActive: true } },
          purchases: { orderBy: { createdAt: 'desc' }, take: 5 }
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit)
      }),
      prisma.supplier.count({ where })
    ]);
    const enriched = suppliers.map(s => ({
      ...s,
      totalPurchased: s.purchases.reduce((sum, p) => sum + p.totalAmount, 0),
      totalPaid: s.purchases.reduce((sum, p) => sum + p.paidAmount, 0)
    }));
    res.json({ suppliers: enriched, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        purchases: { orderBy: { createdAt: 'desc' } },
        paddyStock: { orderBy: { receivedAt: 'desc' } }
      }
    });
    if (!supplier) return res.status(404).json({ message: 'Not found' });
    const totalPurchased = supplier.purchases.reduce((s, p) => s + p.totalAmount, 0);
    const totalPaid = supplier.purchases.reduce((s, p) => s + p.paidAmount, 0);
    res.json({ ...supplier, totalPurchased, totalPaid, outstanding: totalPurchased - totalPaid });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/purchases', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { variety, quantityKg, pricePerKg, qualityGrade, notes, paidAmount } = req.body;
    const qty = parseFloat(quantityKg);
    const price = parseFloat(pricePerKg);
    const paid = parseFloat(paidAmount || 0);
    const total = qty * price;
    const paymentStatus = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    const [purchase] = await prisma.$transaction([
      prisma.purchase.create({
        data: {
          supplierId: req.params.id,
          variety,
          quantityKg: qty,
          pricePerKg: price,
          totalAmount: total,
          paidAmount: paid,
          paymentStatus,
          notes
        }
      }),
      prisma.paddyStock.create({
        data: {
          variety,
          quantityKg: qty,
          qualityGrade: qualityGrade || 'A',
          supplierId: req.params.id,
          purchasePrice: price,
          notes
        }
      })
    ]);

    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
