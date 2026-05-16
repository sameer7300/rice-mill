const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const mailer = require('../lib/mailer');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reviews/mine — customer's own reviews
router.get('/mine', auth, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: { product: { select: { name: true, id: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/reviews/:id/mine — customer deletes own pending review
router.delete('/:id/mine', auth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId !== req.user.id) return res.status(403).json({ message: 'Not your review' });
    if (review.status === 'approved') return res.status(400).json({ message: 'Cannot delete an approved review' });
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/:productId — public, approved only
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId, status: 'approved' },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const all = await prisma.review.findMany({ where: { productId: req.params.productId, status: 'approved' } });
    const avgRating = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
    // Rating breakdown
    const breakdown = [5, 4, 3, 2, 1].map(star => ({
      star, count: all.filter(r => r.rating === star).length
    }));
    res.json({
      reviews: reviews.map(r => ({
        ...r,
        user: { name: r.user?.name?.split(' ')[0] || 'Customer' } // first name only
      })),
      avgRating: parseFloat(avgRating.toFixed(2)),
      totalCount: all.length,
      breakdown
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reviews/:productId — JWT customer only, one per product
router.post('/:productId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ message: 'Only customers can leave reviews' });
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1–5' });

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user.id, productId: req.params.productId } }
    });
    if (existing) return res.status(409).json({ message: 'You have already reviewed this product' });

    // Check if customer has ordered this product (verifiedPurchase)
    const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
    let verifiedPurchase = false;
    if (customer) {
      const ordered = await prisma.orderItem.findFirst({
        where: {
          order: { customerId: customer.id, status: 'delivered' },
          riceStock: { product: { some: { id: req.params.productId } } }
        }
      });
      verifiedPurchase = Boolean(ordered);
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId: req.params.productId,
        rating: parseInt(rating),
        comment: comment || null,
        status: 'pending',
        verifiedPurchase
      },
      include: { user: { select: { name: true } } }
    });
    res.status(201).json({ ...review, message: 'Review submitted and pending approval' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/reviews/:reviewId/helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const r = await prisma.review.update({
      where: { id: req.params.reviewId },
      data: { helpfulCount: { increment: 1 } }
    });
    res.json({ helpfulCount: r.helpfulCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reviews/:reviewId/report
router.post('/:reviewId/report', auth, async (req, res) => {
  try {
    const r = await prisma.review.update({
      where: { id: req.params.reviewId },
      data: { reportCount: { increment: 1 } }
    });
    res.json({ reportCount: r.reportCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN REVIEW ROUTES ──────────────────────────────────────────────────────

// GET /api/admin/reviews — all reviews with product + customer info
router.get('/admin/all', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, variety: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit)
      }),
      prisma.review.count({ where })
    ]);
    const [pending, approved, rejected] = await Promise.all([
      prisma.review.count({ where: { status: 'pending' } }),
      prisma.review.count({ where: { status: 'approved' } }),
      prisma.review.count({ where: { status: 'rejected' } })
    ]);
    res.json({ reviews, total, pages: Math.ceil(total / parseInt(limit)), stats: { pending, approved, rejected, total: pending + approved + rejected } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/reviews/:id/approve
router.patch('/admin/:id/approve', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: 'approved', adminNote: null },
      include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } }
    });
    if (review.user?.email) {
      mailer.sendReviewApproved(review.user.email, review.product?.name, review.rating).catch(() => {});
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/reviews/:id/reject
router.patch('/admin/:id/reject', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { adminNote } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: 'rejected', adminNote: adminNote || null }
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
