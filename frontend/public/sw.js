// YĀTRĀ Service Worker — Production PWA
// Strategy: Cache-First for static assets, Network-First for API/pages
// Bump CACHE_VERSION whenever assets change to force refresh.

const CACHE_VERSION = 'yatra-v3';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/offline',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// ─── Install: pre-cache all static assets ────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      // Cache each asset individually to avoid one failure breaking the whole install
      return Promise.all(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[SW] Failed to cache ${asset}:`, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: delete outdated caches ────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch strategy ───────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and SSE streams
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.pathname.includes('/stream')) return; // Never cache SSE

  // API calls: Network-First, fallback to cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('localhost:5000')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets (JS, CSS, fonts, images): Cache-First
  if (
    request.destination === 'script' ||
    request.destination === 'style'  ||
    request.destination === 'font'   ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML navigation: Network-First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/offline') || caches.match('/'))
    );
    return;
  }

  // Default: try cache then network
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ─── Strategy helpers ─────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline');
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ message: 'Offline — cached data unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
