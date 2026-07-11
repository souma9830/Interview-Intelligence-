const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const healthRoutes = require('./routes/healthRoutes');
const requestLogger = require('./middleware/logging/requestLogger');
const { securityHeaders } = require('./middleware/securityHeaders');
const { sanitizeMiddleware } = require('./middleware/sanitizeMiddleware');
const { apiVersioning } = require('./middleware/apiVersion');
const { globalErrorHandler, notFoundHandler } = require('./middleware/error/errorHandler');
const configCheck = require('./utils/configCheck');
const logger = require('./services/logger');
const { CSP_DIRECTIVES, corsConfig, buildCSPString } = require('./config/securityConfig');

const configStatus = configCheck.check();
if (!configStatus.valid) {
  logger.warn('Missing environment variables', { missing: configStatus.missing });
}

const rateLimiter = require('./middleware/rateLimiter');

const app = express();

if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET environment variable is missing. Using default signing key.');
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: CSP_DIRECTIVES,
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(securityHeaders);
app.use(cors(corsConfig));
app.use(requestLogger);
app.use(apiVersioning);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(sanitizeMiddleware);
app.use(rateLimiter(100));

app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v2/auth', require('./routes/v2/authRoutes'));
app.use('/api', require('./routes/telemetryRoutes'));
app.use('/api', require('./routes/backupRoutes'));
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', require('./routes/queryRoutes'));
app.use('/api/admin', require('./routes/errorRoutes'));

app.get('/', (req, res) => {
  res.send('AI Interview Platform API is running...');
});

app.post('/api/csp-violation', express.json({ type: 'application/csp-report' }), (req, res) => {
  const log = require('./services/logger');
  log.warn('CSP Violation', { report: req.body, headers: req.headers });
  res.status(204).end();
});

// Register global error routing bounds
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;

// Unified error and security logging enabled
