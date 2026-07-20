/**
 * Coding challenge boilerplate templates organized by Role and Language.
 * Provides realistic class skeletons, functions, and standard IO formats.
 */

export const LANGUAGE_BOILERPLATES = {
  javascript: {
    ext: 'js',
    label: 'JavaScript',
    'Frontend Engineer': `class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Registers a callback for the given eventName.
   * Returns an object with a release() method to unsubscribe.
   */
  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    
    return {
      release: () => {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
      }
    };
  }

  /**
   * Executes all registered callbacks for the given eventName.
   */
  emit(eventName, ...args) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => callback(...args));
  }
}

// Example verification:
const emitter = new EventEmitter();
const sub = emitter.subscribe('click', (msg) => console.log('Clicked:', msg));
emitter.emit('click', 'emitter is working!');
sub.release();
`,
    'Backend Engineer': `class TokenBucket {
  /**
   * @param {number} capacity - Max tokens the bucket can hold
   * @param {number} refillRate - Tokens added per second
   */
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefilled = Date.now();
  }

  /**
   * Lazy-refills the bucket and checks if tokensRequired can be consumed.
   * @param {number} tokensRequired
   * @returns {boolean}
   */
  allowRequest(tokensRequired) {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefilled) / 1000;
    this.lastRefilled = now;

    // Refill tokens
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRate);

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}

// Test verification:
const bucket = new TokenBucket(10, 2);
console.log('Request allowed (1 token):', bucket.allowRequest(1));
`,
    'Fullstack Engineer': `/**
 * Wrapper client with retry logic and abortable timeouts.
 */
async function fetchWithRetry(url, options = {}, maxRetries = 3, timeoutMs = 2000) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      attempt++;
      if (attempt >= maxRetries) throw err;
      console.warn(\`Attempt \${attempt} failed. Retrying...\`);
    }
  }
}
`,
    'AI / ML Engineer': `/**
 * Calculates the Cosine Similarity between vector A and vector B.
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

console.log('Similarity:', cosineSimilarity([1, 2, 3], [1, 2, 3]));
`
  },
  python: {
    ext: 'py',
    label: 'Python',
    'Frontend Engineer': `# Implement custom EventEmitter class in Python
class EventEmitter:
    def __init__(self):
        self.events = {}

    def subscribe(self, event_name, callback):
        if event_name not in self.events:
            self.events[event_name] = []
        self.events[event_name].append(callback)
        
        class Subscription:
            def __init__(self, events, name, cb):
                self.events = events
                self.name = name
                self.cb = cb
            def release(self):
                if self.name in self.events:
                    self.events[self.name].remove(self.cb)
                    
        return Subscription(self.events, event_name, callback)

    def emit(self, event_name, *args, **kwargs):
        if event_name in self.events:
            for callback in self.events[event_name]:
                callback(*args, **kwargs)
`,
    'Backend Engineer': `# TokenBucket Rate Limiter implementation
import time

class TokenBucket:
    def __init__(self, capacity: float, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refilled = time.time()

    def allow_request(self, tokens_required: float) -> bool:
        now = time.time()
        elapsed = now - self.last_refilled
        self.last_refilled = now
        
        # Lazy refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        
        if self.tokens >= tokens_required:
            self.tokens -= tokens_required
            return True
        return False
`,
    'Fullstack Engineer': `# Fetch timeout simulator in Python
import urllib.request
import socket

def fetch_with_retry(url, max_retries=3, timeout=2.0):
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(url, timeout=timeout) as response:
                return response.read().decode('utf-8')
        except (urllib.error.URLError, socket.timeout) as e:
            if attempt == max_retries - 1:
                raise e
            print(f"Attempt {attempt+1} failed. Retrying...")
`,
    'AI / ML Engineer': `# Vector cosine similarity semantic ranker
import math

def cosine_similarity(vec_a, vec_b):
    if len(vec_a) != len(vec_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = sum(a * a for a in vec_a)
    norm_b = sum(b * b for b in vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (math.sqrt(norm_a) * math.sqrt(norm_b))
`
  },
  cpp: {
    ext: 'cpp',
    label: 'C++',
    'Frontend Engineer': `// Write your custom solution here in C++
#include <iostream>
#include <unordered_map>
#include <vector>
#include <functional>

class EventEmitter {
    // Custom Event emitter structure
};
`,
    'Backend Engineer': `// TokenBucket Rate Limiter in C++
#include <iostream>
#include <chrono>
#include <algorithm>

class TokenBucket {
private:
    double capacity;
    double refillRate;
    double tokens;
    std::chrono::steady_clock::time_point lastRefilled;
public:
    TokenBucket(double cap, double rate) : capacity(cap), refillRate(rate), tokens(cap), lastRefilled(std::chrono::steady_clock::now()) {}
    
    bool allowRequest(double tokensRequired) {
        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(now - lastRefilled).count();
        lastRefilled = now;
        
        tokens = std::min(capacity, tokens + elapsed * refillRate);
        if (tokens >= tokensRequired) {
            tokens -= tokensRequired;
            return true;
        }
        return false;
    }
};
`,
    'Fullstack Engineer': `// C++ Request Orchestrator Skeletons
#include <iostream>
#include <string>

// Implement timeout/retry orchestrator
`,
    'AI / ML Engineer': `// Cosine Similarity Ranker in C++
#include <iostream>
#include <vector>
#include <cmath>

double cosineSimilarity(const std::vector<double>& vecA, const std::vector<double>& vecB) {
    if (vecA.size() != vecB.size()) return 0.0;
    double dotProduct = 0.0, normA = 0.0, normB = 0.0;
    for (size_t i = 0; i < vecA.size(); ++i) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA == 0.0 || normB == 0.0) return 0.0;
    return dotProduct / (std::sqrt(normA) * std::sqrt(normB));
}
`
  },
  java: {
    ext: 'java',
    label: 'Java',
    'Frontend Engineer': `// Custom Event Emitter in Java
import java.util.*;

public class EventEmitter {
    // Skeletons
}
`,
    'Backend Engineer': `// TokenBucket Limiter in Java
import java.time.Instant;

public class TokenBucket {
    private final double capacity;
    private final double refillRate;
    private double tokens;
    private Instant lastRefilled;

    public TokenBucket(double capacity, double refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.tokens = capacity;
        this.lastRefilled = Instant.now();
    }

    public synchronized boolean allowRequest(double tokensRequired) {
        Instant now = Instant.now();
        double elapsed = java.time.Duration.between(lastRefilled, now).toNanos() / 1_000_000_000.0;
        lastRefilled = now;

        tokens = Math.min(capacity, tokens + elapsed * refillRate);

        if (tokens >= tokensRequired) {
            tokens -= tokensRequired;
            return true;
        }
        return false;
    }
}
`,
    'Fullstack Engineer': `// Java Retry Handler Skeletons
public class RetryHandler {
    // Skeletons
}
`,
    'AI / ML Engineer': `// Cosine Similarity Ranker in Java
public class SemanticRanker {
    public static double cosineSimilarity(double[] vecA, double[] vecB) {
        if (vecA.length != vecB.length) return 0.0;
        double dotProduct = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
`
  }
};
