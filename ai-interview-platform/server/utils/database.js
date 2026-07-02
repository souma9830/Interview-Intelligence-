const mongoose = require('mongoose');

let isConnected = false;

const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  if (!DB_URI) {
    console.log('[Database] No MONGO_URI/MONGODB_URI configured. Operating in stateless file-storage mode.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database] Connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Disconnected from MongoDB');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] Reconnected to MongoDB');
      isConnected = true;
    });

  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB (${err.message}). Operating in stateless file-storage mode.`);
    isConnected = false;
  }
};

const isDatabaseConnected = () => isConnected;

const disconnectDatabase = async () => {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] Disconnected gracefully.');
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};

module.exports = { connectDatabase, disconnectDatabase, isDatabaseConnected };
