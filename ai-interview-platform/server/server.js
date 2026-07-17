const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./services/logger');

dotenv.config({ path: path.join(__dirname, '../.env') });
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'aiinterview-a3d81'
  });
  logger.info('Firebase Admin initialized statelessly.');
}

const { connectDatabase, disconnectDatabase } = require('./utils/database');

const startServer = async () => {
  await connectDatabase();

  const nodemailer = require('nodemailer');
  const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
  if (smtpConfigured) {
    try {
      const testTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT, 10) || 2525,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await testTransporter.verify();
      logger.info('SMTP connection verified successfully.');
    } catch (err) {
      logger.warn('SMTP connection verification failed. Emails may not be delivered.', { error: err.message });
    }
  } else {
    logger.warn('SMTP not configured. Email functionality disabled.');
  }

  const app = require('./app');
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    logger.info(`API server listening on port ${PORT}`, {
      nodeVersion: process.version,
      platform: process.platform,
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Closing connections...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced exit after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { message: err.message, stack: err.stack });
    shutdown('uncaughtException');
  });
};

startServer().catch((err) => {
  logger.error('Server startup failed', { message: err.message, stack: err.stack });
  process.exit(1);
});