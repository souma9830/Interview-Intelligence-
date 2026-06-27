const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume, getResume, analyzeJobDescription } = require('../controllers/resumeController');

// Multer memory storage configuration (keeps binary data in req.file.buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB upload limit to prevent Denial of Service (DoS)
  fileFilter: (req, file, cb) => {
    // Only accept standard high-fidelity CV formats
    const filetypes = /pdf|docx/;
    const mimetype = file.mimetype;
    const extname = file.originalname.split('.').pop().toLowerCase();

    if (
      mimetype === 'application/pdf' || 
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extname === 'pdf' ||
      extname === 'docx'
    ) {
      return cb(null, true);
    }
    cb(new Error('Only high-fidelity PDF and DOCX resume formats are supported'));
  }
});

// Secured Endpoints
router.post('/upload', protect, upload.single('file'), uploadResume);
router.get('/me', protect, getResume);
router.post('/analyze-jd', protect, analyzeJobDescription);

module.exports = router;
