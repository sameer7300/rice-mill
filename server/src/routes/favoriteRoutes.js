const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/favorites — my favorites
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.json([]);
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { riceStock: { select: { quantityKg: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/favorites/:productId — toggle
router.post('/:productId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ message: 'Only customers can save favorites' });
    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: req.user.id, productId: req.params.productId } }
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ favorited: false });
    }
    await prisma.favorite.create({ data: { userId: req.user.id, productId: req.params.productId } });
    res.status(201).json({ favorited: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/favorites/count
router.get('/count', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.json({ success: true, data: { count: 0 } });
    const count = await prisma.favorite.count({ where: { userId: req.user.id } });
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/favorites/check/:productId
router.get('/check/:productId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.json({ success: true, data: { isFavorited: false } });
    const fav = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: req.user.id, productId: req.params.productId } }
    });
    res.json({ success: true, data: { isFavorited: !!fav } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
