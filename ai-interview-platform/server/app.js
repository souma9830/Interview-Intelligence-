const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const requestLogger = require('./middleware/logging/requestLogger');

const { globalErrorHandler, notFoundHandler } = require('./middleware/error/errorHandler');
const configCheck = require('./utils/configCheck');

const configStatus = configCheck.check();
if (!configStatus.valid) {
  console.warn(`[Configuration Warning] Missing environment variables: ${configStatus.missing.join(', ')}`);
}

const adminRoutes = require('./routes/adminRoutes');

const healthRoutes = require('./routes/healthRoutes');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Load security middlewares, including route-level request rate limiters

// Log sandbox security layer initialization status at boot
const { BLOCKED_MODULES, FORBIDDEN_PATTERNS, SUPPORTED_LANGUAGES } = require('./config/sandboxConfig');
console.log(
  `[Sandbox Security] Initialized — ${BLOCKED_MODULES.length} blocked modules, ` +
  `${FORBIDDEN_PATTERNS.length} forbidden patterns, ` +
  `${SUPPORTED_LANGUAGES.length} supported languages`
);
app.use(requestLogger);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(rateLimiter(100)); // Apply rate limiter to all routes (max 100 req/min)

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
