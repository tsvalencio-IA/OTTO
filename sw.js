// V25: service worker intencionalmente sem cache agressivo para evitar carregar versões antigas.
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
