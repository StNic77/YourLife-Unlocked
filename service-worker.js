const CACHE_NAME = 'ylu-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/global.css',
  '/js/main.js',
  '/js/welcome.js',
  '/js/gallery.js',
  '/js/transitions.js',
  '/js/store.js',
  '/js/api.js',
  '/data/worlds.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.url.includes('/images/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const fetched = fetch(request).then(res => {
            cache.put(request, res.clone());
            return res;
          });
          return cached || fetched;
        })
      )
    );
    return;
  }

  if (request.url.includes('api.anthropic.com')) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});

// Nudge delivery — stub for future offline notification support
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Your Life', {
      body: data.body || '',
      icon: '/images/icon-192.png',
      badge: '/images/badge-72.png',
      tag: data.tag || 'ylu-nudge',
      data: data,
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('/');
    })
  );
});
