const mongoose = require('mongoose');

module.exports.up = async () => {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  if (names.includes('interviews')) {
    await db.collection('interviews').createIndex({ status: 1 }, { background: true });
    await db.collection('interviews').createIndex({ 'questions.category': 1 }, { background: true });
  }
  if (names.includes('reports')) {
    await db.collection('reports').createIndex({ overallScore: -1 }, { background: true });
    await db.collection('reports').createIndex({ interview: 1 }, { background: true });
  }
  if (names.includes('refreshtokens')) {
    await db.collection('refreshtokens').createIndex({ token: 1 }, { unique: true, background: true });
    await db.collection('refreshtokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
  }
  if (names.includes('promptcaches')) {
    await db.collection('promptcaches').createIndex({ promptHash: 1 }, { unique: true, background: true });
  }
  if (names.includes('customquestionsets')) {
    await db.collection('customquestionsets').createIndex({ userId: 1, isActive: -1 }, { background: true });
  }
};

module.exports.down = async () => {
  const db = mongoose.connection.db;
  try {
    await db.collection('interviews').dropIndex('status_1');
  } catch {}
  try {
    await db.collection('interviews').dropIndex('questions.category_1');
  } catch {}
  try {
    await db.collection('reports').dropIndex('overallScore_-1');
  } catch {}
};