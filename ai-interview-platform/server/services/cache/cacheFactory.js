
const LocalCache = require('./localCache');

class CacheFactory {
  static getCacheProvider(type = 'local') {
    return new LocalCache();
  }
}
module.exports = CacheFactory;
      