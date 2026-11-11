/* app/sw.js (11 Nov 2026)
   Keeps the Airshow Hub app's own files on the phone so it opens quickly and still shows its
   screens without a signal. Pages are always fetched fresh first and only fall back to the saved
   copy when offline. Only this site's own files are saved; the forum, hub and site data never are. */
var CACHE = "ukag-app-v1";
var SHELL = [
  "./", "index.html", "app.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/logo.png",
  "../hub-img/hawk-hud.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("ukag-app-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.indexOf("/airshow-pages/app/") !== 0 && url.pathname !== "/airshow-pages/hub-img/hawk-hud.png") return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match("index.html"); });
    })
  );
});
