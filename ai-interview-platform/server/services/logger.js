const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, requestId, userId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${requestId || '-'}]${userId ? ` [user:${userId}]` : ''} ${message}${metaStr}`;
  })
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    logFormat
  ),
  handleExceptions: true,
});

const fileTransport = new winston.transports.File({
  filename: path.join(logDir, 'combined.log'),
  maxsize: 10 * 1024 * 1024,
  maxFiles: 5,
  format: logFormat,
  handleExceptions: true,
});

const errorFileTransport = new winston.transports.File({
  filename: path.join(logDir, 'error.log'),
  level: 'error',
  maxsize: 10 * 1024 * 1024,
  maxFiles: 10,
  format: logFormat,
  handleExceptions: true,
});

const auditFileTransport = new winston.transports.File({
  filename: path.join(logDir, 'audit.log'),
  level: 'info',
  maxsize: 5 * 1024 * 1024,
  maxFiles: 3,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.json()
  ),
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [consoleTransport, fileTransport, errorFileTransport, auditFileTransport],
  exitOnError: false,
});

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

logger.logWithContext = (level, message, meta = {}) => {
  const enriched = {
    ...meta,
    requestId: meta.requestId || global.currentRequestId,
    userId: meta.userId || global.currentUserId,
  };
  logger.log(level, message, enriched);
};

module.exports = logger;