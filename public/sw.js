// Service Worker for Granalysis PWA
// Chrome-specific: Use versioned cache names to force updates
const CACHE_VERSION = Date.now();
const CACHE_NAME = `granalysis-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `granalysis-runtime-v${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls and external resources
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip ALL API endpoints - always fetch fresh from network
  // This includes: /auth, /files, /ai, /analytics, /api/*, etc.
  // Chrome is more aggressive with caching, so we need to be explicit
  if (url.pathname.startsWith('/auth') || 
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/files') ||
      url.pathname.startsWith('/ai') ||
      url.pathname.startsWith('/analytics') ||
      url.pathname.startsWith('/sharing') ||
      url.pathname.startsWith('/comments') ||
      url.pathname.startsWith('/webhooks') ||
      url.pathname.startsWith('/api-keys') ||
      url.pathname.startsWith('/scheduled-exports') ||
      url.pathname.startsWith('/integrations') ||
      url.pathname.startsWith('/sessions') ||
      url.pathname.startsWith('/monitoring') ||
      url.pathname.startsWith('/docs') ||
      url.pathname.startsWith('/health') ||
      url.pathname.startsWith('/metrics') ||
      url.pathname.startsWith('/data/') ||
      url.pathname.includes('/data/')) {
    // For API endpoints, always fetch from network and never cache
    // Chrome needs explicit network-only fetch
    event.respondWith(
      fetch(request, {
        cache: 'no-store',
        credentials: 'include',
      }).catch(() => {
        // If fetch fails, don't return cached version for API calls
        return new Response('Network error', { status: 503 });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If offline and no cache, return offline page
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-uploads') {
    event.waitUntil(syncUploads());
  }
});

async function syncUploads() {
  // Get pending uploads from IndexedDB
  // Upload them when back online
  console.log('[SW] Syncing pending uploads');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Granalysis';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.url || '/dashboard'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

