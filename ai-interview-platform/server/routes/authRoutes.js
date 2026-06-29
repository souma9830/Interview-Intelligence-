const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Stateless authentication endpoints mapping user JWT claims decoded from Firebase tokens.
// No session cookies or database lookups are performed at this level.
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;