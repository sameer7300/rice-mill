const express = require('express');
const { PrismaClient } = require('@prisma/client');
const logger = require('../lib/logger');

const router = express.Router();
const prisma = new PrismaClient();
const BASE = process.env.APP_URL || 'https://alnoorice.pk';

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [products, posts, careers] = await Promise.all([
      prisma.product.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.career.findMany({ where: { isOpen: true }, select: { id: true, updatedAt: true } }),
    ]);

    const now = new Date().toISOString().split('T')[0];

    const staticPages = [
      { url: '/',                  priority: '1.0', changefreq: 'daily' },
      { url: '/about',             priority: '0.8', changefreq: 'monthly' },
      { url: '/contact',           priority: '0.7', changefreq: 'monthly' },
      { url: '/blog',              priority: '0.8', changefreq: 'weekly' },
      { url: '/careers',           priority: '0.7', changefreq: 'weekly' },
      { url: '/wholesale',         priority: '0.8', changefreq: 'weekly' },
      { url: '/track',             priority: '0.5', changefreq: 'monthly' },
      { url: '/register',          priority: '0.6', changefreq: 'monthly' },
      { url: '/sitemap',           priority: '0.3', changefreq: 'monthly' },
      { url: '/policies',          priority: '0.5', changefreq: 'yearly' },
      { url: '/policies/privacy',  priority: '0.4', changefreq: 'yearly' },
      { url: '/policies/terms',    priority: '0.4', changefreq: 'yearly' },
      { url: '/policies/refund',   priority: '0.4', changefreq: 'yearly' },
      { url: '/policies/shipping', priority: '0.4', changefreq: 'yearly' },
    ];

    const urls = [
      ...staticPages.map(p =>
        `  <url><loc>${BASE}${p.url}</loc><lastmod>${now}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
      ),
      ...products.map(p =>
        `  <url><loc>${BASE}/products/${p.id}</loc><lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
      ),
      ...posts.map(p =>
        `  <url><loc>${BASE}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
      ),
      ...careers.map(c =>
        `  <url><loc>${BASE}/careers#job-${c.id}</loc><lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    logger.error('Sitemap generation failed', err);
    res.status(500).send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
});

router.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /api\nDisallow: /supplier\nSitemap: ${BASE}/sitemap.xml\n`);
});

module.exports = router;
