const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, address: true, isActive: true, createdAt: true, preferredLang: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone, address, businessName } = req.body;
    const hashedPw = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPw, role, phone, address }
    });

    if (role === 'customer') {
      await prisma.customer.create({ data: { userId: user.id, businessName: businessName || name, phone, address } });
    }
    if (role === 'supplier') {
      await prisma.supplier.create({ data: { userId: user.id, businessName: businessName || name, phone, address } });
    }

    const { password: _, ...userSafe } = user;
    res.status(201).json(userSafe);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, phone, address, isActive, preferredLang, password } = req.body;
    const data = { name, phone, address, isActive, preferredLang };
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update own language preference
router.patch('/me/lang', auth, async (req, res) => {
  try {
    const { lang } = req.body;
    await prisma.user.update({ where: { id: req.user.id }, data: { preferredLang: lang } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
