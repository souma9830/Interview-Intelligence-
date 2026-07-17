const mongoose = require('mongoose');
const logger = require('../services/logger');

const INDEX_DEFINITIONS = {
  users: [
    { keys: { email: 1 }, options: { unique: true, background: true } },
    { keys: { role: 1, createdAt: -1 }, options: { background: true } },
    { keys: { isActive: 1, lastLogin: -1 }, options: { background: true } },
  ],
  interviews: [
    { keys: { userId: 1, status: 1, createdAt: -1 }, options: { background: true } },
    { keys: { category: 1, difficulty: 1, score: -1 }, options: { background: true } },
    { keys: { scheduledDate: 1, status: 1 }, options: { background: true } },
    { keys: { 'analytics.totalScore': -1 }, options: { background: true } },
  ],
  reports: [
    { keys: { interviewId: 1 }, options: { unique: true, background: true } },
    { keys: { userId: 1, createdAt: -1 }, options: { background: true } },
    { keys: { 'scores.overall': -1 }, options: { background: true } },
  ],
  resumes: [
    { keys: { userId: 1 }, options: { unique: true, background: true } },
    { keys: { status: 1, updatedAt: -1 }, options: { background: true } },
    { keys: { skills: 1 }, options: { background: true } },
  ],
  otps: [
    { keys: { email: 1, type: 1 }, options: { background: true } },
    { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0, background: true } },
  ],
  auditlogs: [
    { keys: { userId: 1, action: 1, createdAt: -1 }, options: { background: true } },
    { keys: { createdAt: -1 }, options: { background: true } },
    { keys: { ip: 1, createdAt: -1 }, options: { background: true } },
  ],
};

async function ensureIndexes(options = {}) {
  const { dropDuplicates = false, timeout = 120000 } = options;
  const results = { created: [], skipped: [], errors: [] };

  for (const [collectionName, indexes] of Object.entries(INDEX_DEFINITIONS)) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      if (!collection) {
        logger.warn(`Collection ${collectionName} not found, skipping indexes`);
        continue;
      }

      const existingIndexes = await collection.indexes();
      const existingNames = new Set(existingIndexes.map(idx => idx.name));

      for (const indexDef of indexes) {
        const indexName = indexDef.options?.name || Object.entries(indexDef.keys)
          .map(([k, v]) => `${k}_${v}`)
          .join('_');

        if (existingNames.has(indexName)) {
          results.skipped.push(`${collectionName}.${indexName}`);
          continue;
        }

        await collection.createIndex(indexDef.keys, {
          ...indexDef.options,
          name: indexName,
          ...(dropDuplicates ? {} : {}),
        });
        results.created.push(`${collectionName}.${indexName}`);
      }
    } catch (error) {
      logger.error(`Index creation failed for ${collectionName}`, { error: error.message });
      results.errors.push({ collection: collectionName, error: error.message });
    }
  }

  if (results.created.length > 0) {
    logger.info(`Created indexes: ${results.created.join(', ')}`);
  }
  if (results.errors.length > 0) {
    logger.error(`Index errors: ${results.errors.map(e => `${e.collection}: ${e.error}`).join('; ')}`);
  }

  return results;
}

async function analyzeMissingIndexes() {
  const results = [];
  const collections = Object.keys(INDEX_DEFINITIONS);

  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      const explainResult = await collection.aggregate([{ $collStats: { storageStats: {} } }]).toArray();
      const totalDocs = explainResult[0]?.storageStats?.count || 0;

      if (totalDocs < 1000) continue;

      const pipeline = [
        { $indexStats: {} },
        {
          $group: {
            _id: null,
            totalAccesses: { $sum: '$accesses' },
            indexes: { $push: { name: '$name', accesses: '$accesses' } },
          },
        },
      ];
      const stats = await collection.aggregate(pipeline).toArray();
      results.push({
        collection: collectionName,
        totalDocs,
        indexUsage: stats[0]?.indexes || [],
      });
    } catch (error) {
      logger.warn(`Failed to analyze indexes for ${collectionName}: ${error.message}`);
    }
  }

  return results;
}

async function dropUnusedIndexes(daysThreshold = 30) {
  const dropped = [];
  const errors = [];

  for (const collectionName of Object.keys(INDEX_DEFINITIONS)) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      const indexes = await collection.indexes();

      for (const index of indexes) {
        if (index.name === '_id_') continue;
        if (index.expireAfterSeconds) continue;

        const accesses = index.accesses || 0;
        if (accesses === 0) {
          await collection.dropIndex(index.name);
          dropped.push(`${collectionName}.${index.name}`);
          logger.info(`Dropped unused index: ${collectionName}.${index.name}`);
        }
      }
    } catch (error) {
      errors.push({ collection: collectionName, error: error.message });
    }
  }

  return { dropped, errors };
}

async function getIndexRecommendations() {
  const recommendations = [];
  const collections = Object.keys(INDEX_DEFINITIONS);

  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      const stats = await collection.aggregate([
        { $collStats: { storageStats: {} } },
      ]).toArray();

      const totalDocs = stats[0]?.storageStats?.count || 0;
      const avgObjSize = stats[0]?.storageStats?.avgObjSize || 0;

      if (totalDocs > 10000 && avgObjSize > 500) {
        recommendations.push({
          collection: collectionName,
          suggestion: 'Consider adding a covered query index for frequently accessed fields',
          docCount: totalDocs,
          avgDocSize: Math.round(avgObjSize),
        });
      }

      const indexes = await collection.indexes();
      const secondaryIndexes = indexes.filter(idx => idx.name !== '_id_');
      const indexKeyCount = secondaryIndexes.reduce((sum, idx) => sum + Object.keys(idx.key).length, 0);

      if (secondaryIndexes.length > 5) {
        recommendations.push({
          collection: collectionName,
          suggestion: `Many indexes (${secondaryIndexes.length}) may impact write performance. Consider compound indexes`,
          currentIndexes: secondaryIndexes.length,
          indexKeyCount,
        });
      }
    } catch (error) {
      logger.warn(`Failed to analyze ${collectionName}: ${error.message}`);
    }
  }

  return recommendations;
}

module.exports = {
  ensureIndexes,
  analyzeMissingIndexes,
  dropUnusedIndexes,
  getIndexRecommendations,
  INDEX_DEFINITIONS,
};