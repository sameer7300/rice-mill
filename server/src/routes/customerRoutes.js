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
      { user: { email: { contains: q } } },
      { phone: { contains: q } }
    ];
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true, isActive: true } },
          orders: { orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, totalAmount: true, paidAmount: true, status: true, createdAt: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit)
      }),
      prisma.customer.count({ where })
    ]);
    // Attach outstanding balance to each customer
    const enriched = customers.map(c => ({
      ...c,
      totalOrders: c.orders.length,
      outstanding: c.orders.reduce((s, o) => s + (o.totalAmount - o.paidAmount), 0)
    }));
    res.json({ customers: enriched, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!customer) return res.status(404).json({ message: 'Not found' });

    const totalRevenue = customer.orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalPaid = customer.orders.reduce((s, o) => s + o.paidAmount, 0);
    res.json({ ...customer, totalRevenue, totalPaid, outstanding: totalRevenue - totalPaid });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { businessName, address, contactPerson, phone, creditLimit } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { businessName, address, contactPerson, phone, creditLimit: parseFloat(creditLimit || 0) }
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
