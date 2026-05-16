const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/careers — public, open only
router.get('/', async (req, res) => {
  try {
    const careers = await prisma.career.findMany({ where: { isOpen: true }, orderBy: { createdAt: 'desc' } });
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/careers/:id — public
router.get('/:id', async (req, res) => {
  try {
    const career = await prisma.career.findUnique({ where: { id: req.params.id } });
    if (!career) return res.status(404).json({ message: 'Position not found' });
    res.json(career);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/careers/:id/apply — public
router.post('/:id/apply', async (req, res) => {
  try {
    const { name, email, phone, coverLetter } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ message: 'Name, email and phone are required' });
    const career = await prisma.career.findUnique({ where: { id: req.params.id } });
    if (!career || !career.isOpen) return res.status(400).json({ message: 'This position is no longer open' });
    const application = await prisma.careerApplication.create({
      data: { careerId: req.params.id, name, email, phone, coverLetter: coverLetter || null }
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: all jobs (open + closed)
router.get('/admin/all', auth, requireRole('admin'), async (req, res) => {
  try {
    const careers = await prisma.career.findMany({
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/careers/admin — create job
router.post('/admin', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, department, location, type, description, isOpen } = req.body;
    if (!title || !department || !location || !type || !description)
      return res.status(400).json({ message: 'All fields required' });
    const career = await prisma.career.create({
      data: { title, department, location, type, description, isOpen: isOpen !== false }
    });
    res.status(201).json(career);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/careers/admin/:id
router.put('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, department, location, type, description, isOpen } = req.body;
    const career = await prisma.career.update({
      where: { id: req.params.id },
      data: { title, department, location, type, description, isOpen: Boolean(isOpen) }
    });
    res.json(career);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/careers/:id/applications — admin
router.get('/:id/applications', auth, requireRole('admin'), async (req, res) => {
  try {
    const applications = await prisma.careerApplication.findMany({
      where: { careerId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/careers/applications/:id/status — admin
router.patch('/applications/:id/status', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['pending', 'reviewed', 'rejected'];
    if (!VALID.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const app = await prisma.careerApplication.update({ where: { id: req.params.id }, data: { status } });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
