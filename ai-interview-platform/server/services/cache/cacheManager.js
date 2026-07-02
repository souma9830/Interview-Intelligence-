const CacheFactory = require('./cacheFactory');

class CacheManager {
  constructor() {
    this.provider = CacheFactory.getCacheProvider();
  }
  get(key) { return this.provider.get(key); }
  set(key, val, ttl) { return this.provider.set(key, val, ttl); }
  del(key) { return this.provider.del(key); }
  clear() { return this.provider.clear(); }
}
module.exports = new CacheManager();
