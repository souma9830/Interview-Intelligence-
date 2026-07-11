const { body, query, param } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
];

const signupValidator = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const verifyOTPValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').matches(/^\d{6}$/).withMessage('OTP must be exactly 6 digits'),
  body('newPassword').isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
];

const resendOTPValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const syncUserValidator = [
  body('uid').optional().isString().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('name').optional().trim().isLength({ max: 100 }),
];

module.exports = {
  loginValidator,
  signupValidator,
  forgotPasswordValidator,
  verifyOTPValidator,
  resendOTPValidator,
  syncUserValidator,
};