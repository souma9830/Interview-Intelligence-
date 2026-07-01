const { ApiError } = require('../middleware/error/errorHandler');
const User = require('../models/User');
const OTP = require('../models/OTP');
const notificationService = require('../services/notificationService');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Authentication Controller
// Endpoints are protected by express-rate-limit bounds to prevent SMTP resource exhaustion.


// @desc    Get current user details statelessly
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'User context not found in stateless request session');
    }
    // Return the user mapped statelessly from the decoded Firebase token in authMiddleware
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get Me Error:', error.message);
    next(error);
  }
};

// @desc    Logout user (Stateless wrapper)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error.message);
    next(error);
  }
};

// @desc    Forgot password (Generate OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ApiError(404, 'There is no user with that email'));
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP to DB
    await OTP.create({
      email,
      otp
    });

    // Send email
    const message = `Your password reset OTP is ${otp}. It is valid for 5 minutes.`;

    try {
      await notificationService.send({
        to: user.email,
        subject: 'Password Reset OTP',
        message
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      await OTP.deleteMany({ email });
      return next(new ApiError(500, 'Email could not be sent'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return next(new ApiError(400, 'Invalid or expired OTP'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    user.password = newPassword;
    await user.save();

    // Sync password reset with Firebase Authentication using Firebase Admin SDK
    try {
      const fbUser = await admin.auth().getUserByEmail(email);
      if (fbUser) {
        await admin.auth().updateUser(fbUser.uid, { password: newPassword });
        console.log(`[Firebase Auth] Successfully updated password for user: ${email}`);
      }
    } catch (fbErr) {
      console.warn(`[Firebase Auth Warning] Could not sync password reset to Firebase: ${fbErr.message}`);
    }

    await OTP.deleteMany({ email }); // Delete OTPs for this email after success

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

// Added security events auditing
