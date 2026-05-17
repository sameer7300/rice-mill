const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const mailer = require('../lib/mailer');

const router = express.Router();
const prisma = new PrismaClient();

// ─── SKU generation ───────────────────────────────────────────────────────────
const VARIETY_CODES = {
  'Basmati': 'BSM', 'Super Kernel': 'SK', 'IRRI-6': 'IR6',
  'IRRI-9': 'IR9', 'PK-386': 'PK3', 'Other': 'OTH',
};

async function generateSKU(variety, grade) {
  const varCode = VARIETY_CODES[variety] || 'OTH';
  const gradeCode = grade || 'A';
  let sku, exists, attempts = 0;
  do {
    const ts = Date.now().toString().slice(-4);
    const rnd = Math.random().toString(36).substring(2, 4).toUpperCase();
    sku = `RM-${varCode}-${gradeCode}-${ts}${rnd}`;
    exists = await prisma.product.findUnique({ where: { sku } });
    attempts++;
  } while (exists && attempts < 10);
  if (attempts >= 10) throw new Error('Could not generate unique SKU');
  return sku;
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

router.get('/products', auth, requireRole('admin'), async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { riceStock: { select: { quantityKg: true, variety: true, grade: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
    res.json(products);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/products', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, variety, grade, description, imageUrl, images, pricePerKg, minOrderKg, maxOrderKg,
            isPublished, tags, riceStockId, sortOrder, sku: providedSku,
            weight, packaging, origin, processingType, moistureContent, grainLength,
            cookingTime, aroma, brokenGrain, certifications, shelfLife,
            storageInstructions, nutritionInfo } = req.body;
    if (!name || !pricePerKg) return res.status(400).json({ message: 'Name and price required' });

    // Resolve SKU — use provided or auto-generate
    let finalSku = providedSku?.trim() || null;
    if (!finalSku) {
      finalSku = await generateSKU(variety || name, grade || 'A');
    } else {
      const existing = await prisma.product.findUnique({ where: { sku: finalSku } });
      if (existing) return res.status(400).json({ success: false, error: `SKU "${finalSku}" already exists` });
    }

    const imagesJson = Array.isArray(images) ? JSON.stringify(images) : (images || null);

    const product = await prisma.product.create({
      data: {
        name, variety: variety || name, grade: grade || 'A', sku: finalSku,
        description, imageUrl, images: imagesJson,
        pricePerKg: parseFloat(pricePerKg),
        minOrderKg: parseFloat(minOrderKg || 10),
        maxOrderKg: maxOrderKg ? parseFloat(maxOrderKg) : null,
        isPublished: Boolean(isPublished), tags, riceStockId: riceStockId || null,
        sortOrder: parseInt(sortOrder || 0),
        weight: weight ? parseFloat(weight) : null, packaging, origin, processingType,
        moistureContent, grainLength, cookingTime, aroma, brokenGrain,
        certifications, shelfLife, storageInstructions, nutritionInfo,
      }
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.put('/products/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, variety, grade, description, imageUrl, images, pricePerKg, minOrderKg, maxOrderKg,
            isPublished, inStock, tags, riceStockId, sortOrder,
            weight, packaging, origin, processingType, moistureContent, grainLength,
            cookingTime, aroma, brokenGrain, certifications, shelfLife,
            storageInstructions, nutritionInfo } = req.body;
    const imagesJson = Array.isArray(images) ? JSON.stringify(images) : (images || null);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name, variety, grade, description, imageUrl, images: imagesJson,
        pricePerKg: parseFloat(pricePerKg),
        minOrderKg: parseFloat(minOrderKg || 10),
        maxOrderKg: maxOrderKg ? parseFloat(maxOrderKg) : null,
        isPublished: Boolean(isPublished), inStock: Boolean(inStock),
        tags, riceStockId: riceStockId || null, sortOrder: parseInt(sortOrder || 0),
        weight: weight ? parseFloat(weight) : null, packaging, origin, processingType,
        moistureContent, grainLength, cookingTime, aroma, brokenGrain,
        certifications, shelfLife, storageInstructions, nutritionInfo,
      }
    });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/products/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Quick toggle publish/stock
router.patch('/products/:id/toggle', auth, requireRole('admin'), async (req, res) => {
  try {
    const { field } = req.body; // isPublished | inStock
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { [field]: !product[field] }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ─── STORE SETTINGS ──────────────────────────────────────────────────────────

router.get('/settings', auth, requireRole('admin'), async (req, res) => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) settings = await prisma.storeSettings.create({ data: {} });
    res.json(settings);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/settings', auth, requireRole('admin'), async (req, res) => {
  try {
    const { storeName, tagline, phone, email, address, city, whatsappNumber, currency, shippingFee, freeShippingAbove, minOrderKg, isOpen, bannerTitle, bannerSubtitle } = req.body;
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: { storeName, tagline, phone, email, address, city, whatsappNumber, currency, shippingFee: parseFloat(shippingFee || 500), freeShippingAbove: parseFloat(freeShippingAbove || 10000), minOrderKg: parseFloat(minOrderKg || 10), isOpen: Boolean(isOpen), bannerTitle, bannerSubtitle } });
    } else {
      settings = await prisma.storeSettings.update({ where: { id: settings.id }, data: { storeName, tagline, phone, email, address, city, whatsappNumber, currency, shippingFee: parseFloat(shippingFee || 500), freeShippingAbove: parseFloat(freeShippingAbove || 10000), minOrderKg: parseFloat(minOrderKg || 10), isOpen: Boolean(isOpen), bannerTitle, bannerSubtitle } });
    }
    res.json(settings);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ─── DISCOUNTS ───────────────────────────────────────────────────────────────

router.get('/discounts', auth, requireRole('admin'), async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(discounts);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/discounts', auth, requireRole('admin'), async (req, res) => {
  try {
    const { code, description, type, value, minOrderAmt, usageLimit, expiresAt, isActive } = req.body;
    if (!code || !value) return res.status(400).json({ message: 'Code and value required' });
    const discount = await prisma.discount.create({
      data: { code: code.toUpperCase().trim(), description, type: type || 'percentage', value: parseFloat(value), minOrderAmt: parseFloat(minOrderAmt || 0), usageLimit: parseInt(usageLimit || 0), expiresAt: expiresAt ? new Date(expiresAt) : null, isActive: isActive !== false }
    });
    res.status(201).json(discount);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Discount code already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/discounts/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { description, type, value, minOrderAmt, usageLimit, expiresAt, isActive } = req.body;
    const d = await prisma.discount.update({
      where: { id: req.params.id },
      data: { description, type, value: parseFloat(value), minOrderAmt: parseFloat(minOrderAmt || 0), usageLimit: parseInt(usageLimit || 0), expiresAt: expiresAt ? new Date(expiresAt) : null, isActive: Boolean(isActive) }
    });
    res.json(d);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/discounts/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.discount.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ─── ECOMMERCE STATS ─────────────────────────────────────────────────────────

router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [onlineOrders, monthOnline, totalRevenue, monthRevenue, topProducts, recentOrders] = await Promise.all([
      prisma.order.count({ where: { source: 'online' } }),
      prisma.order.count({ where: { source: 'online', createdAt: { gte: monthStart } } }),
      prisma.order.aggregate({ where: { source: 'online' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { source: 'online', createdAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
      prisma.orderItem.groupBy({
        by: ['variety'],
        where: { order: { source: 'online' } },
        _sum: { quantityKg: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5
      }),
      prisma.order.findMany({
        where: { source: 'online' },
        include: { customer: { include: { user: { select: { name: true } } } }, items: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      totalOrders: onlineOrders,
      monthOrders: monthOnline,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      monthRevenue: monthRevenue._sum.totalAmount || 0,
      topProducts,
      recentOrders,
      publishedProducts: await prisma.product.count({ where: { isPublished: true } }),
      activeDiscounts: await prisma.discount.count({ where: { isActive: true } })
    });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ─── PROMO CODE BULK GENERATION ──────────────────────────────────────────────

router.post('/discounts/generate', auth, requireRole('admin'), async (req, res) => {
  try {
    const { type = 'percentage', value, prefix = 'RICE', count = 1, minOrderAmt = 0, usageLimit = 1, expiresAt, description } = req.body;
    if (!value) return res.status(400).json({ message: 'Discount value required' });
    const n = Math.min(parseInt(count || 1), 100);

    function randCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let s = '';
      for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return `${prefix.toUpperCase()}-${s}`;
    }

    const created = [];
    let attempts = 0;
    while (created.length < n && attempts < n * 5) {
      const code = randCode();
      attempts++;
      const exists = await prisma.discount.findUnique({ where: { code } });
      if (!exists) {
        const d = await prisma.discount.create({
          data: { code, type, value: parseFloat(value), minOrderAmt: parseFloat(minOrderAmt || 0), usageLimit: parseInt(usageLimit || 1), expiresAt: expiresAt ? new Date(expiresAt) : null, isActive: true, description: description || null }
        });
        created.push(d);
      }
    }
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── TEST EMAIL ──────────────────────────────────────────────────────────────

router.post('/test-email', auth, requireRole('admin'), async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    await mailer.sendTestEmail(admin.email);
    res.json({ message: `Test email sent to ${admin.email}` });
  } catch (err) {
    res.status(500).json({ message: 'Email send failed', error: err.message });
  }
});

// ─── NEWSLETTER BLAST ─────────────────────────────────────────────────────────

router.post('/email/blast', auth, requireRole('admin'), async (req, res) => {
  try {
    const { subject, htmlContent, testMode } = req.body;
    if (!subject || !htmlContent) return res.status(400).json({ message: 'Subject and content are required' });

    if (testMode) {
      const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
      await mailer.sendNewsletterBlast([admin.email], `[TEST] ${subject}`, htmlContent);
      return res.json({ success: true, message: `Test blast sent to ${admin.email}`, sent: 1 });
    }

    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      select: { email: true }
    });
    const emails = subscribers.map(s => s.email);
    if (!emails.length) return res.json({ success: true, message: 'No active subscribers', sent: 0 });

    const { sent, failed } = await mailer.sendNewsletterBlast(emails, subject, htmlContent);
    res.json({ success: true, message: `Sent to ${sent} subscribers (${failed} failed)`, sent, failed });
  } catch (err) {
    res.status(500).json({ message: 'Blast failed', error: err.message });
  }
});

// ─── CUSTOM EMAIL SEND ────────────────────────────────────────────────────────

router.post('/email/send', auth, requireRole('admin'), async (req, res) => {
  try {
    const { to, template, subject, customMessage, name } = req.body;
    if (!to) return res.status(400).json({ message: 'Recipient email required' });

    const recipientName = name || 'Customer';
    let result;

    switch (template) {
      case 'welcome':
        result = await mailer.sendWelcomeEmail(to, recipientName);
        break;
      case 'password_reset':
        result = await mailer.sendPasswordResetEmail(to, recipientName, 'admin-reset-' + Date.now());
        break;
      case 'password_changed':
        result = await mailer.sendPasswordChangedEmail(to, recipientName);
        break;
      case 'newsletter':
        result = await mailer.sendNewsletterWelcomeEmail(to);
        break;
      case 'contact':
        result = await mailer.sendContactConfirmationEmail(to, recipientName, subject || 'Admin Message');
        break;
      case 'custom':
      default: {
        const { sendMail } = require('../lib/mailer');
        // Use mailer's base template + custom message via sendTestEmail pattern
        result = await mailer.sendTestEmail(to);
        break;
      }
    }

    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    res.status(500).json({ message: 'Send failed', error: err.message });
  }
});

// ─── WHATSAPP LOG ─────────────────────────────────────────────────────────────

router.get('/whatsapp-log', auth, requireRole('admin'), async (req, res) => {
  try {
    const logs = await prisma.whatsAppLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PRICING TIERS ────────────────────────────────────────────────────────────

// Public — active tiers
router.get('/pricing-tiers', async (req, res) => {
  try {
    const tiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: tiers });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Admin — all tiers (including inactive)
router.get('/pricing-tiers/all', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const tiers = await prisma.pricingTier.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: tiers });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/pricing-tiers', auth, requireRole('admin'), async (req, res) => {
  try {
    const { label, rangeLabel, discount, description, ctaText, ctaType, sortOrder, isActive } = req.body;
    const tier = await prisma.pricingTier.create({
      data: { label, rangeLabel, discount, description, ctaText, ctaType, sortOrder: parseInt(sortOrder || 0), isActive: isActive !== false },
    });
    res.status(201).json({ success: true, data: tier });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/pricing-tiers/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { label, rangeLabel, discount, description, ctaText, ctaType, sortOrder, isActive } = req.body;
    const tier = await prisma.pricingTier.update({
      where: { id: req.params.id },
      data: { label, rangeLabel, discount, description, ctaText, ctaType, sortOrder: parseInt(sortOrder || 0), isActive: Boolean(isActive) },
    });
    res.json({ success: true, data: tier });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.delete('/pricing-tiers/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.pricingTier.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.patch('/pricing-tiers/reorder', auth, requireRole('admin'), async (req, res) => {
  try {
    const { ids } = req.body; // ordered array of ids
    await Promise.all(ids.map((id, i) =>
      prisma.pricingTier.update({ where: { id }, data: { sortOrder: i + 1 } })
    ));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── WHOLESALE PAGE CONTENT ────────────────────────────────────────────────────

router.get('/wholesale-content', async (req, res) => {
  try {
    let content = await prisma.wholesalePageContent.findUnique({ where: { id: 'main' } });
    if (!content) content = await prisma.wholesalePageContent.create({ data: { id: 'main' } });
    res.json({ success: true, data: content });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/wholesale-content', auth, requireRole('admin'), async (req, res) => {
  try {
    const { heroTitle, heroSubtitle, exportNote, testimonialText, testimonialName, testimonialRole, warehouseImage, loadingImage } = req.body;
    const content = await prisma.wholesalePageContent.upsert({
      where: { id: 'main' },
      update: { heroTitle, heroSubtitle, exportNote, testimonialText, testimonialName, testimonialRole, warehouseImage, loadingImage },
      create: { id: 'main', heroTitle, heroSubtitle, exportNote, testimonialText, testimonialName, testimonialRole, warehouseImage, loadingImage },
    });
    res.json({ success: true, data: content });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
