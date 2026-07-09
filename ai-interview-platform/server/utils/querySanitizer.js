const { deepSanitize, BLOCKED_OPERATORS } = require('../middleware/sanitizeMiddleware');

class QuerySanitizer {
  static sanitizeFilter(filter) {
    if (!filter || typeof filter !== 'object') return filter;
    return deepSanitize(filter);
  }

  static sanitizeUpdate(update) {
    if (!update || typeof update !== 'object') return update;
    const sanitized = {};
    for (const [key, value] of Object.entries(update)) {
      if (key.startsWith('$')) {
        const cleanOp = BLOCKED_OPERATORS.includes(key) ? `_${key}` : key;
        sanitized[cleanOp] = deepSanitize(value);
      } else {
        sanitized[key] = deepSanitize(value);
      }
    }
    return sanitized;
  }

  static sanitizeAggregation(pipeline) {
    if (!Array.isArray(pipeline)) return pipeline;
    return pipeline.map(stage => {
      if (stage.$match) {
        return { $match: this.sanitizeFilter(stage.$match) };
      }
      return stage;
    });
  }

  static stripOperators(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(this.stripOperators.bind(this));
    return Object.keys(obj).reduce((acc, key) => {
      if (!key.startsWith('$')) {
        acc[key] = this.stripOperators(obj[key]);
      }
      return acc;
    }, {});
  }

  static hasInjectionPatterns(value) {
    if (typeof value === 'string') {
      const patterns = [
        /\$where/i,
        /\$gt/i,
        /\$ne/i,
        /\$regex/i,
        /\$expr/i,
        /\beval\s*\(/i,
        /\bfunction\s*\(/i,
      ];
      return patterns.some(p => p.test(value));
    }
    return false;
  }
}

module.exports = QuerySanitizer;