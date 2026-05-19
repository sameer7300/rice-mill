const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const mailer = require('../lib/mailer');
const wa = require('../lib/whatsapp');
const logger = require('../lib/logger');

const router = express.Router();
const prisma = new PrismaClient();

// In-memory OTP store for registration verification (key = email|phone, value = {otp, expires})
const registrationOtpStore = new Map();

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_TTL_DAYS = 7;
const ACCESS_TTL = '7d'; // keep 7d for now; can tighten to '15m' once refresh flow is validated

function issueAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

async function issueRefreshToken(userId, req) {
  const raw = randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      userId,
      token: raw,
      expiresAt,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
    },
  });
  return { raw, expiresAt };
}

function setRefreshCookie(res, raw, expiresAt) {
  res.cookie(REFRESH_COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, path: '/api/auth' });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Check account lockout
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      return res.status(429).json({ success: false, message: 'Account temporarily locked. Try again later.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const attempts = (user.loginAttempts || 0) + 1;
      const lockData = attempts >= 5 ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : {};
      await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: attempts, ...lockData } });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset failed attempts
    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });

    // If 2FA enabled → return temp token
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET + '_2fa', { expiresIn: '5m' });
      return res.json({ success: true, requiresTwoFactor: true, tempToken });
    }

    const token = issueAccessToken(user);
    const { raw, expiresAt } = await issueRefreshToken(user.id, req);
    setRefreshCookie(res, raw, expiresAt);

    const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...userSafe } = user;
    logger.info('User login', { userId: user.id, role: user.role });
    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── SEND REGISTRATION OTP ───────────────────────────────────────────────────

router.post('/send-registration-otp', async (req, res) => {
  try {
    const { name, email, phone, channel } = req.body;
    if (!channel || !['email', 'whatsapp'].includes(channel)) {
      return res.status(400).json({ message: 'Channel must be "email" or "whatsapp"' });
    }
    if (channel === 'email') {
      if (!email) return res.status(400).json({ message: 'Email is required' });
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ message: 'An account with this email already exists' });
    } else {
      if (!phone) return res.status(400).json({ message: 'Phone number is required for WhatsApp verification' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const key = channel === 'email' ? email : phone;
    registrationOtpStore.set(key, { otp, expires: new Date(Date.now() + 10 * 60 * 1000), channel });

    if (channel === 'email') {
      mailer.sendRegistrationOTPEmail(email, name || 'there', otp).catch(() => {});
    } else {
      wa.send({
        phone,
        message: `🌾 *Al-Noor Rice Mills — Verify Your Account*\n\nAs-Salamu Alaykum ${name || 'there'}!\n\nYour registration OTP is:\n\n*${otp}*\n\nValid for 10 minutes. Do not share this code with anyone.`,
        type: 'registration_otp',
      }).catch(() => {});
    }

    res.json({ message: 'OTP sent successfully', channel });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, otp, otpChannel } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Verify OTP if provided (from registration verification flow)
    if (otp && otpChannel) {
      const key = otpChannel === 'email' ? email : phone;
      if (!key) return res.status(400).json({ message: 'OTP verification target is missing' });
      const stored = registrationOtpStore.get(key);
      if (!stored || stored.otp !== String(otp) || new Date() > stored.expires) {
        return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
      }
      registrationOtpStore.delete(key);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: { name, email, password: hashed, role: 'customer', phone: phone || null }
      })
    ]);

    await prisma.customer.create({
      data: { userId: user.id, businessName: name, phone: phone || null }
    });

    // Generate unique referral code: RM-{INITIAL}{RANDOM5}
    const initial = (name[0] || 'U').toUpperCase();
    let referralCode, attempts = 0;
    do {
      const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
      referralCode = `RM-${initial}${rand}`;
      const exists = await prisma.user.findUnique({ where: { referralCode } });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);
    await prisma.user.update({ where: { id: user.id }, data: { referralCode } });

    // If referred by someone, save the relationship
    const { referralCode: refCode } = req.body;
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
      if (referrer) await prisma.user.update({ where: { id: user.id }, data: { referredBy: referrer.id } });
    }

    // Welcome email + WhatsApp (fire-and-forget)
    if (email) mailer.sendRegistrationWelcome(email, name).catch(() => {});
    if (phone) {
      wa.send({
        phone,
        message: `🌾 *Al-Noor Rice Mills — Welcome!*\n\nAs-Salamu Alaykum ${name}!\n\nYour account has been created successfully.\n\nShop: https://alnoorice.pk\n📞 +92-946-123456`,
        type: 'welcome',
      }).catch(() => {});
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = user;
    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { customer: true, supplier: true }
    });
    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    // Email notification (fire-and-forget)
    if (user.email) mailer.sendPasswordChanged(user.email, user.name).catch(() => {});
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── 2FA ─────────────────────────────────────────────────────────────────────

