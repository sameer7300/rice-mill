const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// In-memory clients for SSE
const clients = new Map();

// SSE stream endpoint
router.get('/stream', auth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const clientId = `${req.user.id}-${Date.now()}`;
  clients.set(clientId, { res, userId: req.user.id, role: req.user.role });

  const keepAlive = setInterval(() => {
    res.write(':ping\n\n');
  }, 25000);

  req.on('close', () => {
    clients.delete(clientId);
    clearInterval(keepAlive);
  });

  // Send initial snapshot on connect
  sendSnapshot(req.user.id, req.user.role, res);
});

async function sendSnapshot(userId, role, res) {
  try {
    const LOW_THRESHOLD = 500;
    const [lowPaddy, lowRice, pendingOrders, pendingBatches] = await Promise.all([
      prisma.paddyStock.count({ where: { quantityKg: { lte: LOW_THRESHOLD } } }),
      prisma.riceStock.count({ where: { quantityKg: { lte: LOW_THRESHOLD } } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.millBatch.count({ where: { status: 'pending' } })
    ]);

    const notifications = [];
    if (lowPaddy > 0) notifications.push({ id: 'low-paddy', type: 'warning', title: 'Low Paddy Stock', message: `${lowPaddy} paddy entries below 500kg`, time: new Date().toISOString() });
    if (lowRice > 0) notifications.push({ id: 'low-rice', type: 'warning', title: 'Low Rice Stock', message: `${lowRice} rice entries below 500kg`, time: new Date().toISOString() });
    if (pendingOrders > 0) notifications.push({ id: 'pending-orders', type: 'info', title: 'Pending Orders', message: `${pendingOrders} order${pendingOrders > 1 ? 's' : ''} waiting for action`, time: new Date().toISOString() });
    if (pendingBatches > 0) notifications.push({ id: 'pending-batches', type: 'info', title: 'Mill Batches Ready', message: `${pendingBatches} batch${pendingBatches > 1 ? 'es' : ''} pending start`, time: new Date().toISOString() });

    if (res && !res.destroyed) {
      res.write(`data: ${JSON.stringify({ type: 'snapshot', notifications })}\n\n`);
    }
  } catch (err) {
    console.error('Snapshot error:', err.message);
  }
}

// Broadcast to all connected staff/admin clients
function broadcast(event) {
  clients.forEach(({ res, role }) => {
    if ((role === 'admin' || role === 'staff') && !res.destroyed) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });
}

// Get notifications as JSON (polling fallback)
router.get('/', auth, async (req, res) => {
  try {
    const LOW = 500;
    const [lowPaddy, lowRice, pendingOrders, pendingBatches, unpaidOrders] = await Promise.all([
      prisma.paddyStock.findMany({ where: { quantityKg: { lte: LOW } }, select: { variety: true, quantityKg: true } }),
      prisma.riceStock.findMany({ where: { quantityKg: { lte: LOW } }, select: { variety: true, quantityKg: true } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.millBatch.count({ where: { status: 'pending' } }),
      prisma.order.aggregate({ where: { paymentStatus: { not: 'paid' } }, _sum: { totalAmount: true, paidAmount: true } })
    ]);

    const outstanding = (unpaidOrders._sum.totalAmount || 0) - (unpaidOrders._sum.paidAmount || 0);
    const notifications = [];
    lowPaddy.forEach(p => notifications.push({ id: `paddy-${p.variety}`, type: 'warning', title: 'Low Paddy', message: `${p.variety}: only ${p.quantityKg}kg left` }));
    lowRice.forEach(r => notifications.push({ id: `rice-${r.variety}`, type: 'warning', title: 'Low Rice', message: `${r.variety}: only ${r.quantityKg}kg left` }));
    if (pendingOrders > 0) notifications.push({ id: 'orders', type: 'info', title: `${pendingOrders} Pending Orders`, message: 'Need confirmation or processing' });
    if (pendingBatches > 0) notifications.push({ id: 'batches', type: 'info', title: `${pendingBatches} Mill Batches`, message: 'Ready to start milling' });
    if (outstanding > 100000) notifications.push({ id: 'outstanding', type: 'warning', title: 'High Outstanding', message: `PKR ${outstanding.toLocaleString()} uncollected` });

    res.json({ notifications, count: notifications.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, broadcast };
