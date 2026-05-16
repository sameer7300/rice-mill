const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const POINTS_PER_100_PKR = 1;
const POINTS_TO_PKR = 100; // 100 points = PKR 10
const PKR_PER_100_POINTS = 10;

// GET /api/loyalty/balance — own balance + history
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { loyaltyBalance: true } });
    const history = await prisma.loyaltyPoint.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    const tier = user.loyaltyBalance >= 5000 ? 'Gold' : user.loyaltyBalance >= 1000 ? 'Silver' : 'Bronze';
    const nextTierPoints = user.loyaltyBalance >= 5000 ? null : user.loyaltyBalance >= 1000 ? 5000 : 1000;
    res.json({
      success: true,
      data: {
        balance: user.loyaltyBalance,
        pkrValue: Math.floor(user.loyaltyBalance / POINTS_TO_PKR) * PKR_PER_100_POINTS,
        tier,
        nextTierPoints,
        history
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/loyalty/redeem
router.post('/redeem', auth, async (req, res) => {
  try {
    const { points } = req.body;
    if (!points || points < 100) return res.status(400).json({ success: false, error: 'Minimum 100 points to redeem' });
    if (points % 100 !== 0) return res.status(400).json({ success: false, error: 'Points must be in multiples of 100' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { loyaltyBalance: true } });
    if (user.loyaltyBalance < points) return res.status(400).json({ success: false, error: 'Insufficient points balance' });

    const discountPKR = (points / POINTS_TO_PKR) * PKR_PER_100_POINTS;

    await prisma.$transaction([
      prisma.loyaltyPoint.create({
        data: { userId: req.user.id, points: -points, type: 'redeemed', description: `Redeemed ${points} points for PKR ${discountPKR} discount` }
      }),
      prisma.user.update({ where: { id: req.user.id }, data: { loyaltyBalance: { decrement: points } } })
    ]);

    res.json({ success: true, data: { pointsUsed: points, discountPKR }, message: `PKR ${discountPKR} discount applied!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/loyalty/referral — referral stats
router.get('/referral', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { referralCode: true, name: true }
    });
    const referrals = await prisma.user.count({ where: { referredBy: req.user.id } });
    const referralPoints = await prisma.loyaltyPoint.aggregate({
      where: { userId: req.user.id, type: 'referral' },
      _sum: { points: true }
    });
    res.json({
      success: true,
      data: {
        myCode: user.referralCode,
        referralUrl: `https://alnoorice.pk/?ref=${user.referralCode}`,
        totalReferrals: referrals,
        pointsEarned: referralPoints._sum.points || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Admin: GET /api/loyalty/members
router.get('/members', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'customer', loyaltyBalance: { gt: 0 } },
        select: { id: true, name: true, email: true, loyaltyBalance: true, createdAt: true },
        orderBy: { loyaltyBalance: 'desc' },
        skip, take: parseInt(limit)
      }),
      prisma.user.count({ where: { role: 'customer', loyaltyBalance: { gt: 0 } } })
    ]);
    const totalIssued = await prisma.loyaltyPoint.aggregate({ where: { points: { gt: 0 } }, _sum: { points: true } });
    const totalRedeemed = await prisma.loyaltyPoint.aggregate({ where: { points: { lt: 0 } }, _sum: { points: true } });
    res.json({ success: true, data: users, total, pages: Math.ceil(total / parseInt(limit)), stats: { totalIssued: totalIssued._sum.points || 0, totalRedeemed: Math.abs(totalRedeemed._sum.points || 0) } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Admin: POST /api/loyalty/award — manual points
router.post('/award', auth, requireRole('admin'), async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    if (!userId || !points || !reason) return res.status(400).json({ success: false, error: 'userId, points, and reason required' });
    await prisma.$transaction([
      prisma.loyaltyPoint.create({ data: { userId, points: parseInt(points), type: 'manual', description: reason } }),
      prisma.user.update({ where: { id: userId }, data: { loyaltyBalance: { increment: parseInt(points) } } })
    ]);
    res.json({ success: true, message: `${points} points awarded` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper (used by other routes)
async function awardPoints(userId, points, type, description, orderId = null) {
  try {
    await prisma.$transaction([
      prisma.loyaltyPoint.create({ data: { userId, points, type, description, orderId } }),
      prisma.user.update({ where: { id: userId }, data: { loyaltyBalance: { increment: points } } })
    ]);
  } catch (e) { console.error('Loyalty award error:', e.message); }
}

module.exports = { router, awardPoints, POINTS_PER_100_PKR, PKR_PER_100_POINTS, POINTS_TO_PKR };
