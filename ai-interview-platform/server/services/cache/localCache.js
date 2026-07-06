const cache = new Map();

const ttlCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache) {
    if (now > item.expiry) {
      cache.delete(key);
    }
  }
}, 60000);

if (ttlCleanup.unref) {
  ttlCleanup.unref();
}

class LocalCache {
  get(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlMs = 300000) {
    cache.set(key, { value, expiry: Date.now() + ttlMs });
  }

  del(key) {
    cache.delete(key);
  }

  clear() {
    cache.clear();
  }

  size() {
    return cache.size;
  }
}

module.exports = LocalCache;
