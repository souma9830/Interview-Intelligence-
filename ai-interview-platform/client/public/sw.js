const CACHE_PREFIX = 'camsense';
const CACHE_STATIC = `${CACHE_PREFIX}-static-v2`;
const CACHE_API = `${CACHE_PREFIX}-api-v2`;
const CACHE_DYNAMIC = `${CACHE_PREFIX}-dynamic-v2`;

const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.add(OFFLINE_URL).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && !name.endsWith('-v2'))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithQueue(request));
    return;
  }

  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((names) => {
      return Promise.all(names.filter((n) => n.startsWith(CACHE_PREFIX)).map((n) => caches.delete(n)));
    });
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}

async function networkFirstWithQueue(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_API);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.postMessage({
          type: 'QUEUE_OFFLINE_REQUEST',
          url: request.url,
          method: request.method,
          headers: Array.from(request.headers.entries()),
        });
      }
    } catch {}
    return new Response(JSON.stringify({
      success: false,
      message: 'You are offline. Request queued for retry.',
      offline: true,
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
