const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const BASE = 'https://alnoorice.pk';

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [products, posts, careers] = await Promise.all([
      prisma.product.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.career.findMany({ where: { isOpen: true }, select: { id: true, createdAt: true } })
    ]);

    const staticPages = ['/', '/about', '/contact', '/policy', '/careers', '/blog', '/track'];

    const urls = [
      ...staticPages.map(p => `  <url><loc>${BASE}${p}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
      ...products.map(p => `  <url><loc>${BASE}/products/${p.id}</loc><lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`),
      ...posts.map(p => `  <url><loc>${BASE}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`),
      ...careers.map(c => `  <url><loc>${BASE}/careers/${c.id}</loc><lastmod>${c.createdAt.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`)
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('<?xml version="1.0"?><urlset/>');
  }
});

router.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /api\nSitemap: ${BASE}/sitemap.xml\n`);
});

module.exports = router;
