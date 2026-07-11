const mongoose = require('mongoose');
const logger = require('../services/logger');
const queryProfiler = require('../services/queryProfiler');
const { ensureIndexes } = require('./indexManager');

let isConnected = false;

const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  if (!DB_URI) {
    logger.info('No MONGO_URI/MONGODB_URI configured. Operating in stateless file-storage mode.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    const { runMigrations } = require('../db/migrations/migrationRunner');
    runMigrations().catch(err => {
      console.error('[Database] Migration error:', err.message);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Database connection error', { error: err.message });
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Disconnected from MongoDB');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Reconnected to MongoDB');
      isConnected = true;
    });

    mongoose.connection.setMaxListeners(20);

    if (process.env.ENABLE_INDEX_CREATION !== 'false') {
      const indexResults = await ensureIndexes();
      if (indexResults.created.length > 0) {
        logger.info(`Database indexes ensured: ${indexResults.created.length} created, ${indexResults.skipped.length} skipped`);
      }
    }

  } catch (err) {
    logger.error('Could not connect to MongoDB', { error: err.message });
    isConnected = false;
  }
};

const isDatabaseConnected = () => isConnected;

const disconnectDatabase = async () => {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB gracefully.');
  } catch (err) {
    logger.error('Error during disconnect', { error: err.message });
  }
};

module.exports = { connectDatabase, disconnectDatabase, isDatabaseConnected };