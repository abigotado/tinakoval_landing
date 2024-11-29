'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter.js": "f393d3c16b631f36852323de8e583132",
"main.dart.js": "cd03dae8672c5ad898cdc5ce7a9bae4e",
"splash/img/light-3x.png": "e57c2af7ed2935df90f5d6eaf53686d8",
"splash/img/light-1x.png": "62dd1007c6183c253998c2cf8a8767ef",
"splash/img/light-2x.gif": "e5307516e4f83ffaf040374b8f43e673",
"splash/img/light-2x.png": "207591db1cf4f53dec4e6d1162cc6b53",
"splash/img/light-1x.gif": "4594e93de81f96068e74ba5165c67060",
"splash/img/dark-3x.png": "e57c2af7ed2935df90f5d6eaf53686d8",
"splash/img/dark-1x.gif": "4594e93de81f96068e74ba5165c67060",
"splash/img/dark-3x.gif": "9f05288a49c7e4f3b34e555d02ff6c0e",
"splash/img/dark-1x.png": "62dd1007c6183c253998c2cf8a8767ef",
"splash/img/light-4x.gif": "ec72a2c5c4bedff245a02916a910286a",
"splash/img/dark-4x.gif": "ec72a2c5c4bedff245a02916a910286a",
"splash/img/dark-4x.png": "10883a5a0575437724ac9202a0aa8651",
"splash/img/dark-2x.gif": "e5307516e4f83ffaf040374b8f43e673",
"splash/img/light-4x.png": "10883a5a0575437724ac9202a0aa8651",
"splash/img/dark-2x.png": "207591db1cf4f53dec4e6d1162cc6b53",
"splash/img/light-3x.gif": "9f05288a49c7e4f3b34e555d02ff6c0e",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin": "d62509b11c99e1b20b4fd3bf08d3ab5c",
"assets/fonts/MaterialIcons-Regular.otf": "8ea08ea2444cc58ec5807fd7669e488f",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "e986ebe42ef785b27164c36a9abc7818",
"assets/assets/images/logos/logo.gif": "0387aef306e4c6169f3c8ca82dbd35a2",
"assets/assets/images/logos/logo_mono.png": "4663e0d690e8975537b8e7bb24b54cfa",
"assets/assets/images/logos/72fef371-33f1-4b99-896f-bf9d5f13d46d.gif": "62d03e2965114fb0bce695e47495b00d",
"assets/assets/images/logos/logo.png": "d03bf09304b107c03ac3cb13ed730fca",
"assets/assets/lotties/logos/logo.json": "39b2e68a10d3bab60b216e07c7bb2405",
"assets/assets/svg/logos/logo_mono.svg": "1e8ddd3579b84b6809630913b4a34ef1",
"assets/assets/svg/logos/logo.svg": "a83a0e690a932f9f9469498388dfe251",
"assets/NOTICES": "e7ee1e4356a9b62e739bbfbb9766e5ea",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.json": "81ffbd84b21b757df9d6800585fed3f6",
"assets/AssetManifest.bin.json": "b2ae1e8010bf3459b26cfe055d65c51a",
"index.html": "3f1ea6e5bcbfdd08a3d88bb22f51a15e",
"/": "3f1ea6e5bcbfdd08a3d88bb22f51a15e",
"manifest.json": "b88be11552a8c16c06900e677e43bf90",
"canvaskit/canvaskit.js": "66177750aff65a66cb07bb44b8c6422b",
"canvaskit/canvaskit.js.symbols": "48c83a2ce573d9692e8d970e288d75f7",
"canvaskit/chromium/canvaskit.js": "671c6b4f8fcc199dcc551c7bb125f239",
"canvaskit/chromium/canvaskit.js.symbols": "a012ed99ccba193cf96bb2643003f6fc",
"canvaskit/chromium/canvaskit.wasm": "b1ac05b29c127d86df4bcfbf50dd902a",
"canvaskit/skwasm.js": "694fda5704053957c2594de355805228",
"canvaskit/skwasm.js.symbols": "262f4827a1317abb59d71d6c587a93e2",
"canvaskit/canvaskit.wasm": "1f237a213d7370cf95f443d896176460",
"canvaskit/skwasm.wasm": "9f0c0c02b82a910d12ce0543ec130e60",
"canvaskit/skwasm.worker.js": "89990e8c92bcb123999aa81f7e203b1c",
"icons/Icon-maskable-192.png": "b6793980f19abd1f13eed26aa9c28c47",
"icons/Icon-192.png": "b6793980f19abd1f13eed26aa9c28c47",
"icons/Icon-512.png": "a733803e392f66f181c4828dcfec0086",
"icons/Icon-maskable-512.png": "a733803e392f66f181c4828dcfec0086",
"favicon.png": "6fe29288d93a687681fad022d310575d",
"version.json": "ee68c6ea710119b157099c099afac7ac",
"flutter_bootstrap.js": "bbe66960fff9dc35b6fb1b39aeb45669"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
