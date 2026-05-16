const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/overview', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      thisMonthRevenue, lastMonthRevenue,
      thisMonthOrders, lastMonthOrders,
      topCustomers, topVarieties,
      ordersByStatus, paymentCollection,
      weeklyOrders, millYieldTrend
    ] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: thisMonthStart } }, _sum: { paidAmount: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { paidAmount: true } }),
      prisma.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.order.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),

      // Top customers by revenue
      prisma.order.groupBy({
        by: ['customerId'],
        _sum: { totalAmount: true, paidAmount: true },
        _count: true,
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 8
      }),

      // Top rice varieties sold
      prisma.orderItem.groupBy({
        by: ['variety'],
        _sum: { quantityKg: true, totalPrice: true },
        _count: true,
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 6
      }),

      // Orders by status
      prisma.order.groupBy({ by: ['status'], _count: true, _sum: { totalAmount: true } }),

      // Payment collection rate (last 30 days)
      prisma.order.aggregate({
        where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
        _sum: { totalAmount: true, paidAmount: true }
      }),

      // Orders per day for last 14 days
      (async () => {
        const days = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
          const [count, rev] = await Promise.all([
            prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
            prisma.order.aggregate({ where: { createdAt: { gte: start, lte: end } }, _sum: { paidAmount: true } })
          ]);
          days.push({
            date: `${d.getDate()}/${d.getMonth() + 1}`,
            orders: count,
            revenue: rev._sum.paidAmount || 0
          });
        }
        return days;
      })(),

      // Mill yield trend (last 10 completed batches)
      prisma.millBatch.findMany({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: 10,
        select: { batchNumber: true, yieldPercent: true, inputQuantityKg: true, outputQuantityKg: true, completedAt: true, paddyStock: { select: { variety: true } } }
      })
    ]);

    // Enrich top customers with names
    const customerDetails = await Promise.all(
      topCustomers.map(async (c) => {
        const cust = await prisma.customer.findUnique({
          where: { id: c.customerId },
          include: { user: { select: { name: true } } }
        });
        return {
          name: cust?.businessName || cust?.user?.name || 'Unknown',
          revenue: c._sum.totalAmount || 0,
          paid: c._sum.paidAmount || 0,
          orders: c._count
        };
      })
    );

    const revGrowth = lastMonthRevenue._sum.paidAmount
      ? ((thisMonthRevenue._sum.paidAmount || 0) - lastMonthRevenue._sum.paidAmount) / lastMonthRevenue._sum.paidAmount * 100
      : 0;
    const ordGrowth = lastMonthOrders
      ? (thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100
      : 0;
    const collectionRate = paymentCollection._sum.totalAmount
      ? ((paymentCollection._sum.paidAmount || 0) / paymentCollection._sum.totalAmount) * 100
      : 0;

    res.json({
      kpis: {
        thisMonthRevenue: thisMonthRevenue._sum.paidAmount || 0,
        lastMonthRevenue: lastMonthRevenue._sum.paidAmount || 0,
        revenueGrowth: parseFloat(revGrowth.toFixed(1)),
        thisMonthOrders,
        lastMonthOrders,
        orderGrowth: parseFloat(ordGrowth.toFixed(1)),
        collectionRate: parseFloat(collectionRate.toFixed(1))
      },
      topCustomers: customerDetails,
      topVarieties: topVarieties.map((v) => ({
        variety: v.variety,
        totalKg: v._sum.quantityKg || 0,
        revenue: v._sum.totalPrice || 0,
        orders: v._count
      })),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count,
        revenue: s._sum.totalAmount || 0
      })),
      weeklyOrders,
      millYieldTrend: millYieldTrend.reverse().map((b) => ({
        batch: b.batchNumber.split('-').pop(),
        yield: b.yieldPercent || 0,
        variety: b.paddyStock?.variety || 'Unknown'
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
