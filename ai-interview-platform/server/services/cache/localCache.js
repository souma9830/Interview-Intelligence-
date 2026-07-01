const cache = new Map();
module.exports = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    return item.value;
  },
  set: (key, value, ttlMs = 300000) => {
    cache.set(key, { value, expiry: Date.now() + ttlMs });
  }
};
