const CACHE_NAME = 'nivra-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:wght@400;500;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - Always fetch fresh for HTML files
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Emergency alert received',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Alert',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NIVRA Safety Alert', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline emergency alerts
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-alert') {
    event.waitUntil(sendOfflineEmergencyAlert());
  }
});

async function sendOfflineEmergencyAlert() {
  try {
    const cache = await caches.open('nivra-offline-alerts');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const alertData = await response.json();
      
      // Try to send the alert
      const result = await fetch('/api/emergency/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${alertData.token}`
        },
        body: JSON.stringify(alertData.data)
      });
      
      if (result.ok) {
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('Failed to send offline emergency alert:', error);
  }
}