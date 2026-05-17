const express = require('express');
const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Allow only images, max 5 MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
             && allowed.test(file.mimetype.replace('image/', ''));
    if (ok) return cb(null, true);
    cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
  },
});

// POST /api/upload  — requires auth (admin/staff)
router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file received' });
  // Build absolute URL so the client can display it without knowing the server origin
  const origin = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const url = `${origin}/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err.message) return res.status(400).json({ success: false, error: err.message });
  next(err);
});

module.exports = router;
