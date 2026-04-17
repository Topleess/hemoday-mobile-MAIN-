// HemoDay Service Worker for Push Notifications

const CACHE_NAME = 'hemoday-v2';

// Install event — force immediate activation
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event — clear all old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => clients.claim())
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Focus existing window if available
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window if no existing one
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Handle scheduled notification messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, delay, tag } = event.data;

        setTimeout(() => {
            self.registration.showNotification(title, {
                body: body,
                icon: '/web-app-manifest-192x192.png',
                badge: '/favicon-96x96.png',
                tag: tag || 'hemoday-reminder',
                vibrate: [200, 100, 200],
                requireInteraction: true,
                data: {
                    url: '/',
                    timestamp: Date.now()
                }
            });
        }, delay || 0);
    }

    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, tag } = event.data;
        self.registration.showNotification(title, {
            body: body,
            icon: '/web-app-manifest-192x192.png',
            badge: '/favicon-96x96.png',
            tag: tag || 'hemoday-reminder',
            vibrate: [200, 100, 200],
            data: {
                url: '/',
                timestamp: Date.now()
            }
        });
    }
});
