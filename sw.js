const CACHE_NAME = "wc2026-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./manifest.json"
];

// Install Event - cache core app shell assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first, falling back to cache if offline
self.addEventListener("fetch", (e) => {
  // Only handle standard GET requests
  if (e.request.method !== "GET" || e.request.url.startsWith("chrome-extension")) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clone and cache the successful request
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(e.request);
      })
  );
});

// Push Event - Handle incoming Web Push Notifications
self.addEventListener("push", (e) => {
  let data = { title: "World Cup 2026", body: "New update available!" };
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data = { title: "World Cup 2026", body: e.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "./favicon.svg",
    badge: "./favicon.svg",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "./"
    }
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const urlToOpen = e.notification.data.url;
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
