const { ApiError } = require('../middleware/error/errorHandler');
const User = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const notificationService = require('../services/notificationService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { sendSuccess, sendError, handleControllerError } = require('../utils/apiResponse');

// Authentication Controller
// Endpoints are protected by express-rate-limit bounds to prevent SMTP resource exhaustion.

// @desc    Get current user details statelessly
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'User context not found in stateless request session', 401);
    }
    sendSuccess(res, req.user);
  } catch (error) {
    handleControllerError(res, error, 'Failed to get user');
  }
};

// @desc    Logout user (Stateless wrapper)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    sendSuccess(res, null, 200, 'Logged out successfully');
  } catch (error) {
    handleControllerError(res, error, 'Failed to logout');
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
      return sendError(res, 'There is no user with that email', 404);
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

      sendSuccess(res, 'Email sent', 200);
    } catch (err) {
      await OTP.deleteMany({ email });
      return sendError(res, 'Email could not be sent', 500);
    }
  } catch (error) {
    handleControllerError(res, error, 'Failed to process forgot password');
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otp || !/^\d{6}$/.test(otp)) {
      return sendError(res, 'OTP must be exactly 6 numeric digits', 400);
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return sendError(res, 'Invalid or expired OTP', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User not found', 404);
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

    await OTP.deleteMany({ email });

    sendSuccess(res, null, 200, 'Password reset successful');
  } catch (error) {
    handleControllerError(res, error, 'Failed to verify OTP');
  }
};

// @desc    Refresh access token using rotate-on-consume refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const activeToken = await RefreshToken.findOne({ token, revoked: false });
    if (!activeToken || activeToken.expiresAt < new Date()) {
      return sendError(res, 'Invalid or expired refresh token', 403);
    }

    // Mark current refresh token as revoked (rotation)
    activeToken.revoked = true;
    await activeToken.save();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return sendError(res, 'JWT_SECRET environment variable is not configured', 500);
    }
    const newAccessToken = jwt.sign({ id: activeToken.userId }, jwtSecret, { expiresIn: '15m' });
    const newRefreshTokenString = crypto.randomBytes(40).toString('hex');
    
    await RefreshToken.create({
      userId: activeToken.userId,
      token: newRefreshTokenString,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    sendSuccess(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString
    }, 200, 'Token refreshed successfully');
  } catch (error) {
    handleControllerError(res, error, 'Failed to refresh token');
  }
};
