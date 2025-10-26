/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
/* eslint-env serviceworker */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('tt-v1')
      .then((cache) => cache.addAll(['/', '/index.html', '/manifest.webmanifest'])),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)));
});
