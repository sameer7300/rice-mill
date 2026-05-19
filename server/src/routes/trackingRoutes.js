const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const geoip = require('../lib/geoip');

const router = express.Router();
const prisma = new PrismaClient();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parseUserAgent(ua) {
  if (!ua) return { device: 'unknown', browser: 'unknown', os: 'unknown' };
  const device = /mobile|android|iphone|ipad/i.test(ua) ? (/ipad/i.test(ua) ? 'tablet' : 'mobile') : 'desktop';
  const browser =
    /edg\//i.test(ua) ? 'Edge' :
    /opr\//i.test(ua) ? 'Opera' :
    /chrome/i.test(ua) ? 'Chrome' :
    /safari/i.test(ua) ? 'Safari' :
    /firefox/i.test(ua) ? 'Firefox' : 'Other';
  const os =
    /windows nt/i.test(ua) ? 'Windows' :
    /mac os x/i.test(ua) ? 'macOS' :
    /android/i.test(ua) ? 'Android' :
    /iphone|ipad|ipod/i.test(ua) ? 'iOS' :
    /linux/i.test(ua) ? 'Linux' : 'Other';
  return { device, browser, os };
}

// ─── GEO LOOKUP (public) ─────────────────────────────────────────────────────

// GET /api/tracking/geo — returns geo for the caller's IP
router.get('/geo', async (req, res) => {
  try {
    const ip = geoip.getClientIp(req);
    const geo = await geoip.lookup(ip);
    if (!geo) {
      // No token or private IP — return safe default
      return res.json({ success: true, detected: false, ip: null, country: null, countryCode: null, currency: 'PKR' });
    }
    res.json({
      success: true,
      detected: true,
      ip: geo.ip,
      country: geo.country,
      countryCode: geo.country,
      city: geo.city,
      region: geo.region,
      timezone: geo.timezone,
      currency: geoip.currencyForCountry(geo.country),
    });
  } catch (err) {
    res.json({ success: false, detected: false });
  }
});

// ─── SESSION ─────────────────────────────────────────────────────────────────

// POST /api/tracking/session — create or refresh a visitor session
router.post('/session', async (req, res) => {
  try {
    const { sessionId, consentAnalytics, consentAll, referrer } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required' });

    const ip = geoip.getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const { device, browser, os } = parseUserAgent(ua);

    // Geo lookup (only if analytics consent given)
    let geo = null;
    if (consentAnalytics || consentAll) {
      geo = await geoip.lookup(ip);
    }

    const userId = req.user?.id || null; // optional auth

    const data = {
      userId,
      ipAddress: (consentAnalytics || consentAll) ? ip : null,
      country: geo?.country || null,
      countryCode: geo?.country || null,
      city: geo?.city || null,
      region: geo?.region || null,
      latitude: geo?.latitude || null,
      longitude: geo?.longitude || null,
      isp: geo?.isp || null,
      timezone: geo?.timezone || null,
      device: (consentAnalytics || consentAll) ? device : null,
      browser: (consentAnalytics || consentAll) ? browser : null,
      os: (consentAnalytics || consentAll) ? os : null,
      userAgent: (consentAnalytics || consentAll) ? ua.slice(0, 500) : null,
      referrer: (consentAnalytics || consentAll) ? (referrer || null) : null,
      consentAll: !!consentAll,
      consentAnalytics: !!(consentAnalytics || consentAll),
    };

    await prisma.visitorSession.upsert({
      where: { sessionId },
      create: { sessionId, ...data },
      update: { ...data, updatedAt: new Date() },
    });

    res.json({ success: true, geo: geo ? { country: geo.country, city: geo.city } : null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PAGE VIEW ───────────────────────────────────────────────────────────────

// POST /api/tracking/pageview
router.post('/pageview', async (req, res) => {
  try {
    const { sessionId, path, title, referrer, durationSec, productId, searchQuery } = req.body;
    if (!sessionId || !path) return res.status(400).json({ success: false, error: 'sessionId and path required' });

    // Verify session exists
    const session = await prisma.visitorSession.findUnique({ where: { sessionId } });
    if (!session || !session.consentAnalytics) {
      return res.json({ success: true, skipped: true }); // consent not given — silently skip
    }

    await prisma.pageView.create({
      data: {
        sessionId,
        userId: session.userId || null,
        path: path.slice(0, 500),
        title: title?.slice(0, 200) || null,
        referrer: referrer?.slice(0, 500) || null,
        durationSec: durationSec ? parseInt(durationSec) : null,
        productId: productId || null,
        searchQuery: searchQuery?.slice(0, 200) || null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ─── COOKIE CONSENT ──────────────────────────────────────────────────────────

// POST /api/tracking/consent
router.post('/consent', async (req, res) => {
  try {
    const { sessionId, analytics, marketing, all } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required' });

    const userId = req.user?.id || null;
    await prisma.cookieConsent.upsert({
      where: { sessionId },
      create: { sessionId, userId, essential: true, analytics: !!(analytics || all), marketing: !!(marketing || all) },
      update: { userId, analytics: !!(analytics || all), marketing: !!(marketing || all), updatedAt: new Date() },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ─── ADMIN — VISITOR STATS ────────────────────────────────────────────────────

// GET /api/tracking/admin/stats [admin]
router.get('/admin/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') return res.status(403).json({ message: 'Forbidden' });
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [totalSessions, totalPageViews, topCountries, topPages, topBrowsers, topDevices, recentSessions] = await Promise.all([
      prisma.visitorSession.count({ where: { createdAt: { gte: since } } }),
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      prisma.visitorSession.groupBy({ by: ['country'], _count: { id: true }, where: { createdAt: { gte: since }, country: { not: null } }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      prisma.pageView.groupBy({ by: ['path'], _count: { id: true }, where: { createdAt: { gte: since } }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      prisma.visitorSession.groupBy({ by: ['browser'], _count: { id: true }, where: { createdAt: { gte: since }, browser: { not: null } }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
      prisma.visitorSession.groupBy({ by: ['device'], _count: { id: true }, where: { createdAt: { gte: since }, device: { not: null } }, orderBy: { _count: { id: 'desc' } }, take: 3 }),
      prisma.visitorSession.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 20, select: { sessionId: true, ipAddress: true, country: true, city: true, device: true, browser: true, createdAt: true } }),
    ]);

    res.json({ success: true, data: { totalSessions, totalPageViews, topCountries, topPages, topBrowsers, topDevices, recentSessions } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
