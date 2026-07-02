const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const healthRoutes = require('./routes/healthRoutes');
const requestLogger = require('./middleware/logging/requestLogger');

const { globalErrorHandler, notFoundHandler } = require('./middleware/error/errorHandler');
const configCheck = require('./utils/configCheck');

const configStatus = configCheck.check();
if (!configStatus.valid) {
  console.warn(`[Configuration Warning] Missing environment variables: ${configStatus.missing.join(', ')}`);
}

const rateLimiter = require('./middleware/rateLimiter');

const app = express();

if (!process.env.JWT_SECRET) {
  console.warn('[Security Warning] JWT_SECRET environment variable is missing. Using default signing key.');
}

// Attempt to load sandbox security configuration; degrade gracefully if missing
let sandboxConfig;
try {
  sandboxConfig = require('./config/sandboxConfig');
  const { BLOCKED_MODULES, FORBIDDEN_PATTERNS, SUPPORTED_LANGUAGES } = sandboxConfig;
  console.log(
    `[Sandbox Security] Initialized — ${BLOCKED_MODULES.length} blocked modules, ` +
    `${FORBIDDEN_PATTERNS.length} forbidden patterns, ` +
    `${SUPPORTED_LANGUAGES.length} supported languages`
  );
} catch (configErr) {
  console.warn(`[Sandbox Security] Config not loaded (${configErr.message}). Using safe defaults.`);
  sandboxConfig = {
    BLOCKED_MODULES: [],
    FORBIDDEN_PATTERNS: [],
    SUPPORTED_LANGUAGES: ['javascript', 'cpp', 'java', 'python'],
    EXECUTION_LIMITS: { maxCodeLengthChars: 30000, maxExecutionTimeMs: 10000, maxMemoryMb: 256 },
  };
}

app.use(requestLogger);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(rateLimiter(100));

app.use('/api/auth', authRoutes);
app.use('/api', require('./routes/telemetryRoutes'));
app.use('/api', require('./routes/backupRoutes'));
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('AI Interview Platform API is running...');
});

// Register global error routing bounds
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;

// Unified error and security logging enabled
