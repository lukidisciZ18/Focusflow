// FocusFlow Enhanced Service Worker

const CACHE_NAME = 'focusflow-v2';
const STATIC_CACHE = 'focusflow-static-v2';
const DYNAMIC_CACHE = 'focusflow-dynamic-v2';
const API_CACHE = 'focusflow-api-v2';

// Core app files to cache
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/darkMode.js',
    '/manifest.json',
    '/api-mock.js'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest/dist/umd/lucide.js'
];

// Install event - cache core resources
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            }),
            // Cache external resources
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('Caching external resources');
                return cache.addAll(EXTERNAL_RESOURCES);
            })
        ]).then(() => {
            console.log('Service Worker installed successfully');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker activated successfully');
        })
    );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests
    if (url.origin === location.origin) {
        // Same-origin requests
        event.respondWith(handleSameOriginRequest(request));
    } else if (url.origin === 'https://fonts.googleapis.com' || 
               url.origin === 'https://cdn.tailwindcss.com' ||
               url.origin === 'https://unpkg.com') {
        // External resources
        event.respondWith(handleExternalResource(request));
    } else {
        // API requests
        event.respondWith(handleApiRequest(request));
    }
});

// Handle same-origin requests (static files)
async function handleSameOriginRequest(request) {
    try {
        // Try network first, fallback to cache
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Return offline page if available
        return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
}

// Handle external resources
async function handleExternalResource(request) {
    try {
        // Try cache first, then network
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Handle API requests
async function handleApiRequest(request) {
    try {
        // Network first for API requests
        const networkResponse = await fetch(request);
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        // Fallback to cache for API requests
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Return offline data if available
        return new Response(JSON.stringify({ offline: true, message: 'No internet connection' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Background sync for offline functionality
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'focus-session-sync') {
        event.waitUntil(syncFocusSessions());
    } else if (event.tag === 'user-preferences-sync') {
        event.waitUntil(syncUserPreferences());
    }
});

// Sync focus sessions when online
async function syncFocusSessions() {
    try {
        const focusSessions = await getStoredFocusSessions();
        if (focusSessions.length > 0) {
            // Send to server when online
            const response = await fetch('/api/focus-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(focusSessions)
            });
            
            if (response.ok) {
                // Clear local storage after successful sync
                localStorage.removeItem('focusflow_pending_sessions');
                console.log('Focus sessions synced successfully');
            }
        }
    } catch (error) {
        console.error('Failed to sync focus sessions:', error);
    }
}

// Sync user preferences when online
async function syncUserPreferences() {
    try {
        const preferences = localStorage.getItem('focusflow_user_preferences');
        if (preferences) {
            const response = await fetch('/api/user-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: preferences
            });
            
            if (response.ok) {
                console.log('User preferences synced successfully');
            }
        }
    } catch (error) {
        console.error('Failed to sync user preferences:', error);
    }
}

// Get stored focus sessions from IndexedDB
async function getStoredFocusSessions() {
    // This would typically use IndexedDB
    // For now, return from localStorage
    const sessions = localStorage.getItem('focusflow_pending_sessions');
    return sessions ? JSON.parse(sessions) : [];
}

// Push notifications for focus reminders
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    let notificationData = {
        title: 'FocusFlow',
        body: 'Time to focus!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'start-session',
                title: 'Start Session',
                icon: '/icon-192x192.png'
            },
            {
                action: 'snooze',
                title: 'Snooze 5min',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ],
        requireInteraction: true,
        tag: 'focus-reminder'
    };

    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
        } catch (error) {
            console.error('Failed to parse push data:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    event.notification.close();

    switch (event.action) {
        case 'start-session':
            event.waitUntil(
                clients.openWindow('/?action=start-session')
            );
            break;
        case 'snooze':
            event.waitUntil(
                scheduleSnoozeNotification()
            );
            break;
        default:
            event.waitUntil(
                clients.openWindow('/')
            );
    }
});

// Schedule snooze notification
async function scheduleSnoozeNotification() {
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    // Schedule a new notification
    await self.registration.showNotification('FocusFlow', {
        title: 'Focus Reminder',
        body: 'Time to focus! (Snoozed)',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'focus-reminder-snooze',
        requireInteraction: true,
        actions: [
            {
                action: 'start-session',
                title: 'Start Session',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    });
}

// Handle notification close
self.addEventListener('notificationclose', event => {
    console.log('Notification closed:', event.notification.tag);
    // Could track analytics here
});

// Message handling for communication with main app
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
        case 'CACHE_DATA':
            cacheUserData(event.data.data);
            break;
        case 'REQUEST_SYNC':
            requestBackgroundSync(event.data.tag);
            break;
    }
});

// Cache user data
async function cacheUserData(data) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const response = new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put('/user-data', response);
        console.log('User data cached successfully');
    } catch (error) {
        console.error('Failed to cache user data:', error);
    }
}

// Request background sync
async function requestBackgroundSync(tag) {
    try {
        const registration = await self.registration;
        await registration.sync.register(tag);
        console.log('Background sync requested for:', tag);
    } catch (error) {
        console.error('Failed to request background sync:', error);
    }
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', event => {
        console.log('Periodic sync triggered:', event.tag);
        
        if (event.tag === 'focus-stats-sync') {
            event.waitUntil(syncFocusStats());
        }
    });
}

// Sync focus statistics
async function syncFocusStats() {
    try {
        const stats = localStorage.getItem('focusflow_stats');
        if (stats) {
            const response = await fetch('/api/focus-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: stats
            });
            
            if (response.ok) {
                console.log('Focus stats synced successfully');
            }
        }
    } catch (error) {
        console.error('Failed to sync focus stats:', error);
    }
}

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
}); 