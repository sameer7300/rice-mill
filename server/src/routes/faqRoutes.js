const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Public — active FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: faqs });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Admin — all FAQs
router.get('/all', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: faqs });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { question, answer, sortOrder, isActive } = req.body;
    const faq = await prisma.fAQ.create({
      data: { question, answer, sortOrder: parseInt(sortOrder || 0), isActive: isActive !== false },
    });
    res.status(201).json({ success: true, data: faq });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { question, answer, sortOrder, isActive } = req.body;
    const faq = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: { question, answer, sortOrder: parseInt(sortOrder || 0), isActive: Boolean(isActive) },
    });
    res.json({ success: true, data: faq });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.fAQ.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.patch('/reorder', auth, requireRole('admin'), async (req, res) => {
  try {
    const { ids } = req.body;
    await Promise.all(ids.map((id, i) =>
      prisma.fAQ.update({ where: { id }, data: { sortOrder: i + 1 } })
    ));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
