export const TELEMETRY_EVENTS = {
  SESSION_INITIALIZED: 'Proctored session initialized',
  SESSION_STARTED: 'Proctored session started',
  RECORDING_COMPILED: 'Proctored recording compiled successfully',
  TAB_SWITCH: 'TabSwitch',
  FULLSCREEN_EXIT: 'FullscreenExit',
  TAB_SWITCH_DESC: 'User switched to another tab',
  FULLSCREEN_EXIT_DESC: 'User exited fullscreen mode',
  VIOLATION: 'Fullscreen exited / tab switched (Violation)',
};

export const RECORDING_STATUS = {
  IDLE: 'idle',
  RECORDING: 'recording',
  STOPPED: 'stopped',
};

export const PROCTOR_LABELS = {
  HEADER_TITLE: 'Proctored Video Telemetry',
  OFFLINE: 'Telemetry offline (Mic/Cam denied)',
  PERMISSION_GRANT: 'Grant Permission',
  START_FEED: 'Start Proctoring Feed',
  STOP_FEED: 'Stop Proctoring Feed',
  RE_RECORD: 'Re-record',
  DOWNLOAD: 'Download WebM',
  CAMERA_DENIED: 'Camera/Mic access denied for telemetry recording',
};

export const SANDBOX_MESSAGES = {
  INITIALIZED: '// Sandbox initialized successfully.',
  PRESS_RUN: "// Press 'Run execution' to evaluate assertion test cases.",
  COMPILATION_DISPATCHED: 'Compilation pipeline dispatched for',
  COMPILING: 'Compiling code.',
  COMPILE_SUCCESS: '✔ Compiling process completed.',
  INVOKING_TESTS: '> Invoking local unit test cases...',
  SYNTAX_ERROR: '❌ Syntax assertion compilation error.',
  EVAL_COMPLETE: 'EVALUATION COMPLETED. SCORE:',
  FALLBACK_GOOD: 'Outstanding modular framework structure.',
  FALLBACK_BAD: 'Calibrate syntax functions properly.',
};

export const PROCTOR_KEYS = {
  DEMO_SESSION: 'demo_session_active',
  DEMO_TOKEN: 'demo_token_active',
  STORAGE_KEY: 'camsense_token',
};

export { TELEMETRY_EVENTS as EVENTS };