const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const {
  sendApplicationReceivedEmail,
  sendApplicationUnderReviewEmail,
  sendInterviewInvitationEmail,
  sendOfferLetterEmail,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
  sendNewApplicationNotificationEmail,
  sendWelcomeEmail,
} = require('../lib/mailer');

const router = express.Router();
const prisma = new PrismaClient();

const VALID_STATUSES = ['applied', 'reviewing', 'interview_scheduled', 'offered', 'accepted', 'rejected'];

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/careers — open positions
router.get('/', async (req, res) => {
  try {
    const { department, type, featured } = req.query;
    const where = { isOpen: true };
    if (department) where.department = department;
    if (type) where.type = type;
    if (featured === 'true') where.isFeatured = true;
    const careers = await prisma.career.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
    // Parse JSON arrays stored as strings
    const parsed = careers.map(parseCareer);
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/careers/departments — distinct departments
router.get('/departments', async (req, res) => {
  try {
    const careers = await prisma.career.findMany({ where: { isOpen: true }, select: { department: true } });
    const departments = [...new Set(careers.map(c => c.department))];
    res.json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/careers/:id — single open position
router.get('/:id', async (req, res) => {
  try {
    const career = await prisma.career.findUnique({ where: { id: req.params.id } });
    if (!career) return res.status(404).json({ success: false, error: 'Position not found' });
    res.json({ success: true, data: parseCareer(career) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/careers/:id/apply — public submission
router.post('/:id/apply', async (req, res) => {
  try {
    const { name, email, phone, coverLetter, resumeUrl, resumeName,
            linkedInUrl, portfolioUrl, expectedSalary, noticePeriod, source } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, error: 'Name, email and phone are required' });
    }
    const career = await prisma.career.findUnique({ where: { id: req.params.id } });
    if (!career || !career.isOpen) {
      return res.status(400).json({ success: false, error: 'This position is no longer open' });
    }
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.careerApplication.create({
        data: {
          careerId: req.params.id,
          name, email, phone,
          coverLetter: coverLetter || null,
          resumeUrl: resumeUrl || null,
          resumeName: resumeName || null,
          linkedInUrl: linkedInUrl || null,
          portfolioUrl: portfolioUrl || null,
          expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
          noticePeriod: noticePeriod || null,
          source: source || 'website',
          status: 'applied',
        },
      });
      await tx.career.update({
        where: { id: req.params.id },
        data: { totalApplications: { increment: 1 } },
      });
      return app;
    });
    // Fire-and-forget emails
    sendApplicationReceivedEmail(email, name, career.title).catch(() => {});
    sendNewApplicationNotificationEmail(career.title, name, email, application.id).catch(() => {});
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', detail: err.message });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/careers/admin/all — all jobs + counts
router.get('/admin/all', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const careers = await prisma.career.findMany({
      include: { _count: { select: { applications: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, data: careers.map(parseCareer) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/careers/admin/applications — all applications with filters
router.get('/admin/applications', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status, careerId, search, page = '1', limit = '20' } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (careerId) where.careerId = careerId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, applications] = await Promise.all([
      prisma.careerApplication.count({ where }),
      prisma.careerApplication.findMany({
        where,
        include: { career: { select: { id: true, title: true, department: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);
    res.json({ success: true, data: applications, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/careers/admin — create job posting
router.post('/admin', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      title, department, location, type, experienceLevel,
      salaryMin, salaryMax, showSalary,
      description, responsibilities, requirements, niceToHave, benefits,
      deadline, isOpen, isFeatured, bannerImage,
    } = req.body;
    if (!title || !department || !location || !type || !description) {
      return res.status(400).json({ success: false, error: 'Title, department, location, type and description are required' });
    }
    const career = await prisma.career.create({
      data: {
        title, department, location, type,
        experienceLevel: experienceLevel || 'mid',
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        showSalary: showSalary !== false,
        description,
        responsibilities: Array.isArray(responsibilities) ? JSON.stringify(responsibilities) : responsibilities || null,
        requirements: Array.isArray(requirements) ? JSON.stringify(requirements) : requirements || null,
        niceToHave: Array.isArray(niceToHave) ? JSON.stringify(niceToHave) : niceToHave || null,
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits || null,
        deadline: deadline ? new Date(deadline) : null,
        isOpen: isOpen !== false,
        isFeatured: Boolean(isFeatured),
        bannerImage: bannerImage || null,
      },
    });
    res.status(201).json({ success: true, data: parseCareer(career) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', detail: err.message });
  }
});

// PUT /api/careers/admin/:id — update job
router.put('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      title, department, location, type, experienceLevel,
      salaryMin, salaryMax, showSalary,
      description, responsibilities, requirements, niceToHave, benefits,
      deadline, isOpen, isFeatured, bannerImage,
    } = req.body;
    const career = await prisma.career.update({
      where: { id: req.params.id },
      data: {
        title, department, location, type,
        experienceLevel: experienceLevel || 'mid',
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        showSalary: showSalary !== false,
        description,
        responsibilities: Array.isArray(responsibilities) ? JSON.stringify(responsibilities) : responsibilities || null,
        requirements: Array.isArray(requirements) ? JSON.stringify(requirements) : requirements || null,
        niceToHave: Array.isArray(niceToHave) ? JSON.stringify(niceToHave) : niceToHave || null,
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits || null,
        deadline: deadline ? new Date(deadline) : null,
        isOpen: Boolean(isOpen),
        isFeatured: Boolean(isFeatured),
        bannerImage: bannerImage || null,
      },
    });
    res.json({ success: true, data: parseCareer(career) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /api/careers/admin/:id
router.delete('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.career.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/careers/:id/applications — applications for a job
router.get('/:id/applications', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const applications = await prisma.careerApplication.findMany({
      where: { careerId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/careers/applications/:id — single application
router.get('/applications/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const app = await prisma.careerApplication.findUnique({
      where: { id: req.params.id },
      include: { career: true },
    });
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PATCH /api/careers/applications/:id/status — update status
router.patch('/applications/:id/status', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const existing = await prisma.careerApplication.findUnique({
      where: { id: req.params.id },
      include: { career: true },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Application not found' });

    const app = await prisma.careerApplication.update({
      where: { id: req.params.id },
      data: { status, adminNote: adminNote || existing.adminNote, reviewedBy: req.user.id, reviewedAt: new Date() },
    });

    // Trigger emails based on status transition
    if (status === 'reviewing') {
      sendApplicationUnderReviewEmail(existing.email, existing.name, existing.career.title).catch(() => {});
    }
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PATCH /api/careers/applications/:id/interview — schedule interview
router.patch('/applications/:id/interview', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { interviewDate, interviewMode, interviewNotes } = req.body;
    if (!interviewDate || !interviewMode) {
      return res.status(400).json({ success: false, error: 'Interview date and mode are required' });
    }
    const existing = await prisma.careerApplication.findUnique({
      where: { id: req.params.id },
      include: { career: true },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Application not found' });

    const app = await prisma.careerApplication.update({
      where: { id: req.params.id },
      data: {
        status: 'interview_scheduled',
        interviewDate: new Date(interviewDate),
        interviewMode,
        interviewNotes: interviewNotes || null,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });
    sendInterviewInvitationEmail(existing.email, existing.name, existing.career.title, interviewDate, interviewMode, interviewNotes).catch(() => {});
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PATCH /api/careers/applications/:id/offer — make offer
router.patch('/applications/:id/offer', auth, requireRole('admin'), async (req, res) => {
  try {
    const { offerAmount, offerExpiry } = req.body;
    const existing = await prisma.careerApplication.findUnique({
      where: { id: req.params.id },
      include: { career: true },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Application not found' });

    const app = await prisma.careerApplication.update({
      where: { id: req.params.id },
      data: {
        status: 'offered',
        offerAmount: offerAmount ? parseFloat(offerAmount) : null,
        offerExpiry: offerExpiry ? new Date(offerExpiry) : null,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });
    sendOfferLetterEmail(existing.email, existing.name, existing.career.title, offerAmount, offerExpiry).catch(() => {});
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/careers/applications/:id/accept — accept + create staff account
router.post('/applications/:id/accept', auth, requireRole('admin'), async (req, res) => {
  try {
    const existing = await prisma.careerApplication.findUnique({
      where: { id: req.params.id },
      include: { career: true },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Application not found' });

    // Generate a temp password
    const tempPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase() + '!';
    const hashed = await bcrypt.hash(tempPassword, 10);

    // Create staff user account (or find existing)
    let user = await prisma.user.findUnique({ where: { email: existing.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: existing.name,
          email: existing.email,
          password: hashed,
          phone: existing.phone,
          role: 'staff',
          mustChangePassword: true,
        },
      });
    }

    const app = await prisma.careerApplication.update({
      where: { id: req.params.id },
      data: { status: 'accepted', reviewedBy: req.user.id, reviewedAt: new Date() },
    });

    sendApplicationAcceptedEmail(existing.email, existing.name, existing.career.title, existing.email, tempPassword).catch(() => {});
    res.json({ success: true, data: app, userId: user.id });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', detail: err.message });
  }
});

// PATCH /api/careers/applications/:id/reject — reject with reason
router.patch('/applications/:id/reject', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const existing = await prisma.careerApplication.findUnique({
      where: { id: req.params.id },
      include: { career: true },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Application not found' });

    const app = await prisma.careerApplication.update({
      where: { id: req.params.id },
      data: { status: 'rejected', rejectionReason: rejectionReason || null, reviewedBy: req.user.id, reviewedAt: new Date() },
    });
    sendApplicationRejectedEmail(existing.email, existing.name, existing.career.title, rejectionReason).catch(() => {});
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parseCareer(career) {
  const tryParse = (v) => {
    if (!v) return [];
    try { return JSON.parse(v); } catch { return v; }
  };
  return {
    ...career,
    responsibilities: tryParse(career.responsibilities),
    requirements: tryParse(career.requirements),
    niceToHave: tryParse(career.niceToHave),
    benefits: tryParse(career.benefits),
  };
}

module.exports = router;
