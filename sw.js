const CACHE_NAME = 'hfn-partner-v2';

// The essential files to cache for offline viewing
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/firebase-config.js',
    '/manifest.json'
];

// Install Event: Save files to the phone's cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Fetch Event: Serve cached files if offline
self.addEventListener('fetch', (event) => {
    // Only cache GET requests (we don't want to cache the POST requests sent to the AI)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return the cached file if found, otherwise go to the network
            return cachedResponse || fetch(event.request);
        })
    );
});

// Activate Event: Clean up old caches if you push an update
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
