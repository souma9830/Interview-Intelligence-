/**
 * Sandbox Security Configuration
 *
 * Centralized definitions for code execution constraints applied
 * to candidate-submitted code during interview assessments.
 * Each entry in BLOCKED_MODULES and FORBIDDEN_PATTERNS is derived
 * from real-world attack vectors observed in competitive programming
 * and online assessment platforms.
 */

const BLOCKED_MODULES = [
  'fs',
  'child_process',
  'cluster',
  'dgram',
  'dns',
  'http',
  'http2',
  'https',
  'net',
  'os',
  'path',
  'tls',
  'worker_threads',
  'vm',
  'perf_hooks',
  'v8',
  'readline',
];

/**
 * Forbidden patterns expressed as regex strings.
 * Each pattern captures a distinct attack surface:
 *   - File system traversal and read/write
 *   - Process spawning and signal manipulation
 *   - Environment variable harvesting
 *   - Dynamic code execution via eval or Function constructor
 *   - Network socket creation
 */
const FORBIDDEN_PATTERNS = [
  // Direct require of blocked modules
  { pattern: /require\s*\(\s*['"`](fs|child_process|cluster|dgram|dns|http|http2|https|net|os|tls|worker_threads|vm)['"`]\s*\)/, label: 'blocked_module_import' },

  // Dynamic require used to bypass static checks
  { pattern: /require\s*\(\s*[^'"`]/, label: 'dynamic_require' },

  // Process object access (env secrets, exit, kill)
  { pattern: /process\s*\.\s*(env|exit|kill|abort|chdir|cwd)/, label: 'process_access' },

  // eval and Function constructor for arbitrary code execution
  { pattern: /\beval\s*\(/, label: 'eval_call' },
  { pattern: /new\s+Function\s*\(/, label: 'function_constructor' },

  // Global object manipulation
  { pattern: /globalThis\s*\[/, label: 'globalThis_access' },
  { pattern: /global\s*\.\s*process/, label: 'global_process_access' },

  // import() dynamic imports (ESM bypass)
  { pattern: /import\s*\(/, label: 'dynamic_import' },

  // File descriptor and buffer exploits
  { pattern: /Buffer\s*\.\s*(alloc|allocUnsafe|from)\s*\(\s*\d{6,}/, label: 'large_buffer_allocation' },

  // setTimeout/setInterval with string argument (implicit eval)
  { pattern: /setTimeout\s*\(\s*['"`]/, label: 'setTimeout_string_eval' },
  { pattern: /setInterval\s*\(\s*['"`]/, label: 'setInterval_string_eval' },
];

/**
 * Resource limits enforced at the execution runtime boundary.
 * These values are advisory and should be mapped to the actual
 * execution engine (Docker, isolated-vm, etc.) during integration.
 */
const EXECUTION_LIMITS = {
  timeoutMs: 10000,
  maxMemoryMb: 50,
  maxOutputBytes: 1024 * 512, // 512 KB stdout cap
  maxCodeLengthChars: 50000,
};

/**
 * Languages that the sandbox currently supports.
 * Unsupported language submissions are rejected before
 * any validation or execution occurs.
 */
const SUPPORTED_LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c'];

module.exports = {
  BLOCKED_MODULES,
  FORBIDDEN_PATTERNS,
  EXECUTION_LIMITS,
  SUPPORTED_LANGUAGES,
};
