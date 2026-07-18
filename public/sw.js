const CACHE_NAME = "18homes-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Parse request URL
  const url = new URL(event.request.url);

  // Skip cross-origin requests and API requests
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/")) return; // Next.js assets are handled by Next.js client-side router

  // Check if it's an HTML page/navigation request
  const isHtmlPage = event.request.mode === "navigate" || 
                     (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html"));

  if (isHtmlPage) {
    // Network First strategy for HTML/page requests:
    // Try to get fresh page from network, update cache if successful.
    // Fall back to cache if offline.
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match("/");
          });
        })
    );
  } else {
    // Cache First strategy for static assets (icons, images, styles, etc.):
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        });
      })
    );
  }
});
