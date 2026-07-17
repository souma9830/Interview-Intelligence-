/**
 * Authentication Validation Helpers
 * Centralized validation functions for auth-related inputs.
 */

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validateOTP(otp) {
  if (!otp || typeof otp !== 'string') return false;
  return /^\d{6}$/.test(otp);
}

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required' };
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  if (password.length > 128) return { valid: false, message: 'Password must be less than 128 characters' };
  return { valid: true, message: 'Password meets requirements' };
}

module.exports = {
  validateEmail,
  validateOTP,
  validatePasswordStrength,
};
