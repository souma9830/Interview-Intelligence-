const BLOCKED_MODULES = [
  'fs', 'child_process', 'cluster', 'net', 'dgram',
  'dns', 'http2', 'https', 'http', 'tls',
  'tty', 'readline', 'repl', 'vm', 'v8',
  'worker_threads', 'process', 'os', 'perf_hooks',
  'async_hooks', 'trace_events', 'inspector',
];

const FORBIDDEN_PATTERNS = [
  { label: 'process_access', pattern: /\bprocess\s*\./ },
  { label: 'require_statement', pattern: /\brequire\s*\(/ },
  { label: 'import_statement', pattern: /^\s*import\s+/m },
  { label: 'eval_usage', pattern: /\beval\s*\(/ },
  { label: 'function_constructor', pattern: /\bFunction\s*\(/ },
  { label: 'set_timeout_string', pattern: /setTimeout\s*\(\s*['"`]/ },
  { label: 'set_interval_string', pattern: /setInterval\s*\(\s*['"`]/ },
  { label: 'new_function', pattern: /new\s+Function\s*\(/ },
  { label: 'global_access', pattern: /\bglobal\s*\./ },
  { label: 'window_access', pattern: /\bwindow\s*\./ },
  { label: 'document_access', pattern: /\bdocument\s*\./ },
  { label: 'fetch_call', pattern: /\bfetch\s*\(/ },
  { label: 'xml_http_request', pattern: /\bXMLHttpRequest\s*\(/ },
  { label: 'websocket', pattern: /\bWebSocket\s*\(/ },
  { label: 'local_storage', pattern: /\blocalStorage\s*\./ },
  { label: 'environment_variable', pattern: /\bprocess\s*\.\s*env/ },
];

const SUPPORTED_LANGUAGES = ['javascript', 'cpp', 'java', 'python'];

const EXECUTION_LIMITS = {
  maxCodeLengthChars: 30000,
  maxExecutionTimeMs: 10000,
  maxMemoryMb: 256,
};

module.exports = {
  BLOCKED_MODULES,
  FORBIDDEN_PATTERNS,
  SUPPORTED_LANGUAGES,
  EXECUTION_LIMITS,
};