router.post('/2fa/setup', auth, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `Al-Noor Rice Mills (${req.user.email})`, length: 20 });
    await prisma.user.update({ where: { id: req.user.id }, data: { twoFactorSecret: secret.base32 } });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success: true, data: { secret: secret.base32, qrCode, manualEntryKey: secret.base32 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/2fa/verify-setup', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.twoFactorSecret) return res.status(400).json({ success: false, error: 'Run 2FA setup first' });
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: String(token), window: 2 });
    if (!verified) return res.status(400).json({ success: false, error: 'Invalid code. Check your authenticator app.' });
    // Generate 10 backup codes
    const codes = Array.from({ length: 10 }, () => {
      const c = Math.random().toString(36).slice(2, 7).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      return c;
    });
    const hashed = await Promise.all(codes.map(c => bcrypt.hash(c, 8)));
    await prisma.user.update({ where: { id: req.user.id }, data: { twoFactorEnabled: true, twoFactorBackupCodes: JSON.stringify(hashed) } });
    res.json({ success: true, data: { backupCodes: codes }, message: '2FA enabled! Save these backup codes.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/2fa/disable', auth, async (req, res) => {
  try {
    const { password, token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const pwValid = await bcrypt.compare(password, user.password);
    if (!pwValid) return res.status(401).json({ success: false, error: 'Incorrect password' });
    const totpValid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: String(token), window: 2 });
    if (!totpValid) return res.status(400).json({ success: false, error: 'Invalid authenticator code' });
    await prisma.user.update({ where: { id: req.user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: null } });
    res.json({ success: true, message: '2FA has been disabled.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2FA login — verify TOTP after password step
router.post('/2fa/login', async (req, res) => {
  try {
    const { tempToken, token: totpCode, code } = req.body;
    const otp = totpCode || code;
    let payload;
    try { payload = jwt.verify(tempToken, process.env.JWT_SECRET + '_2fa'); }
    catch { return res.status(401).json({ success: false, error: 'Invalid or expired session' }); }
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.twoFactorEnabled) return res.status(400).json({ success: false, error: 'Invalid request' });
    const valid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: String(otp), window: 2 });
    if (!valid) return res.status(400).json({ success: false, error: 'Invalid authenticator code' });
    const authToken = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...userSafe } = user;
    res.json({ token: authToken, user: userSafe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success — don't reveal if email exists
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: hashedToken, passwordResetExpires: expires }
    });

    mailer.sendPasswordResetEmail(user.email, user.name, resetToken).catch(() => {});
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── FORGOT PASSWORD VIA WHATSAPP OTP ────────────────────────────────────────

router.post('/forgot-password-whatsapp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });
    const cleanedPhone = phone.replace(/\D/g, '').replace(/^0/, '92');
    const user = await prisma.user.findFirst({ where: { phone: { contains: cleanedPhone.slice(-10) } } });
    // Always return success — don't reveal if phone exists
    if (!user) return res.json({ message: 'If a registered account exists for this number, an OTP has been sent.' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: `WA_OTP_${otp}`, passwordResetExpires: expires }
    });

    const message = `🔐 *Al-Noor Rice Mills — Password Reset OTP*\n\nYour one-time code is:\n\n*${otp}*\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nIf you didn't request this, ignore this message.`;
    wa.send({ phone, message, type: 'otp_reset' }).catch(() => {});

    res.json({ message: 'If a registered account exists for this number, an OTP has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── RESET PASSWORD VIA WHATSAPP OTP ─────────────────────────────────────────

router.post('/reset-password-whatsapp', async (req, res) => {
  try {
    const { phone, otp, password } = req.body;
    if (!phone || !otp || !password) return res.status(400).json({ message: 'Phone, OTP and new password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const cleanedPhone = phone.replace(/\D/g, '').replace(/^0/, '92');
    const user = await prisma.user.findFirst({
      where: {
        phone: { contains: cleanedPhone.slice(-10) },
        passwordResetToken: `WA_OTP_${otp}`,
        passwordResetExpires: { gt: new Date() }
      }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordResetToken: null, passwordResetExpires: null }
    });

    mailer.sendPasswordChangedEmail(user.email, user.name).catch(() => {});
    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: { passwordResetToken: hashedToken, passwordResetExpires: { gt: new Date() } }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordResetToken: null, passwordResetExpires: null }
    });

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await prisma.loginSession.findMany({
      where: { userId: req.user.id, isActive: true, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' }
    });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/sessions/:id', auth, async (req, res) => {
  try {
    await prisma.loginSession.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/sessions', auth, async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1];
    await prisma.loginSession.updateMany({ where: { userId: req.user.id, token: { not: currentToken } }, data: { isActive: false } });
    res.json({ success: true, message: 'All other sessions revoked' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/auth/refresh — exchange refresh cookie for a new access token
router.post('/refresh', async (req, res) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) return res.status(401).json({ success: false, message: 'No refresh token' });

    const stored = await prisma.refreshToken.findUnique({ where: { token: raw }, include: { user: true } });
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired' });
    }

    const user = stored.user;
    if (!user.isActive) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Account disabled' });
    }

    // Rotate: revoke old token, issue new pair
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });
    const newToken = issueAccessToken(user);
    const { raw: newRaw, expiresAt } = await issueRefreshToken(user.id, req);
    setRefreshCookie(res, newRaw, expiresAt);

    const { password: _, twoFactorSecret: __, twoFactorBackupCodes: ___, mustChangePassword, ...userSafe } = user;
    res.json({ success: true, token: newToken, user: userSafe, mustChangePassword });
  } catch (err) {
    logger.error('Refresh token error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/logout — revoke refresh cookie
router.post('/logout', async (req, res) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (raw) {
      await prisma.refreshToken.updateMany({ where: { token: raw }, data: { isRevoked: true } }).catch(() => {});
    }
    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
