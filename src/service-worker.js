/* eslint-disable */
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

precacheAndRoute(self.__WB_MANIFEST);

const pagePlugin = {
  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
    // For a NetworkFirst strategy, the only time cachedResponseWillBeUsed is
    // called is if the network request failed, so you don't have to do
    // anything special to confirm that.

    console.log({ cachedResponse });
    const headers = new Headers(cachedResponse.headers);
    headers.set("X-Online", "false");

    const body = (await cachedResponse.text()) + "<script>const SW_OFFLINE = true;</script>";

    return new Response(body, { headers });
  },
};

const pageStrategy = new NetworkFirst({
  // Put all cached files in a cache named 'pages'
  cacheName: "pages",
  plugins: [
    // Only requests that return with a 200 status are cached
    new CacheableResponsePlugin({
      statuses: [200],
    }),
    pagePlugin,
  ],
});

// Cache page navigations (HTML) with a Cache First strategy
registerRoute(({ url }) => url.pathname.startsWith("/"), pageStrategy);

// Warm the cache when the service worker installs
self.addEventListener("install", (event) => {
  console.log(12);
  const files = ["/offline.html"]; // you can add more resources here
  event.waitUntil(self.caches.open("offline-fallbacks").then((cache) => cache.addAll(files)));
});

// Respond with the fallback if a route throws an error
setCatchHandler(async (options) => {
  console.log({ options });
  const destination = options.request.destination;
  const cache = await self.caches.open("pages");
  if (destination === "document") {
    return (await cache.match(options.url.pathname)) || Response.error();
  }
  return Response.error();
});
