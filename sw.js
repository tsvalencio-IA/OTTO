// Athos V31 — service worker leve, sem cache agressivo para evitar versão velha no GitHub Pages.
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
