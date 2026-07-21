/**
 * Enhanced Security & Sanitization Utilities
 */

export function sanitizeHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeForDisplay(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function isValidNumeric(text, maxLength = 6) {
  return /^\d+$/.test(text) && text.length <= maxLength;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function truncate(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

export function validatePasswordStrength(password) {
  if (password.length < 8) return false;
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export function sanitizeCode(code) {
  if (typeof code !== 'string') return '';
  return code.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // strip control characters
}

