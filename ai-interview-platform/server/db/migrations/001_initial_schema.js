const mongoose = require('mongoose');

module.exports.up = async () => {
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  if (!names.includes('users')) {
    await db.createCollection('users');
  }
  if (!names.includes('interviews')) {
    await db.createCollection('interviews');
  }
  if (!names.includes('reports')) {
    await db.createCollection('reports');
  }
  if (!names.includes('resumes')) {
    await db.createCollection('resumes');
  }
  if (!names.includes('otps')) {
    await db.createCollection('otps');
  }
  if (!names.includes('auditlogs')) {
    await db.createCollection('auditlogs');
  }

  await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
  await db.collection('users').createIndex({ firebaseUid: 1 }, { sparse: true, background: true });
  await db.collection('interviews').createIndex({ user: 1, createdAt: -1 }, { background: true });
  await db.collection('reports').createIndex({ user: 1, createdAt: -1 }, { background: true });
  await db.collection('resumes').createIndex({ user: 1 }, { unique: true, background: true });
  await db.collection('otps').createIndex({ email: 1, createdAt: -1 }, { background: true });
  await db.collection('otps').createIndex({ createdAt: 1 }, { expireAfterSeconds: 300, background: true });
  await db.collection('auditlogs').createIndex({ timestamp: -1 }, { background: true });
  await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 }, { background: true });
};

module.exports.down = async () => {
  const db = mongoose.connection.db;
  await db.collection('users').dropIndexes();
};