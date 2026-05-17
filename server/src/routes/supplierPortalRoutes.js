const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const mailer = require('../lib/mailer');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require JWT + supplier role
function requireSupplier(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (req.user.role !== 'supplier') {
    return res.status(403).json({ success: false, error: 'Supplier access only' });
  }
  next();
}

async function getSupplierProfile(userId) {
  const supplier = await prisma.supplier.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!supplier) throw new Error('No supplier profile found for this user');
  return supplier;
}

// ─── GET /profile ─────────────────────────────────────────────────────────────
router.get('/profile', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);
    const [purchases, payments] = await Promise.all([
      prisma.purchase.aggregate({
        where: { supplierId: supplier.id },
        _sum: { totalAmount: true, paidAmount: true },
        _count: { id: true },
      }),
      Promise.resolve(null),
    ]);

    const totalEarned = purchases._sum.totalAmount || 0;
    const totalPaid = purchases._sum.paidAmount || 0;

    res.json({
      success: true,
      data: {
        id: supplier.id,
        businessName: supplier.businessName,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        address: supplier.address,
        bankName: supplier.bankName,
        bankAccount: supplier.bankAccount,
        bankTitle: supplier.bankTitle,
        totalDeliveries: purchases._count.id,
        totalEarned,
        totalPaid,
        outstanding: totalEarned - totalPaid,
        joinedAt: supplier.createdAt,
        userName: supplier.user.name,
        userEmail: supplier.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /profile ─────────────────────────────────────────────────────────────
router.put('/profile', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);
    const { phone, address, contactPerson, bankName, bankAccount, bankTitle } = req.body;

    // Mask bank account — store only last 4 digits
    let maskedAccount = supplier.bankAccount;
    if (bankAccount && bankAccount.trim()) {
      const raw = bankAccount.replace(/\D/g, '');
      maskedAccount = raw.length >= 4 ? `****${raw.slice(-4)}` : bankAccount;
    }

    const updated = await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        phone: phone || supplier.phone,
        address: address || supplier.address,
        contactPerson: contactPerson || supplier.contactPerson,
        bankName: bankName !== undefined ? bankName : supplier.bankName,
        bankAccount: maskedAccount,
        bankTitle: bankTitle !== undefined ? bankTitle : supplier.bankTitle,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /stats ───────────────────────────────────────────────────────────────
router.get('/stats', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [all, thisMonth, lastPurchase] = await Promise.all([
      prisma.purchase.aggregate({
        where: { supplierId: supplier.id },
        _sum: { quantityKg: true, totalAmount: true, paidAmount: true },
        _count: { id: true },
        _avg: { pricePerKg: true },
      }),
      prisma.purchase.aggregate({
        where: { supplierId: supplier.id, createdAt: { gte: startOfMonth } },
        _sum: { quantityKg: true, totalAmount: true },
      }),
      prisma.purchase.findFirst({
        where: { supplierId: supplier.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const totalEarned = all._sum.totalAmount || 0;
    const totalPaid = all._sum.paidAmount || 0;

    res.json({
      success: true,
      data: {
        totalDeliveries: all._count.id,
        totalKgSupplied: all._sum.quantityKg || 0,
        totalEarned,
        totalPaid,
        outstanding: totalEarned - totalPaid,
        avgPricePerKg: all._avg.pricePerKg || 0,
        lastDelivery: lastPurchase?.createdAt || null,
        thisMonthKg: thisMonth._sum.quantityKg || 0,
        thisMonthAmount: thisMonth._sum.totalAmount || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /purchases ───────────────────────────────────────────────────────────
router.get('/purchases', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);
    const { page = 1, limit = 15, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { supplierId: supplier.id };
    if (status && status !== 'all') {
      const statusMap = {
        paid: { paidAmount: { gte: prisma.purchase.fields?.totalAmount } },
        pending: { paidAmount: 0 },
        partial: { AND: [{ paidAmount: { gt: 0 } }] },
      };
      // Use paymentStatus field if it exists, otherwise compute
      if (status === 'paid') where.paymentStatus = 'paid';
      else if (status === 'pending') where.paymentStatus = 'unpaid';
      else if (status === 'partial') where.paymentStatus = 'partial';
    }

    const [purchases, total, summary] = await Promise.all([
      prisma.purchase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.purchase.count({ where }),
      prisma.purchase.aggregate({
        where: { supplierId: supplier.id },
        _sum: { quantityKg: true, totalAmount: true, paidAmount: true },
      }),
    ]);

    const totalEarned = summary._sum.totalAmount || 0;
    const totalPaid = summary._sum.paidAmount || 0;

    res.json({
      success: true,
      data: {
        purchases: purchases.map(p => ({
          ...p,
          outstanding: (p.totalAmount || 0) - (p.paidAmount || 0),
          paymentStatus:
            (p.paidAmount || 0) >= (p.totalAmount || 0) ? 'paid'
            : (p.paidAmount || 0) > 0 ? 'partial'
            : 'unpaid',
        })),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        summary: {
          totalKg: summary._sum.quantityKg || 0,
          totalAmount: totalEarned,
          totalPaid,
          outstanding: totalEarned - totalPaid,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /purchases/:id ───────────────────────────────────────────────────────
router.get('/purchases/:id', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);
    const purchase = await prisma.purchase.findUnique({ where: { id: req.params.id } });

    if (!purchase) return res.status(404).json({ success: false, error: 'Purchase not found' });
    if (purchase.supplierId !== supplier.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        ...purchase,
        outstanding: (purchase.totalAmount || 0) - (purchase.paidAmount || 0),
        paymentStatus:
          (purchase.paidAmount || 0) >= (purchase.totalAmount || 0) ? 'paid'
          : (purchase.paidAmount || 0) > 0 ? 'partial'
          : 'unpaid',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /varieties ───────────────────────────────────────────────────────────
router.get('/varieties', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);
    const purchases = await prisma.purchase.findMany({
      where: { supplierId: supplier.id },
      select: { variety: true, quantityKg: true, pricePerKg: true, createdAt: true },
    });

    const map = new Map();
    for (const p of purchases) {
      if (!map.has(p.variety)) map.set(p.variety, { variety: p.variety, totalKg: 0, prices: [], lastSupplied: null });
      const entry = map.get(p.variety);
      entry.totalKg += p.quantityKg || 0;
      if (p.pricePerKg) entry.prices.push(p.pricePerKg);
      if (!entry.lastSupplied || p.createdAt > entry.lastSupplied) entry.lastSupplied = p.createdAt;
    }

    const varieties = Array.from(map.values()).map(v => ({
      variety: v.variety,
      totalKg: v.totalKg,
      avgPrice: v.prices.length ? v.prices.reduce((a, b) => a + b, 0) / v.prices.length : 0,
      lastSupplied: v.lastSupplied,
    }));

    res.json({ success: true, data: varieties });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /delivery-notice ────────────────────────────────────────────────────
router.post('/delivery-notice', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);
    const { variety, estimatedKg, estimatedDate, qualityGrade = 'A', notes } = req.body;

    if (!variety || !estimatedKg || !estimatedDate) {
      return res.status(400).json({ success: false, error: 'variety, estimatedKg, and estimatedDate are required' });
    }

    const notice = await prisma.deliveryNotice.create({
      data: {
        supplierId: supplier.id,
        variety,
        estimatedKg: parseFloat(estimatedKg),
        estimatedDate: new Date(estimatedDate),
        qualityGrade,
        notes: notes || null,
      },
    });

    // Notify admin via email (fire and forget)
    mailer.sendWholesaleInquiryEmail({
      companyName: supplier.businessName,
      contactName: supplier.contactPerson || supplier.user.name,
      email: supplier.user.email,
      riceVariety: variety,
      quantityKg: estimatedKg,
      message: `Delivery notice submitted. Grade: ${qualityGrade}. Date: ${estimatedDate}. Notes: ${notes || 'None'}`,
    }).catch(() => {});

    res.status(201).json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /delivery-notices ────────────────────────────────────────────────────
router.get('/delivery-notices', auth, requireSupplier, async (req, res) => {
  try {
    const supplier = await getSupplierProfile(req.user.id);
    const notices = await prisma.deliveryNotice.findMany({
      where: { supplierId: supplier.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN: PATCH delivery notice status ─────────────────────────────────────
// Used by admin/staff to confirm or cancel a supplier delivery notice
router.patch('/admin/delivery-notices/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const notice = await prisma.deliveryNotice.update({
      where: { id: req.params.id },
      data: { status, adminNote: adminNote || null },
      include: { supplier: { select: { businessName: true } } },
    });
    res.json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN: GET all delivery notices ─────────────────────────────────────────
router.get('/admin/delivery-notices', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { supplierId, status } = req.query;
    const where = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    const notices = await prisma.deliveryNotice.findMany({
      where,
      include: { supplier: { select: { id: true, businessName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
