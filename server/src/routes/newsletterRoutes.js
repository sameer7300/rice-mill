const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const mailer = require('../lib/mailer');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/newsletter/subscribe — public
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      if (existing.isActive) return res.json({ message: 'Already subscribed!', alreadySubscribed: true });
      await prisma.newsletter.update({ where: { email }, data: { isActive: true } });
      return res.json({ message: 'Welcome back! You have been re-subscribed.' });
    }
    await prisma.newsletter.create({ data: { email } });
    mailer.sendNewsletterWelcome(email).catch(() => {});
    res.status(201).json({ message: 'Subscribed successfully! Thank you.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/newsletter/unsubscribe — public
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    await prisma.newsletter.updateMany({ where: { email }, data: { isActive: false } });
    res.json({ message: 'You have been unsubscribed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/newsletter/subscribers — admin
router.get('/subscribers', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 30, active } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = active !== undefined ? { isActive: active === 'true' } : {};
    const [subscribers, total] = await Promise.all([
      prisma.newsletter.findMany({ where, orderBy: { subscribedAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.newsletter.count({ where })
    ]);
    res.json({ subscribers, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/newsletter/:id/toggle — admin
router.patch('/:id/toggle', auth, requireRole('admin'), async (req, res) => {
  try {
    const sub = await prisma.newsletter.findUnique({ where: { id: req.params.id } });
    if (!sub) return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.newsletter.update({ where: { id: req.params.id }, data: { isActive: !sub.isActive } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
