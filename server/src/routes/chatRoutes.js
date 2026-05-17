const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── PUBLIC: Start or resume conversation ─────────────────────────────────────

router.post('/start', async (req, res) => {
  try {
    const { guestName, guestEmail, guestId, customerId, message, subject } = req.body;

    // Try to resume existing open conversation
    let conv = null;
    if (customerId) {
      conv = await prisma.chatConversation.findFirst({
        where: { customerId, status: 'open' },
        orderBy: { createdAt: 'desc' },
      });
    } else if (guestId) {
      conv = await prisma.chatConversation.findFirst({
        where: { guestId, status: 'open' },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!conv) {
      conv = await prisma.chatConversation.create({
        data: {
          customerId: customerId || null,
          guestName: guestName || 'Guest',
          guestEmail: guestEmail || null,
          guestId: guestId || null,
          subject: subject || 'General Inquiry',
          status: 'open',
          lastMessageAt: new Date(),
        },
      });
    }

    // Send initial message if provided
    if (message?.trim()) {
      await prisma.chatMessage.create({
        data: {
          conversationId: conv.id,
          senderId: null,
          senderName: guestName || 'Customer',
          senderRole: customerId ? 'customer' : 'guest',
          message: message.trim(),
        },
      });
      await prisma.chatConversation.update({
        where: { id: conv.id },
        data: { unreadAdmin: { increment: 1 }, lastMessageAt: new Date() },
      });
    }

    res.json({ success: true, data: conv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUBLIC: Get messages for a conversation ──────────────────────────────────

router.get('/:conversationId/messages', async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUBLIC: Get conversation by guestId or customerId ───────────────────────

router.get('/my', async (req, res) => {
  try {
    const { guestId, customerId } = req.query;
    const where = customerId
      ? { customerId, status: 'open' }
      : { guestId, status: 'open' };

    const conv = await prisma.chatConversation.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: conv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN: List conversations ────────────────────────────────────────────────

router.get('/admin/conversations', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status, page = 1, limit = 40, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (q) {
      where.OR = [
        { guestName: { contains: q } },
        { guestEmail: { contains: q } },
        { subject: { contains: q } },
      ];
    }

    const [conversations, total] = await Promise.all([
      prisma.chatConversation.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          customer: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.chatConversation.count({ where }),
    ]);

    res.json({ success: true, data: { conversations, total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN: Stats ─────────────────────────────────────────────────────────────

router.get('/admin/stats', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const [open, resolved, unreadResult] = await Promise.all([
      prisma.chatConversation.count({ where: { status: 'open' } }),
      prisma.chatConversation.count({ where: { status: 'resolved' } }),
      prisma.chatConversation.aggregate({
        _sum: { unreadAdmin: true },
        where: { status: 'open' },
      }),
    ]);
    res.json({
      success: true,
      data: { open, resolved, unread: unreadResult._sum.unreadAdmin || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN: Update conversation status ────────────────────────────────────────

router.patch('/admin/:id/status', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const conv = await prisma.chatConversation.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: conv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN: Delete conversation ───────────────────────────────────────────────

router.delete('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.chatConversation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
