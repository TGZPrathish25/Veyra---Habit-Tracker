/**
 * Veyra Service Worker — Offline shell caching and network-first asset strategy.
 */

const CACHE_NAME = 'veyra-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/logo-veyra.svg',
];

// Install: cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip API or socket requests
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/socket.io/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for static assets
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.includes('/assets/') || event.request.destination === 'style' || event.request.destination === 'script')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fall back to cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests, fallback to index.html (SPA offline routing)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }

        return new Response('Offline and resource not cached.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        });
      })
  );
});
