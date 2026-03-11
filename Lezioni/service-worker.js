
const CACHE_NAME = 'svevo-pwa-v2';
const APP_SHELL = [
  "assets/css/styles.css",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/images/complessita.webp",
  "assets/images/cover-home.webp",
  "assets/images/deflagrazione.webp",
  "assets/images/funerale.webp",
  "assets/images/inetto.webp",
  "assets/images/poetica.webp",
  "assets/images/romanzo.webp",
  "assets/images/svevo-pirandello.webp",
  "assets/images/tre-giudizi.webp",
  "assets/images/verita.webp",
  "assets/images/zeno-padre.webp",
  "assets/js/site.js",
  "complessita.html",
  "deflagrazione.html",
  "funerale.html",
  "index.html",
  "inetto.html",
  "manifest.json",
  "offline.html",
  "poetica.html",
  "pwa.js",
  "romanzo.html",
  "svevo-pirandello.html",
  "tre-giudizi.html",
  "verita.html",
  "zeno-padre.html"
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navigation requests: network first, fallback to cache, then offline page
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        return cached || caches.match('offline.html');
      }
    })());
    return;
  }

  // Images/fonts/styles/scripts: stale-while-revalidate
  const dest = req.destination;
  if (['style','script','image','font'].includes(dest)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const networkFetch = fetch(req).then(resp => {
        if (resp && resp.status === 200) cache.put(req, resp.clone());
        return resp;
      }).catch(() => null);
      return cached || (await networkFetch) || Response.error();
    })());
    return;
  }

  // Default: cache first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).catch(() => caches.match('index.html')))
  );
});
