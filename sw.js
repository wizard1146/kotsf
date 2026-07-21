// sw.js — service worker for the KOTSF web build. Precaches the app shell so the
// game loads and plays fully offline (saves already live in localStorage); other
// assets (icons, fonts, gifs) are cached at runtime on first fetch.
// Bump CACHE when the shell changes to roll users onto the new version.
const CACHE = 'kotsf-v17';

// Resolve every path against the worker's own directory so the app works whether
// it is served from a domain root or a project subpath (e.g. /kotsf/).
const BASE = new URL('./', self.location).href;
const CORE = [
  '', 'index.html',
  'src/main.js',
  'src/ui/view.js', 'src/ui/styles.css',
  'src/engine/state.js', 'src/engine/conditions.js', 'src/engine/effects.js',
  'src/engine/selector.js', 'src/engine/resolver.js', 'src/engine/loop.js', 'src/engine/save.js',
  'content/bundle.json',
  'manifest.webmanifest',
  'assets/splash.png',
  'assets/icons/pwa-192.png', 'assets/icons/pwa-512.png',
  'assets/portraits/portrait_placeholder.svg',
].map((p) => new URL(p, BASE).href);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  // Page loads: try the network, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    e.respondWith(fetch(request).catch(() => caches.match(new URL('index.html', BASE).href)));
    return;
  }

  // Everything else (scripts, styles, assets, fonts): cache-first, then network,
  // caching whatever comes back (including opaque cross-origin font responses).
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      const copy = res.clone();
      if (res.ok || res.type === 'opaque') {
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => cached))
  );
});
