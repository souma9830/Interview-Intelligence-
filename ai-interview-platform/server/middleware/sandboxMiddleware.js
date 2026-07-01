const SandboxValidator = require('../utils/sandboxValidator');

/**
 * sandboxMiddleware
 *
 * Express middleware that intercepts code submission requests and
 * performs static security analysis before the submission reaches
 * the evaluation controller. Requests containing dangerous code
 * patterns are rejected with HTTP 400 and a detailed violations report.
 *
 * Expected request body shape:
 *   { code: string, language?: string, ... }
 *
 * On rejection, the response body contains:
 *   {
 *     success: false,
 *     message: 'Code submission rejected by security sandbox.',
 *     violations: [ { rule: string, detail: string }, ... ]
 *   }
 */
const sandboxMiddleware = (req, res, next) => {
  const { code, language } = req.body;

  // Skip validation when no code field is present in the payload.
  // This allows non-code endpoints that share the same route group
  // to pass through without unnecessary validation overhead.
  if (code === undefined || code === null) {
    return next();
  }

  const result = SandboxValidator.validate(code, language);

  if (!result.safe) {
    console.warn(
      `[Sandbox] Blocked code submission from ${req.ip || 'unknown'} — ` +
      `${result.violations.length} violation(s) detected: ` +
      result.violations.map(v => v.rule).join(', ')
    );

    return res.status(400).json({
      success: false,
      message: 'Code submission rejected by security sandbox.',
      violations: result.violations,
      meta: result.meta,
    });
  }

  // Attach validation metadata to the request object so downstream
  // controllers can include it in response headers or telemetry
  req.sandboxValidation = {
    passed: true,
    codeLength: result.meta.codeLength,
    language: result.meta.language,
  };

  next();
};

module.exports = sandboxMiddleware;
