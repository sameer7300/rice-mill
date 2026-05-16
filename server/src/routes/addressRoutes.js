const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── ADDRESSES ────────────────────────────────────────────────────────────────

router.get('/addresses', auth, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
    res.json({ success: true, data: addresses });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/addresses', auth, async (req, res) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;
    if (!fullName || !phone || !addressLine1 || !city || !state) {
      return res.status(400).json({ success: false, error: 'Name, phone, address, city, and state are required' });
    }
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const isFirst = (await prisma.address.count({ where: { userId: req.user.id } })) === 0;
    const address = await prisma.address.create({
      data: { userId: req.user.id, label: label || 'Home', fullName, phone, addressLine1, addressLine2: addressLine2 || null, city, state, postalCode: postalCode || null, country: country || 'Pakistan', latitude: latitude || null, longitude: longitude || null, isDefault: isDefault || isFirst }
    });
    res.status(201).json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/addresses/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude, isDefault }
    });
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/addresses/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.patch('/addresses/:id/default', auth, async (req, res) => {
  try {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    const address = await prisma.address.update({ where: { id: req.params.id }, data: { isDefault: true } });
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── PAYMENT METHODS ─────────────────────────────────────────────────────────

router.get('/payment-methods', auth, async (req, res) => {
  try {
    const methods = await prisma.savedPaymentMethod.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
    res.json({ success: true, data: methods });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/payment-methods', auth, async (req, res) => {
  try {
    const { type, label, accountTitle, accountNumber, bankName, isDefault } = req.body;
    if (!type || !label) return res.status(400).json({ success: false, error: 'Type and label required' });
    if (isDefault) {
      await prisma.savedPaymentMethod.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const isFirst = (await prisma.savedPaymentMethod.count({ where: { userId: req.user.id } })) === 0;
    // Mask account number — keep last 4
    const maskedAccount = accountNumber ? `****${accountNumber.replace(/\D/g, '').slice(-4)}` : null;
    const method = await prisma.savedPaymentMethod.create({
      data: { userId: req.user.id, type, label, accountTitle: accountTitle || null, accountNumber: maskedAccount, bankName: bankName || null, isDefault: isDefault || isFirst }
    });
    res.status(201).json({ success: true, data: method });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/payment-methods/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.savedPaymentMethod.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    await prisma.savedPaymentMethod.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Payment method removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.patch('/payment-methods/:id/default', auth, async (req, res) => {
  try {
    const existing = await prisma.savedPaymentMethod.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    await prisma.savedPaymentMethod.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    const method = await prisma.savedPaymentMethod.update({ where: { id: req.params.id }, data: { isDefault: true } });
    res.json({ success: true, data: method });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
