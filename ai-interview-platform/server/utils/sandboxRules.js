/**
 * Curated list of additional security patterns and rules for the sandbox environment.
 */

const SUSPICIOUS_KEYWORDS = [
  'process.kill',
  'process.exit',
  'child_process',
  'spawn',
  'exec',
  'cluster.fork',
  'setInterval',
  'Function(',
  'eval(',
];

const containsSuspiciousKeyword = (code) => {
  return SUSPICIOUS_KEYWORDS.some(kw => code.includes(kw));
};

module.exports = {
  SUSPICIOUS_KEYWORDS,
  containsSuspiciousKeyword,
};
