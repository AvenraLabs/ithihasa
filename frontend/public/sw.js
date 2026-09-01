// Lightweight Service Worker for PWA App Installation
// Pure network-only passthrough without offline caching

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Direct network-only fetch (no offline cache)
  event.respondWith(fetch(event.request));
});
