const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── USER: compile basic data package ────────────────────────────────────────

async function compileBasicData(userId) {
  const [user, orders, addresses, paymentMethods, reviews, loyaltyPoints, favorites, dataRequests] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, createdAt: true, referralCode: true, loyaltyBalance: true },
    }),
    prisma.order.findMany({
      where: { customer: { userId } },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.address.findMany({ where: { userId } }),
    prisma.savedPaymentMethod.findMany({ where: { userId }, select: { id: true, type: true, label: true, isDefault: true, createdAt: true } }),
    prisma.review.findMany({ where: { userId }, include: { product: { select: { name: true } } } }),
    prisma.loyaltyPoint.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.favorite.findMany({ where: { userId }, include: { product: { select: { name: true } } } }),
    prisma.dataRequest.findMany({ where: { userId }, select: { id: true, type: true, status: true, requestedAt: true } }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    exportType: 'basic',
    profile: user,
    orders: orders.map(o => ({ ...o, items: o.items })),
    addresses,
    savedPaymentMethods: paymentMethods,
    reviews,
    loyaltyHistory: loyaltyPoints,
    favorites: favorites.map(f => ({ productName: f.product?.name, savedAt: f.createdAt })),
    dataRequests,
  };
}

async function compileFullData(userId) {
  const basic = await compileBasicData(userId);

  const [sessions, pageViews, cookieConsent] = await Promise.all([
    prisma.visitorSession.findMany({
      where: { userId },
      select: { sessionId: true, ipAddress: true, country: true, city: true, device: true, browser: true, os: true, referrer: true, createdAt: true },
    }),
    prisma.pageView.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
    prisma.cookieConsent.findFirst({ where: { userId } }),
  ]);

  return {
    ...basic,
    exportType: 'full',
    visitorSessions: sessions,
    pageViews,
    cookieConsent,
  };
}

// ─── USER ENDPOINTS ───────────────────────────────────────────────────────────

// GET /api/data-requests/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const requests = await prisma.dataRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { requestedAt: 'desc' },
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/data-requests/download/basic — instant download of basic data
router.get('/download/basic', auth, async (req, res) => {
  try {
    const data = await compileBasicData(req.user.id);
    res.setHeader('Content-Disposition', `attachment; filename="my-data-${req.user.id}-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: 'Export failed' });
  }
});

// POST /api/data-requests — submit a full-data request (requires admin approval)
router.post('/', auth, async (req, res) => {
  try {
    const { type = 'full', requestNote } = req.body;
    // Prevent duplicate pending requests
    const existing = await prisma.dataRequest.findFirst({
      where: { userId: req.user.id, type, status: { in: ['pending', 'processing'] } },
    });
    if (existing) return res.status(409).json({ success: false, error: 'You already have a pending request. Please wait for it to be processed.' });

    const request = await prisma.dataRequest.create({
      data: {
        userId: req.user.id,
        type,
        requestNote: requestNote || null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day window
      },
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

// GET /api/data-requests/admin
router.get('/admin', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};
    const [requests, total] = await Promise.all([
      prisma.dataRequest.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.dataRequest.count({ where }),
    ]);
    const pendingCount = await prisma.dataRequest.count({ where: { status: 'pending' } });
    res.json({ success: true, data: requests, total, pendingCount });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/data-requests/admin/:id/preview — admin previews user data before deciding what to share
router.get('/admin/:id/preview', auth, requireRole('admin'), async (req, res) => {
  try {
    const request = await prisma.dataRequest.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    const data = request.type === 'full'
      ? await compileFullData(request.userId)
      : await compileBasicData(request.userId);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/data-requests/admin/:id/download — admin downloads user data package
router.get('/admin/:id/download', auth, requireRole('admin'), async (req, res) => {
  try {
    const { scope = 'basic' } = req.query; // admin can choose: basic | full
    const request = await prisma.dataRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    const data = scope === 'full'
      ? await compileFullData(request.userId)
      : await compileBasicData(request.userId);

    res.setHeader('Content-Disposition', `attachment; filename="user-data-${request.userId}-${scope}-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/data-requests/admin/:id — update status, add note
router.patch('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminNote, downloadUrl } = req.body;
    const VALID = ['pending', 'processing', 'fulfilled', 'rejected'];
    if (status && !VALID.includes(status)) return res.status(400).json({ success: false, error: 'Invalid status' });

    const updated = await prisma.dataRequest.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
        ...(downloadUrl !== undefined && { downloadUrl }),
        ...(status === 'fulfilled' && { fulfilledAt: new Date() }),
      },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
