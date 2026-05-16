const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/products/:id/view — record view (public, auth optional)
router.post('/:id/view', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;
    if (!userId && !sessionId) return res.json({ success: true });

    // Upsert view (update viewedAt if already viewed)
    const existing = await prisma.recentlyViewed.findFirst({
      where: { productId: req.params.id, ...(userId ? { userId } : { sessionId }) }
    });
    if (existing) {
      await prisma.recentlyViewed.update({ where: { id: existing.id }, data: { viewedAt: new Date() } });
    } else {
      await prisma.recentlyViewed.create({ data: { productId: req.params.id, userId, sessionId } });
      // Keep max 20 per user/session — delete oldest
      const all = await prisma.recentlyViewed.findMany({
        where: userId ? { userId } : { sessionId },
        orderBy: { viewedAt: 'desc' }
      });
      if (all.length > 20) {
        const toDelete = all.slice(20).map(r => r.id);
        await prisma.recentlyViewed.deleteMany({ where: { id: { in: toDelete } } });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true }); // silent fail — never block page
  }
});

// GET /api/products/recently-viewed
router.get('/recently-viewed', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;
    if (!userId && !sessionId) return res.json({ success: true, data: [] });

    const views = await prisma.recentlyViewed.findMany({
      where: { ...(userId ? { userId } : { sessionId }) },
      include: {
        product: {
          include: { riceStock: { select: { quantityKg: true } } }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: 10
    });
    const products = views.map(v => ({
      ...v.product,
      availableKg: v.product.riceStock?.quantityKg || 0,
      viewedAt: v.viewedAt
    })).filter(p => p.isPublished);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
