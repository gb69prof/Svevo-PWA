
const CACHE_VERSION = 'svevo-pwa-v1';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const OFFLINE_URL = './offline.html';
const PRECACHE_URLS = ["index.html", "offline.html", "romanzo.html", "verita.html", "tre-giudizi.html", "zeno-padre.html", "complessita.html", "funerale-lapsus.html", "inetto.html", "deflagrazione.html", "poetica.html", "svevo-pirandello.html", "manifest.json", "assets/css/styles.css", "assets/js/pwa.js", "assets/images/romanzo.webp", "assets/images/verita.webp", "assets/images/tre-giudizi.webp", "assets/images/zeno-padre.webp", "assets/images/complessita.webp", "assets/images/funerale.webp", "assets/images/inetto.webp", "assets/images/deflagrazione.webp", "assets/images/poetica.webp", "assets/images/svevo-pirandello.webp", "assets/images/cover.webp", "assets/icons/icon-180.png", "assets/icons/icon-192.png", "assets/icons/icon-512.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => ![SHELL_CACHE, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

const isStaticAsset = (request) => {
  return ['style','script','image','font'].includes(request.destination) || /\.(?:png|jpg|jpeg|webp|svg|gif|woff2?|ttf|eot|pdf|glb|gltf)$/i.test(new URL(request.url).pathname);
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match(request);
        return cached || caches.match(OFFLINE_URL);
      }
    })());
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
        return response;
      } catch (err) {
        return cached || Response.error();
      }
    })());
  }
});
