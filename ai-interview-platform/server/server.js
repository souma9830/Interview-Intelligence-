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

  const app = require('./app');
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`✔ API server listening gracefully on port ${PORT}`);
    console.log(`[Diagnostic] Node.js Version: ${process.version}`);
    console.log(`[Diagnostic] Platform: ${process.platform}`);
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
