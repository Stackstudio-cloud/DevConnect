// DevMatch PWA Service Worker
const CACHE_NAME = 'devmatch-v1.0.0';
const STATIC_CACHE = 'devmatch-static-v1.0.0';
const DYNAMIC_CACHE = 'devmatch-dynamic-v1.0.0';

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Network-first resources (dynamic content)
const DYNAMIC_ROUTES = [
  '/api/auth/user',
  '/api/profiles',
  '/api/matches',
  '/api/messages',
  '/api/projects',
  '/api/teams',
  '/api/freelance-jobs',
  '/api/ai/recommendations'
];

// Cache-first resources (static assets)
const CACHE_FIRST_ROUTES = [
  '/assets/',
  '/icons/',
  '/_app/',
  '/static/'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Only handle GET requests
  if (method !== 'GET') return;
  
  // Handle different types of requests with appropriate strategies
  if (url.includes('/api/')) {
    // Network-first strategy for API calls
    event.respondWith(networkFirstStrategy(request));
  } else if (CACHE_FIRST_ROUTES.some(route => url.includes(route))) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Stale-while-revalidate for pages
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network-first strategy (for dynamic API data)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'You are currently offline. Some features may not be available.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch asset:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Stale-while-revalidate strategy (for pages)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  return cachedResponse || await networkResponsePromise || new Response(
    '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>DevMatch will work when you reconnect.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(syncFailedRequests());
  }
});

// Handle background sync of failed requests
async function syncFailedRequests() {
  const cache = await caches.open('failed-requests');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
        console.log('Synced failed request:', request.url);
      }
    } catch (error) {
      console.log('Still cannot sync:', request.url);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: data.tag || 'devmatch-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'DevMatch', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('devmatch') && 'focus' in client) {
            if (action === 'view' && data.url) {
              client.navigate(data.url);
            }
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          const targetUrl = action === 'view' && data.url ? data.url : '/';
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache management utilities
self.addEventListener('message', async (event) => {
  if (event.data.type === 'CACHE_MANAGEMENT') {
    const { action, data } = event.data;
    
    switch (action) {
      case 'CLEAR_CACHE':
        await clearAllCaches();
        event.ports[0].postMessage({ success: true });
        break;
        
      case 'CACHE_SIZE':
        const size = await getCacheSize();
        event.ports[0].postMessage({ size });
        break;
        
      case 'PREFETCH_RESOURCES':
        await prefetchResources(data.urls);
        event.ports[0].postMessage({ success: true });
        break;
    }
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

async function prefetchResources(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.log('Failed to prefetch:', url);
      }
    })
  );
}