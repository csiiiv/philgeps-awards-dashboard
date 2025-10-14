// Simple service worker for PhilGEPS Dashboard
// This provides basic caching and offline functionality

const CACHE_NAME = 'philgeps-dashboard-v1';
const urlsToCache = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
// NOTE: Avoid intercepting cross-origin requests or non-GETs (APIs / streaming responses)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Don't handle cross-origin requests (let browser or page code deal with APIs/streams)
  if (url.origin !== self.location.origin) {
    return; // fall back to network for cross-origin
  }

  // Only handle GET requests
  if (req.method !== 'GET') {
    return; // do not intercept POST/PUT/DELETE or other methods
  }

  // For navigation requests, try network first then fall back to cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((networkResponse) => {
        return networkResponse;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  // For same-origin GET requests (static assets), serve from cache if available
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      // Network fetch with error handling; do not attempt to stream-manipulate the response
      return fetch(req).catch(() => {
        // If offline and asset not cached, return a generic fallback if available
        return caches.match('/');
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});