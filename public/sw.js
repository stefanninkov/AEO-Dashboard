const CACHE_VERSION = 'aeo-v3'
const STATIC_CACHE = CACHE_VERSION + '-static'
const RUNTIME_CACHE = CACHE_VERSION + '-runtime'

const PRECACHE_URLS = [
  '/AEO-Dashboard/',
  '/AEO-Dashboard/index.html',
  '/AEO-Dashboard/icon-192.svg',
  '/AEO-Dashboard/icon-512.svg',
]

// Install — cache app shell
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_URLS)
    }).then(function () {
      return self.skipWaiting()
    })
  )
})

// Activate — clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) {
            return name.startsWith('aeo-') && name !== STATIC_CACHE && name !== RUNTIME_CACHE
          })
          .map(function (name) {
            return caches.delete(name)
          })
      )
    }).then(function () {
      return self.clients.claim()
    })
  )
})

// Fetch — intelligent caching strategy per resource type
self.addEventListener('fetch', function (event) {
  var request = event.request
  var url = new URL(request.url)

  // Skip non-GET
  if (request.method !== 'GET') return

  // ── Vite hashed assets (immutable) — cache-first, never re-fetch ──
  // These have content-hash filenames; new builds produce new filenames
  if (url.origin === location.origin && url.pathname.indexOf('/assets/') !== -1) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(request).then(function (cached) {
          if (cached) return cached
          return fetch(request).then(function (response) {
            if (response && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
        })
      })
    )
    return
  }

  // ── Google Fonts — cache-first with long TTL ──
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(request).then(function (cached) {
          if (cached) return cached
          return fetch(request).then(function (response) {
            if (response && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
        })
      })
    )
    return
  }

  // ── Skip Firebase and other external APIs ──
  if (url.origin !== location.origin) return

  // ── App shell and other same-origin — network-first with cache fallback ──
  event.respondWith(
    fetch(request)
      .then(function (response) {
        if (response && response.status === 200) {
          var clone = response.clone()
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(request, clone)
          })
        }
        return response
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          if (cached) return cached
          // Fallback to app shell for navigation requests
          if (request.headers.get('accept') && request.headers.get('accept').indexOf('text/html') !== -1) {
            return caches.match('/AEO-Dashboard/index.html')
          }
        })
      })
  )
})
