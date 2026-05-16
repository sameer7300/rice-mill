const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const wa = require('../lib/whatsapp');
const mailer = require('../lib/mailer');

const router = express.Router();
const prisma = new PrismaClient();

function generateOrderNumber() {
  const now = new Date();
  return `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 90000 + 10000)}`;
}

// Get orders with search, filter, pagination
router.get('/', auth, async (req, res) => {
  try {
    const { q, status, paymentStatus, page = 1, limit = 20, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (req.user.role === 'customer') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) return res.json({ orders: [], total: 0, pages: 0 });
      where.customerId = customer.id;
    }
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }
    if (q) {
      where.OR = [
        { orderNumber: { contains: q } },
        { customer: { businessName: { contains: q } } },
        { customer: { user: { name: { contains: q } } } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { include: { user: { select: { name: true } } } },
          items: { include: { riceStock: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({ orders, total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { include: { user: { select: { name: true, email: true, phone: true } } } },
        items: { include: { riceStock: true } }
      }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order — deducts rice stock quantity
router.post('/', auth, async (req, res) => {
  try {
    const { customerId: bodyCustomerId, items, deliveryAddress, notes, paymentMethod } = req.body;

    let customerId = bodyCustomerId;
    if (req.user.role === 'customer') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) return res.status(400).json({ message: 'Customer profile not found' });
      customerId = customer.id;
    }

    if (!customerId) return res.status(400).json({ message: 'Customer is required' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'At least one item required' });

    // Validate stock availability for items linked to rice stock
    for (const item of items) {
      if (item.riceStockId) {
        const stock = await prisma.riceStock.findUnique({ where: { id: item.riceStockId } });
        if (!stock) return res.status(400).json({ message: `Stock item not found` });
        if (stock.quantityKg < parseFloat(item.quantityKg)) {
          return res.status(400).json({ message: `Insufficient stock for ${stock.variety}: available ${stock.quantityKg}kg, requested ${item.quantityKg}kg` });
        }
      }
    }

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.quantityKg) * parseFloat(item.pricePerKg), 0);

    // Create order + deduct stock in a single transaction
    const stockUpdates = items
      .filter(item => item.riceStockId)
      .map(item => prisma.riceStock.update({
        where: { id: item.riceStockId },
        data: { quantityKg: { decrement: parseFloat(item.quantityKg) } }
      }));

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId,
          totalAmount,
          deliveryAddress,
          notes,
          items: {
            create: items.map(item => ({
              riceStockId: item.riceStockId || null,
              variety: item.variety,
              grade: item.grade,
              quantityKg: parseFloat(item.quantityKg),
              pricePerKg: parseFloat(item.pricePerKg),
              totalPrice: parseFloat(item.quantityKg) * parseFloat(item.pricePerKg)
            }))
          }
        },
        include: { items: true, customer: true }
      }),
      ...stockUpdates
    ]);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.patch('/:id/status', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!VALID.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await prisma.order.update({
      where: { id: req.params.id }, data: { status },
      include: { customer: { include: { user: { select: { name: true, phone: true } } } } }
    });
    // WhatsApp + Email notification (fire-and-forget)
    if (await wa.shouldSend('notifyStatusUpdate') && order.customer) {
      const notification = wa.generateOrderStatusUpdate(order, order.customer, status);
      if (notification.url) wa.logWhatsApp({ orderId: order.id, customerId: order.customerId, type: 'status_update', phone: notification.phone, message: notification.message });
    }
    if (order.customer?.user?.email) {
      mailer.sendOrderStatusUpdate(order.customer.user.email, order, status).catch(() => {});
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/payment', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { customer: { include: { user: { select: { name: true, phone: true } } } } }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const paid = parseFloat(paidAmount);
    const paymentStatus = paid >= order.totalAmount ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { paidAmount: paid, paymentStatus }
    });
    // WhatsApp notification (fire-and-forget)
    if (await wa.shouldSend('notifyPayment') && order.customer) {
      const notification = wa.generatePaymentReceived({ ...order, paidAmount: paid }, order.customer, paid);
      if (notification.url) {
        wa.logWhatsApp({ orderId: order.id, customerId: order.customerId, type: 'payment', phone: notification.phone, message: notification.message });
      }
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id/shipping — add courier + tracking + ETA
router.patch('/:id/shipping', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { courierName, trackingNumber, estimatedDelivery } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        courierName: courierName || null,
        trackingNumber: trackingNumber || null,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null
      }
    });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/stats/summary', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [total, pending, processing, delivered, revenue, monthOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: { in: ['confirmed', 'processing', 'shipped'] } } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true, paidAmount: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } })
    ]);
    res.json({
      total, pending, processing, delivered, monthOrders,
      totalRevenue: revenue._sum.totalAmount || 0,
      totalPaid: revenue._sum.paidAmount || 0,
      outstanding: (revenue._sum.totalAmount || 0) - (revenue._sum.paidAmount || 0)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
