const mongoose = require('mongoose');
const logger = require('../services/logger');
const queryProfiler = require('../services/queryProfiler');
const { ensureIndexes } = require('./indexManager');
const { DB_URI, connectionOptions, MAX_RETRIES, RETRY_DELAY_MS, wait } = require('../config/databaseConfig');

let isConnected = false;

const connectDatabase = async (retryCount = 0) => {
  if (isConnected) {
    return;
  }

  if (!DB_URI) {
    logger.info('No MONGO_URI/MONGODB_URI configured. Operating in stateless file-storage mode.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(DB_URI, connectionOptions);

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    const { runMigrations } = require('../db/migrations/migrationRunner');
    runMigrations().catch(err => {
      logger.error('Migration error', { error: err.message });
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
    logger.error('Could not connect to MongoDB', { error: err.message, attempt: retryCount + 1 });
    isConnected = false;

    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`Retrying connection in ${RETRY_DELAY_MS / 1000}s... (attempt ${retryCount + 2}/${MAX_RETRIES})`);
      await wait(RETRY_DELAY_MS);
      return connectDatabase(retryCount + 1);
    }
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
