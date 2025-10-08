// service-worker.js
const CACHE_NAME = 'busnav-cache-v2'; // Increment version to ensure updates
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/service-worker-registration.js',
    // Leaflet assets
    'https://unpkg.com/leaflet/dist/leaflet.css',
    'https://unpkg.com/leaflet/dist/leaflet.js',
    // Font Awesome assets (you might need to get the actual font files too for full offline)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.ttf',
];

// Dummy data for offline routes - in a real app, this would be fetched from API
const offlineRoutesData = {
    'Route 101': {
        name: 'Route 101 - Downtown Express',
        stops: ['Main St & 1st Ave', 'Central Plaza', 'City Hall', 'Financial District', 'Waterfront Park'],
        schedule: 'Weekdays: 6 AM - 10 PM, every 15 mins. Weekends: 8 AM - 8 PM, every 30 mins.',
        polyline: [[34.0522, -118.2437],[34.055, -118.25], [34.06, -118.26], [34.065, -118.27]] // Example coordinates
    },
    'Route 202': {
        name: 'Route 202 - University Link',
        stops: ['Campus North', 'University Library', 'Student Union', 'Residential Towers', 'Metro Station East'],
        schedule: 'Weekdays: 7 AM - 11 PM, every 10 mins. Weekends: 9 AM - 9 PM, every 20 mins.',
        polyline: [[34.07, -118.27],[34.075, -118.28], [34.08, -118.29], [34.085, -118.30]] // Example coordinates
    }
};


self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Activates the new service worker immediately
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Takes control of pages immediately
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the request.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    (fetchResponse) => {
                        // Check if we received a valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream and
                        // can only be consumed once. Since we are consuming this
                        // once by cache and once by the browser for fetch, we need
                        // to clone the response.
                        const responseToCache = fetchResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    }
                ).catch(() => {
                    // Fallback for offline if fetch fails, e.g., show an offline page
                    if (event.request.mode === 'navigate') {
                        // You could return a specific offline.html page here
                        // For simplicity, we'll just return a generic response or an image
                        console.log('Offline: Navigation request failed, serving fallback.');
                        return new Response('<h1>You are offline</h1><p>Please check your internet connection.</p>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    }
                    // For other requests (e.g., images), you could return a placeholder
                    return new Response(null, { status: 503, statusText: 'Service Unavailable (Offline)' });
                });
            })
    );
});

// Listener to handle messages from the main thread (for saving specific routes)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SAVE_ROUTE_FOR_OFFLINE') {
        const routeId = event.data.routeId;
        const routeData = offlineRoutesData[routeId]; // Get dummy data

        if (routeData) {
            caches.open(CACHE_NAME).then(cache => {
                // Simulate storing route data (e.g., as JSON in cache)
                const routeUrl = `/offline-route-data/${routeId}.json`;
                cache.put(routeUrl, new Response(JSON.stringify(routeData), {
                    headers: { 'Content-Type': 'application/json' }
                }));
                console.log(`Route ${routeId} saved for offline.`);
                event.source.postMessage({ type: 'ROUTE_SAVED_SUCCESS', routeId: routeId });
            });
        }
    }
});