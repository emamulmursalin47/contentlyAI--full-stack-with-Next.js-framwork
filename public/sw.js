// Service Worker for ContentlyAI
// Helps with back/forward cache restoration and offline functionality

const CACHE_NAME = 'contentlyai-v1';
const STATIC_CACHE_NAME = 'contentlyai-static-v1';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/login',
  '/register',
  '/chat',
  '/favicon.ico',
  // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests (let them go to network)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  // Network first strategy for dynamic content
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request);
      })
  );
});

// Handle page visibility changes for better back/forward cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Optimize for back/forward cache
self.addEventListener('pageshow', (event) => {
  // Handle page restoration from back/forward cache
  if (event.persisted) {
    // Page was restored from cache
    console.log('Page restored from back/forward cache');
  }
});

// Clean up resources when page is hidden
self.addEventListener('pagehide', (event) => {
  // Clean up any ongoing operations
  // This helps with back/forward cache eligibility
});

// Handle beforeunload for better cache restoration
self.addEventListener('beforeunload', (event) => {
  // Ensure clean state for back/forward cache
});
