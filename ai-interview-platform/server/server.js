const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables before anything else
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'aiinterview-a3d81'
  });
  console.log('✔ Firebase Admin initialized statelessly.');
}

const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✔ Stateless API server listening gracefully on port ${PORT}`);
  console.log(`[Diagnostic] Node.js Version: ${process.version}`);
  console.log(`[Diagnostic] Platform: ${process.platform}`);
});