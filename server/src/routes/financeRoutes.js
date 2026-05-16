const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/expenses', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { q, category, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (category) where.category = category;
    if (q) where.description = { contains: q };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }
    const [expenses, total, byCategory] = await Promise.all([
      prisma.expense.findMany({ where, orderBy: { date: 'desc' }, skip, take: parseInt(limit) }),
      prisma.expense.count({ where }),
      prisma.expense.groupBy({ by: ['category'], _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } } })
    ]);
    res.json({ expenses, total, pages: Math.ceil(total / parseInt(limit)), byCategory });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/expenses', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;
    if (!category || !amount) return res.status(400).json({ message: 'Category and amount required' });
    const expense = await prisma.expense.create({
      data: { category, amount: parseFloat(amount), description, date: date ? new Date(date) : new Date() }
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/expenses/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/summary', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const rangeFilter = dateFrom || dateTo ? {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(new Date(dateTo).setHours(23, 59, 59)) })
    } : undefined;

    const [totalRevenue, monthRevenue, rangeRevenue, totalExpenses, monthExpenses, rangeExpenses, purchases, unpaidOrders] = await Promise.all([
      prisma.order.aggregate({ _sum: { paidAmount: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { paidAmount: true } }),
      rangeFilter ? prisma.order.aggregate({ where: { createdAt: rangeFilter }, _sum: { paidAmount: true } }) : null,
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
      rangeFilter ? prisma.expense.aggregate({ where: { date: rangeFilter }, _sum: { amount: true } }) : null,
      prisma.purchase.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { paymentStatus: { not: 'paid' } }, _sum: { totalAmount: true, paidAmount: true } })
    ]);

    const totalRev = totalRevenue._sum.paidAmount || 0;
    const totalExp = totalExpenses._sum.amount || 0;
    const purchaseCosts = purchases._sum.totalAmount || 0;
    const outstanding = (unpaidOrders._sum.totalAmount || 0) - (unpaidOrders._sum.paidAmount || 0);

    res.json({
      totalRevenue: totalRev,
      monthRevenue: monthRevenue._sum.paidAmount || 0,
      rangeRevenue: rangeRevenue?._sum?.paidAmount || null,
      totalExpenses: totalExp,
      monthExpenses: monthExpenses._sum.amount || 0,
      rangeExpenses: rangeExpenses?._sum?.amount || null,
      totalProfit: totalRev - totalExp - purchaseCosts,
      purchaseCosts,
      outstanding
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/monthly', auth, requireRole('admin'), async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const count = Math.min(parseInt(months), 24);
    const data = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const [rev, exp, purchases] = await Promise.all([
        prisma.order.aggregate({ where: { createdAt: { gte: start, lte: end } }, _sum: { paidAmount: true } }),
        prisma.expense.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
        prisma.purchase.aggregate({ where: { receivedAt: { gte: start, lte: end } }, _sum: { totalAmount: true } })
      ]);
      const revenue = rev._sum.paidAmount || 0;
      const expenses = (exp._sum.amount || 0) + (purchases._sum.totalAmount || 0);
      data.push({
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue,
        expenses,
        profit: revenue - expenses
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
