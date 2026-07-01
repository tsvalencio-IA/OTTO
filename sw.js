const CACHE_NAME = 'athos-ar-otto-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icons/favicon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './moldes/modelo_referencia.png',
  './moldes/athos_moldes_caneta_3d.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // O modelo 3D fica em rede primeiro para facilitar substituir o athos.glb no GitHub sem prender cache antigo.
  if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.usdz')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      }
      return res;
    }).catch(() => cached))
  );
});
