// Basic offline-first cache for PWA
const CACHE = "mtt-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Network-first for APIs; cache-first for same-origin assets
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(
        (res) =>
          res ||
          fetch(e.request).then((r) => {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
            return r;
          })
      )
    );
  } else {
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
  }
});

// To enable push notifications, wire a push subscription here (requires server to send pushes).
