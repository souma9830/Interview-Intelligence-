const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const connectionOptions = {
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  maxPoolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE, 10) || 2,
  socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT, 10) || 45000,
  family: 4,
  retryWrites: true,
  w: 'majority',
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  DB_URI,
  connectionOptions,
  MAX_RETRIES,
  RETRY_DELAY_MS,
  wait,
};
