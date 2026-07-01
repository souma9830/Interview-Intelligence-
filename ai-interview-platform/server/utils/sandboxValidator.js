const {
  BLOCKED_MODULES,
  FORBIDDEN_PATTERNS,
  EXECUTION_LIMITS,
  SUPPORTED_LANGUAGES,
} = require('../config/sandboxConfig');

/**
 * SandboxValidator
 *
 * Performs static analysis on candidate-submitted code before it reaches
 * any execution engine. The validator scans the source string against
 * a curated list of forbidden patterns and blocked module references
 * defined in sandboxConfig.js.
 *
 * This layer is intentionally conservative — it is better to reject a
 * borderline submission than to allow code that could compromise the host.
 *
 * Usage:
 *   const result = SandboxValidator.validate(codeString, 'javascript');
 *   if (!result.safe) {
 *     // reject submission, return result.violations to the client
 *   }
 */
class SandboxValidator {

  /**
   * Validate submitted code against sandbox security rules.
   *
   * @param {string} code - The raw source code submitted by the candidate.
   * @param {string} language - The declared language of the submission.
   * @returns {{ safe: boolean, violations: Array<{ rule: string, detail: string }>, meta: object }}
   */
  static validate(code, language) {
    const violations = [];

    // Guard: reject empty or missing submissions
    if (!code || typeof code !== 'string') {
      return {
        safe: false,
        violations: [{ rule: 'empty_submission', detail: 'No code was provided for validation.' }],
        meta: { codeLength: 0, language },
      };
    }

    // Guard: reject oversized submissions to prevent regex backtracking abuse
    if (code.length > EXECUTION_LIMITS.maxCodeLengthChars) {
      violations.push({
        rule: 'code_length_exceeded',
        detail: `Submitted code exceeds the maximum allowed length of ${EXECUTION_LIMITS.maxCodeLengthChars} characters.`,
      });
      return { safe: false, violations, meta: { codeLength: code.length, language } };
    }

    // Guard: reject unsupported languages
    if (language && !SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
      violations.push({
        rule: 'unsupported_language',
        detail: `Language "${language}" is not supported. Supported: ${SUPPORTED_LANGUAGES.join(', ')}.`,
      });
    }

    // Scan for forbidden patterns using the regex definitions
    for (const entry of FORBIDDEN_PATTERNS) {
      if (entry.pattern.test(code)) {
        violations.push({
          rule: entry.label,
          detail: `Code contains a forbidden pattern: ${entry.label.replace(/_/g, ' ')}.`,
        });
      }
    }

    // Scan for explicit blocked module references in require() calls
    // This catches cases the general regex might not fully cover
    const requireMatches = code.matchAll(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
    for (const match of requireMatches) {
      const moduleName = match[1];
      if (BLOCKED_MODULES.includes(moduleName) && !violations.some(v => v.rule === 'blocked_module_import')) {
        violations.push({
          rule: 'blocked_module_explicit',
          detail: `Module "${moduleName}" is blocked. It provides system-level access that is not permitted in sandboxed execution.`,
        });
      }
    }

    // Scan for obfuscation attempts via hex or unicode escapes of blocked keywords
    const hexObfuscationPattern = /\\x[0-9a-fA-F]{2}/;
    const unicodeObfuscationPattern = /\\u[0-9a-fA-F]{4}/;
    if (hexObfuscationPattern.test(code) || unicodeObfuscationPattern.test(code)) {
      // Only flag if the decoded version would match a blocked pattern
      let decoded;
      try {
        decoded = code.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      } catch (_err) {
        decoded = code;
      }

      for (const entry of FORBIDDEN_PATTERNS) {
        if (entry.pattern.test(decoded) && !violations.some(v => v.rule === entry.label)) {
          violations.push({
            rule: `obfuscated_${entry.label}`,
            detail: `Code contains an obfuscated forbidden pattern: ${entry.label.replace(/_/g, ' ')}.`,
          });
        }
      }
    }

    return {
      safe: violations.length === 0,
      violations,
      meta: {
        codeLength: code.length,
        language: language || 'unknown',
        patternsChecked: FORBIDDEN_PATTERNS.length,
        blockedModulesChecked: BLOCKED_MODULES.length,
      },
    };
  }

  /**
   * Quick boolean check for use in middleware chains where
   * the detailed violations report is not needed inline.
   *
   * @param {string} code
   * @param {string} language
   * @returns {boolean}
   */
  static isSafe(code, language) {
    return SandboxValidator.validate(code, language).safe;
  }
}

module.exports = SandboxValidator;
