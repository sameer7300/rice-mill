const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const mailer = require('../lib/mailer');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/contact — public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ message: 'Name, email, subject, and message are required' });
    const msg = await prisma.contactMessage.create({ data: { name, email, phone: phone || null, subject, message } });
    mailer.sendContactConfirmation(email, name, subject).catch(() => {});
    res.status(201).json({ ok: true, id: msg.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/contact-messages — admin/staff
router.get('/admin', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { page = 1, limit = 25, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = unreadOnly === 'true' ? { isRead: false } : {};
    const [messages, total, unread] = await Promise.all([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { isRead: false } })
    ]);
    res.json({ messages, total, pages: Math.ceil(total / parseInt(limit)), unreadCount: unread });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/contact-messages/:id/read
router.patch('/admin/:id/read', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const msg = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
