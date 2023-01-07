# VUE PWA 

## 🥸 Vue PWA Config
:open_file_folder: vue.config.js
```js
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: "My App",
    themeColor: "#4DBA87",
    msTileColor: "#000000",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",

    // configure the workbox plugin
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: "./src/service-worker.js",
      // ...other Workbox options...
    },
  },
});

```
:open_file_folder: main.js
```js
import "./registerServiceWorker";
```

:open_file_folder: generated registerServiceWorker.js

(generated when creating vue project with register-service-worker config setting as true)
```js
/* eslint-disable no-console */

import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      );
    },
    registered() {
      console.log("Service worker has been registered.");
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound() {
      console.log("New content is downloading.");
    },
    updated() {
      console.log("New content is available; please refresh.");
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    },
  });
}
```

:open_file_folder: service-worker.js

```js
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


```



## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
