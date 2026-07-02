const cacheManager = require('./cache/cacheManager');

const cacheService = {
  async get(key) {
    try {
      const hashedKey = typeof key === 'string'
        ? require('crypto').createHash('md5').update(key).digest('hex')
        : key;
      return cacheManager.get(hashedKey);
    } catch {
      return null;
    }
  },

  async set(key, value, ttlSeconds = 3600) {
    try {
      const hashedKey = typeof key === 'string'
        ? require('crypto').createHash('md5').update(key).digest('hex')
        : key;
      cacheManager.set(hashedKey, value, ttlSeconds * 1000);
      return true;
    } catch {
      return false;
    }
  },

  async del(key) {
    try {
      const hashedKey = typeof key === 'string'
        ? require('crypto').createHash('md5').update(key).digest('hex')
        : key;
      cacheManager.del(hashedKey);
      return true;
    } catch {
      return false;
    }
  },

  async clear() {
    try {
      if (typeof cacheManager.clear === 'function') {
        cacheManager.clear();
      }
      return true;
    } catch {
      return false;
    }
  }
};

module.exports = cacheService;
