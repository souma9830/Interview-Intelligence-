const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../services/logger');

const BLOCKED_OPERATORS = ['$where', '$regex', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$or', '$and', '$nor', '$not', '$elemMatch', '$mod', '$all', '$size', '$exists', '$expr', '$jsonSchema', '$text', '$search'];

const sanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('NoSQL injection attempt blocked', {
      ip: req.ip,
      path: req.originalUrl,
      blockedKey: key,
    });
  },
});

const deepSanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = BLOCKED_OPERATORS.includes(key) ? `_${key}` : key;
    sanitized[cleanKey] = deepSanitize(value);
  }
  return sanitized;
};

module.exports = { sanitizeMiddleware, deepSanitize, BLOCKED_OPERATORS };