/**
 * SandboxRunner
 *
 * Executes user-submitted code in a restricted child process sandbox.
 * Currently supports JavaScript only; other languages fall back to
 * the JDoodle / Gemini evaluation pipelines in the controller layer.
 *
 * @module server/utils/sandboxRunner
 */
const { exec } = require('child_process');

class SandboxRunner {
  /**
   * Execute a code snippet in a sandboxed Node.js child process.
   *
   * @static
   * @param {string} code - The JavaScript source code to execute.
   * @param {string} [language='javascript'] - The programming language (only 'javascript' is supported).
   * @param {number} [timeout=5000] - Maximum execution time in milliseconds.
   * @returns {Promise<{output?: string, error?: string}>} Result object with output or error.
   */
  static runCode(code, language = 'javascript', timeout = 5000) {
    const SandboxValidator = require('./sandboxValidator');
    const { sanitizeSandboxScript } = require('./sandboxSanitizer');
    
    return new Promise((resolve) => {
      if (language !== 'javascript') {
        return resolve({ error: 'Language not supported' });
      }

      const sanitized = sanitizeSandboxScript(code);
      const valResult = SandboxValidator.validate(sanitized, language);
      if (!valResult.safe) {
        return resolve({ error: `Security Violation: ${valResult.violations.map(v => v.detail).join(' ')}` });
      }

      const child = exec('node', { timeout }, (err, stdout, stderr) => {
        if (err && err.killed) {
          resolve({ error: 'Execution Timeout' });
        } else if (err) {
          resolve({ error: stderr || err.message });
        } else {
          resolve({ output: stdout });
        }
      });

      if (child.stdin) {
        child.stdin.write(sanitized);
        child.stdin.end();
      }
    });
  }
}

module.exports = SandboxRunner;
