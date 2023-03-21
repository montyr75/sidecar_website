'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "809b8ce7e5b5c60715f357c4c6d38c01",
"assets/assets/fonts/audiowide/Audiowide-Regular.ttf": "1035cee07ce8ec16a4e4f193517f1c4a",
"assets/assets/fonts/Blazed.ttf": "ef6090bc175a4e875da805e8dc25e248",
"assets/assets/fonts/Facon.ttf": "b6d3c75722af4490900128147524d7d4",
"assets/assets/images/car.png": "774723700a19a901c07c311a642fd9d5",
"assets/assets/images/chopshop1.png": "f353330ba45bda079dee5335a265aed2",
"assets/assets/images/flame_fire_wheel.png": "542a8f904cae2d4418e2d23e5b649327",
"assets/assets/images/icons/ace.png": "c6d7cee7b07aed7b88919e7664362899",
"assets/assets/images/icons/bang.png": "028b8a1e8a43e840097cd578911563ac",
"assets/assets/images/icons/dice.png": "8b910b9ff1b1758fcf9871d0f2d292c0",
"assets/assets/images/icons/explosion.png": "e9931fb4183db504315ebf83fba4626f",
"assets/assets/images/icons/fire.png": "cd53c5eeba8becb9e729d4a6291dc969",
"assets/assets/images/icons/paintbrush.png": "d722d4877abedd2ced3b0f81d712a541",
"assets/assets/images/icons/power_plant.png": "254400dedd5f5d7ec501545434ed43fe",
"assets/assets/images/icons/skidding.png": "9bb2a7e11e6852dd9653f6550153d3f3",
"assets/assets/images/icons/speed.png": "09a42986fa482e68dee5de520540668a",
"assets/assets/images/icons/star.png": "8c6fbf5557acc17c6636de62c4aa83e5",
"assets/assets/images/icons/tire.png": "30eb0395e46edadbb769583e02025397",
"assets/assets/images/icons/wrenches.png": "fc133326e07f36ca3fb114df3035f8be",
"assets/FontManifest.json": "2417f325b1befc9b5503ad602a1eba4e",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/NOTICES": "9bfaa21804f6f5dc01d8ae8d0e494a97",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"favicon.png": "0871c3023734eb67df2dc14215cc591d",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"icons/Icon-192.png": "54d15f66979d71ea4c06b9f9837a9b24",
"icons/Icon-512.png": "93e524fecb688667a3ae72921444f252",
"icons/Icon-maskable-192.png": "54d15f66979d71ea4c06b9f9837a9b24",
"icons/Icon-maskable-512.png": "93e524fecb688667a3ae72921444f252",
"index.html": "87ff04ff3a97c706515b3fd08198d863",
"/": "87ff04ff3a97c706515b3fd08198d863",
"main.dart.js": "01518577dda7d5eafb58fa65b6ebe146",
"manifest.json": "1b64ce192db7abab5972946023dd3908",
"version.json": "b13f96c7718d609efcf6d50e97279554"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
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
