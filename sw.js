// Athos V34 FINAL — Service Worker leve para GitHub Pages.
// Objetivo: evitar cache fantasma durante desenvolvimento e manter o app sempre fresco.
const CACHE_VERSION = 'athos-v34-final-no-cache';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => /athos|otto/i.test(key) && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isCore = /\/(index\.html|app\.js|style\.css|manifest\.webmanifest|sw\.js)$/.test(url.pathname);

  if (isCore) {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(req)));
  }
});
