/**
 * Sanitizer for candidate-submitted code before dynamic validation.
 */

function sanitizeSandboxScript(code) {
  if (typeof code !== 'string') return '';
  // Strip control character blocks
  return code
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .trim();
}

module.exports = {
  sanitizeSandboxScript,
};
