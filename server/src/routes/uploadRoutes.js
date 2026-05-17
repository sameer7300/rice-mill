const express = require('express');
const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const { auth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const IMAGE_TYPES = /jpeg|jpg|png|webp|gif/;
const DOC_TYPES   = /pdf|doc|docx/;
const DOC_MIMES   = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/;

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const ok = IMAGE_TYPES.test(ext) && IMAGE_TYPES.test(file.mimetype.replace('image/', ''));
    ok ? cb(null, true) : cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
  },
});

const uploadDoc = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const ok = DOC_TYPES.test(ext) && DOC_MIMES.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only PDF or Word documents are allowed'));
  },
});

// POST /api/upload  — image upload, requires auth (admin/staff)
router.post('/', auth, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file received' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// POST /api/upload/document  — resume/CV upload, public (used during job applications)
router.post('/document', uploadDoc.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file received' });
  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
  });
});

router.use((err, req, res, next) => {
  if (err.message) return res.status(400).json({ success: false, error: err.message });
  next(err);
});

module.exports = router;
