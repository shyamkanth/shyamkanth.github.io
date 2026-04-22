const CACHE_NAME = "kinetic-actions-v5";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./assets/css/main.css",
  "./assets/js/storage.js",
  "./assets/js/activity.js",
  "./assets/js/app.js",
  "./assets/js/views.js",
  "./assets/js/ui.js",
  "./manifest.json",
  "./assets/icons/icon.svg",
  "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
  "https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css",
  "https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js",
];

self.addEventListener("install", (event) => {
  // Skip waiting allows the new service worker to take over immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  // Network First strategy
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
