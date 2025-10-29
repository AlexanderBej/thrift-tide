/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// CRA + Workbox recipes
import { cacheNames, clientsClaim, RouteHandlerCallbackOptions } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// __WB_MANIFEST is injected at build time by CRA
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// App-shell navigations → network first, fall back to cache
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 4,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// Static assets (JS/CSS/workers)
registerRoute(
  ({ request }) => ['script', 'style', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: 'static-assets' }),
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 30 * 24 * 3600 }),
    ],
  }),
);

// APIs (adjust for your backend/Firestore/Functions)
registerRoute(
  ({ url }) => url.origin.includes('googleapis.com') || url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    networkTimeoutSeconds: 6,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// Default handler (optional)
setDefaultHandler(new StaleWhileRevalidate());

// Offline fallback for navigations (optional)
setCatchHandler(async (opts: RouteHandlerCallbackOptions): Promise<Response> => {
  const { request } = opts; // <-- use this, not event.request

  // Only handle document navigations here
  if (request?.destination === 'document') {
    const cache = await caches.open(cacheNames.precache);
    const offline = (await cache.match('/offline.html')) ?? (await cache.match('/index.html'));

    return (
      offline ??
      new Response('<h1>Offline</h1><p>Please reconnect.</p>', {
        headers: { 'Content-Type': 'text/html' },
        status: 503,
      })
    );
  }

  // For non-document requests, return a concrete Response
  return Response.error();
});
