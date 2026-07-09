const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables before anything else
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'aiinterview-a3d81'
  });
  console.log('✔ Firebase Admin initialized statelessly.');
}

const { connectDatabase, disconnectDatabase } = require('./utils/database');

const startServer = async () => {
  // Attempt to connect to MongoDB if configured; continue in stateless mode otherwise
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
      console.log('[SMTP] Connection verified successfully.');
    } catch (err) {
      console.warn(`[SMTP] Connection verification failed: ${err.message}. Emails may not be delivered.`);
    }
  } else {
    console.warn('[SMTP] Not configured. Email functionality disabled.');
  }

  const app = require('./app');
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`✔ API server listening gracefully on port ${PORT}`);
    console.log(`[Diagnostic] Node.js Version: ${process.version}`);
    console.log(`[Diagnostic] Platform: ${process.platform}`);
    console.log(`[Diagnostic] SMTP: ${smtpConfigured ? 'Configured' : 'Not configured'}`);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal) => {
    console.log(`\n[Shutdown] Received ${signal}. Closing connections...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log('[Shutdown] Server closed.');
      process.exit(0);
    });
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('[Shutdown] Forced exit after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    console.error('[Fatal] Uncaught exception:', err.message);
    shutdown('uncaughtException');
  });
};

startServer().catch((err) => {
  console.error('[Fatal] Server startup failed:', err.message);
  process.exit(1);
});
