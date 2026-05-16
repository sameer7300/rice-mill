const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET /api/blog — public, published posts only
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true, createdAt: true },
      orderBy: { publishedAt: 'desc' }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/blog/:slug — public
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
    if (!post || !post.isPublished) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list all (published + drafts)
router.get('/admin/all', auth, requireRole('admin'), async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/blog — admin create
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, isPublished } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
    const slug = toSlug(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
    const post = await prisma.blogPost.create({
      data: { title, slug: finalSlug, excerpt, content, coverImage, isPublished: Boolean(isPublished), publishedAt: isPublished ? new Date() : null }
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/blog/:id — admin update
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, isPublished } = req.body;
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        title, excerpt, content, coverImage, isPublished: Boolean(isPublished),
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt
      }
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/blog/:id — admin
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
