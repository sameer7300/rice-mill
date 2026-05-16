const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../lib/mailer');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const router = express.Router();
const prisma = new PrismaClient();

function generateOrderNumber() {
  const now = new Date();
  return `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 90000 + 10000)}`;
}

// GET store settings (public)
router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET published products — advanced filters
router.get('/products', async (req, res) => {
  try {
    const { q, grade, variety, minPrice, maxPrice, inStock, minOrder, sortBy, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { isPublished: true };

    if (grade) where.grade = grade;
    if (variety) where.variety = variety;
    if (inStock === 'true') where.inStock = true;
    if (minPrice || maxPrice) {
      where.pricePerKg = {};
      if (minPrice) where.pricePerKg.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerKg.lte = parseFloat(maxPrice);
    }
    if (minOrder) {
      const mo = parseFloat(minOrder);
      if (mo > 0) where.minOrderKg = { lte: mo };
    }
    if (q) where.OR = [
      { name: { contains: q } },
      { variety: { contains: q } },
      { shortDescription: { contains: q } },
      { description: { contains: q } }
    ];

    // Sort
    let orderBy = [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
    if (sortBy === 'price_asc') orderBy = [{ pricePerKg: 'asc' }];
    else if (sortBy === 'price_desc') orderBy = [{ pricePerKg: 'desc' }];
    else if (sortBy === 'newest') orderBy = [{ createdAt: 'desc' }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          riceStock: { select: { quantityKg: true } },
          _count: { select: { reviews: { where: { status: 'approved' } } } }
        },
        orderBy,
        skip, take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    const enriched = products.map(p => ({
      ...p,
      availableKg: p.riceStock?.quantityKg || 0,
      inStock: p.inStock && (p.riceStock ? p.riceStock.quantityKg > 0 : true),
      reviewCount: p._count?.reviews || 0
    }));
    res.json({ products: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET unique varieties for filter
router.get('/varieties', async (req, res) => {
  try {
    const varieties = await prisma.product.findMany({
      where: { isPublished: true },
      select: { variety: true },
      distinct: ['variety']
    });
    res.json(varieties.map(v => v.variety));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { riceStock: { select: { quantityKg: true } } }
    });
    if (!product || !product.isPublished) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product, availableKg: product.riceStock?.quantityKg || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST validate discount code
router.post('/discount/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const discount = await prisma.discount.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
      }
    });
    if (!discount) return res.status(404).json({ message: 'Invalid or expired discount code' });
    if (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit)
      return res.status(400).json({ message: 'Discount code usage limit reached' });
    if (orderTotal < discount.minOrderAmt)
      return res.status(400).json({ message: `Minimum order PKR ${discount.minOrderAmt.toLocaleString()} required for this code` });

    const discountAmount = discount.type === 'percentage'
      ? (orderTotal * discount.value) / 100
      : Math.min(discount.value, orderTotal);

    res.json({ valid: true, discount, discountAmount: parseFloat(discountAmount.toFixed(2)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create-payment-intent (Stripe)
router.post('/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // PKR in paisa (100 paisa = 1 PKR)
      currency: 'pkr',
      automatic_payment_methods: { enabled: true },
      metadata: { store: 'Al-Noor Rice Mills' }
    });
    res.json({ clientSecret: paymentIntent.client_secret, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (err) {
    res.status(500).json({ message: 'Payment setup failed', error: err.message });
  }
});

// GET Stripe publishable key (safe to expose)
router.get('/stripe-config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null });
});

// POST checkout — guest + auto-account + optional full account creation
router.post('/checkout', async (req, res) => {
  try {
    const { name, email, phone, address, city, paymentMethod, items, discountCode, notes, createAccount, password, stripePaymentIntentId } = req.body;

    if (!name || !phone || !address || !items?.length)
      return res.status(400).json({ message: 'Name, phone, address and items are required' });

    // Get store settings for shipping
    const settings = await prisma.storeSettings.findFirst() || {};
    if (!settings.isOpen) return res.status(400).json({ message: 'Store is currently closed. Please try again later.' });

    // Validate items + stock
    const validatedItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { riceStock: true }
      });
      if (!product || !product.isPublished) return res.status(400).json({ message: `Product not available` });
      if (!product.inStock) return res.status(400).json({ message: `${product.name} is out of stock` });
      if (item.quantityKg < product.minOrderKg)
        return res.status(400).json({ message: `Minimum order for ${product.name} is ${product.minOrderKg}kg` });
      if (product.riceStock && product.riceStock.quantityKg < item.quantityKg)
        return res.status(400).json({ message: `Only ${product.riceStock.quantityKg}kg available for ${product.name}` });

      validatedItems.push({ product, quantityKg: parseFloat(item.quantityKg) });
    }

    // Calculate totals
    const subtotal = validatedItems.reduce((s, i) => s + (i.quantityKg * i.product.pricePerKg), 0);
    const totalKg = validatedItems.reduce((s, i) => s + i.quantityKg, 0);
    const shipping = subtotal >= (settings.freeShippingAbove || 10000) ? 0 : (settings.shippingFee || 500);

    // Validate + apply discount
    let discountAmount = 0;
    let appliedCode = null;
    if (discountCode) {
      const discount = await prisma.discount.findFirst({
        where: { code: discountCode.toUpperCase().trim(), isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] }
      });
      if (discount && !(discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit) && subtotal >= discount.minOrderAmt) {
        discountAmount = discount.type === 'percentage'
          ? (subtotal * discount.value) / 100
          : Math.min(discount.value, subtotal);
        appliedCode = discount;
      }
    }

    const totalAmount = subtotal + shipping - discountAmount;

    // Auto-create or find customer
    let customer, createdUser = null;
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        customer = await prisma.customer.findUnique({ where: { userId: existingUser.id } });
        if (!customer) {
          customer = await prisma.customer.create({
            data: { userId: existingUser.id, businessName: name, phone }
          });
        }
      } else {
        // Create new user + customer account
        // If createAccount=true and password provided: use it; else use phone-based temp password
        const usePassword = (createAccount && password && password.length >= 6) ? password : phone.slice(-6);
        const hashedPwd = await bcrypt.hash(usePassword, 10);
        const newUser = await prisma.user.create({
          data: { name, email, password: hashedPwd, role: 'customer', phone, address: `${address}, ${city || ''}` }
        });
        // Generate referral code
        const initial = (name[0] || 'U').toUpperCase();
        const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
        const referralCode = `RM-${initial}${rand}`;
        await prisma.user.update({ where: { id: newUser.id }, data: { referralCode } }).catch(() => {});

        customer = await prisma.customer.create({
          data: { userId: newUser.id, businessName: name, address: `${address}, ${city || ''}`, phone }
        });
        if (createAccount && password) {
          createdUser = newUser;
          mailer.sendWelcomeEmail(email, name, referralCode).catch(() => {});
        }
      }
    } else {
      // No email — find or create by phone
      const existingUser = await prisma.user.findFirst({ where: { phone } });
      if (existingUser) {
        customer = await prisma.customer.findUnique({ where: { userId: existingUser.id } })
          || await prisma.customer.create({ data: { userId: existingUser.id, businessName: name, phone } });
      } else {
        const fakeEmail = `${phone.replace(/\D/g, '')}@shop.ricemill.pk`;
        const hashedPwd = await bcrypt.hash(phone.slice(-6), 10);
        const newUser = await prisma.user.create({
          data: { name, email: fakeEmail, password: hashedPwd, role: 'customer', phone, address: `${address}, ${city || ''}` }
        });
        customer = await prisma.customer.create({
          data: { userId: newUser.id, businessName: name, address: `${address}, ${city || ''}`, phone }
        });
      }
    }

    // Create order + deduct stock in transaction
    const stockUpdates = validatedItems
      .filter(i => i.product.riceStockId)
      .map(i => prisma.riceStock.update({
        where: { id: i.product.riceStockId },
        data: { quantityKg: { decrement: i.quantityKg } }
      }));

    // Stripe payments are pre-collected — mark as paid immediately
    const isStripePaid = paymentMethod === 'stripe' && stripePaymentIntentId;
    const paidAmount = isStripePaid ? totalAmount : 0;
    const paymentStatus = isStripePaid ? 'paid' : 'unpaid';

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          totalAmount,
          paidAmount,
          paymentStatus,
          deliveryAddress: `${address}, ${city || ''}`,
          notes: [
            notes,
            isStripePaid ? `Stripe: ${stripePaymentIntentId}` : null,
            `Method: ${paymentMethod || 'cod'}`
          ].filter(Boolean).join(' · '),
          source: 'online',
          discountCode: appliedCode?.code || null,
          discountAmount,
          items: {
            create: validatedItems.map(i => ({
              riceStockId: i.product.riceStockId || null,
              variety: i.product.variety,
              grade: i.product.grade,
              quantityKg: i.quantityKg,
              pricePerKg: i.product.pricePerKg,
              totalPrice: i.quantityKg * i.product.pricePerKg
            }))
          }
        },
        include: { items: true, customer: { include: { user: { select: { name: true } } } } }
      }),
      ...stockUpdates
    ]);

    // Increment discount usage
    if (appliedCode) {
      await prisma.discount.update({ where: { id: appliedCode.id }, data: { usedCount: { increment: 1 } } });
    }

    // Build WhatsApp message
    const wa = settings.whatsappNumber ? buildWhatsAppMessage(order, validatedItems, settings, shipping, discountAmount) : null;

    // If account was freshly created, return JWT for auto-login
    let authToken = null, authUser = null;
    if (createdUser) {
      authToken = jwt.sign(
        { id: createdUser.id, email: createdUser.email, role: createdUser.role, name: createdUser.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      const { password: _p, twoFactorSecret: _t, twoFactorBackupCodes: _b, ...userSafe } = createdUser;
      authUser = userSafe;
    }

    res.status(201).json({ order, whatsappUrl: wa, shipping, discountAmount, token: authToken, user: authUser });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  }
});

// GET track order (public)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        items: true,
        customer: { include: { user: { select: { name: true, phone: true } } } }
      }
    });
    if (!order) return res.status(404).json({ message: 'Order not found. Check your order number.' });
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerName: order.customer?.user?.name
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

function buildWhatsAppMessage(order, items, settings, shipping, discount) {
  const lines = [
    `🌾 *New Order from ${settings.storeName}*`,
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customer?.user?.name} | ${order.customer?.phone}`,
    `Address: ${order.deliveryAddress}`,
    ``,
    `*Items:*`,
    ...items.map(i => `• ${i.product.name} — ${i.quantityKg}kg × PKR ${i.product.pricePerKg} = PKR ${(i.quantityKg * i.product.pricePerKg).toLocaleString()}`),
    ``,
    `Subtotal: PKR ${(order.totalAmount - shipping + discount).toLocaleString()}`,
    shipping > 0 ? `Shipping: PKR ${shipping.toLocaleString()}` : `Shipping: FREE`,
    discount > 0 ? `Discount: -PKR ${discount.toLocaleString()}` : null,
    `*Total: PKR ${order.totalAmount.toLocaleString()}*`,
  ].filter(Boolean).join('\n');

  const phone = settings.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines)}`;
}

module.exports = router;
