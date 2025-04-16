self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("pinkstream-v1").then(cache =>
      cache.addAll(["index.html", "styles.css", "scripts.js"])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
