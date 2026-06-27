/**
 * Simple in-memory cache utility with Time-To-Live (TTL) and Least Recently Used (LRU) eviction.
 */
class CacheManager {
  constructor(maxSize = 100, defaultTtlMs = 600000) { // 10 mins default TTL
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;

    const entry = this.cache.get(key);
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh order (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    // Evict oldest if full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instances for different domains
const llmCache = new CacheManager(100, 300000); // 5 min TTL for LLM queries
const parserCache = new CacheManager(50, 600000); // 10 min TTL for files

module.exports = { CacheManager, llmCache, parserCache };
