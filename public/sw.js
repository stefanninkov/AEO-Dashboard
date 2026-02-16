const CACHE_VERSION = 'aeo-v2'
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

// Fetch — network-first with cache fallback
self.addEventListener('fetch', function (event) {
  var request = event.request
  var url = new URL(request.url)

  // Skip non-GET
  if (request.method !== 'GET') return

  // Skip external domains (APIs, fonts, Firebase)
  if (url.origin !== location.origin) return

  // Skip Vite hashed assets — they have unique names per build
  if (url.pathname.indexOf('/assets/') !== -1) {
    return
  }

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
