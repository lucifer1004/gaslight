self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('myCache').then(cache => {
      return cache.addAll([
        '/css/styles.css',
        '/data',
        '/img',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/index.html',
        '/restaurant.html',
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.js',
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.css',
        'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
      ])
    }),
  )
})

self.addEventListener('activate', event => {
  const expectedCacheNames = Object.values('myCache')

  // Active worker won't be treated as activated until promise
  // resolves successfully.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!expectedCacheNames.includes(cacheName)) {
            console.log('Deleting out of date cache:', cacheName)

            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

self.addEventListener('fetch', event => {
  console.log('Handling fetch event for', event.request.url)

  event.respondWith(
    caches.open('myCache').then(cache => {
      return cache
        .match(event.request)
        .then(response => {
          if (response) {
            console.log('Found response in cache:', response)

            return response
          }

          console.log('Fetching request from the network:', event.request)

          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone())

            return networkResponse
          })
        })
        .catch(error => {
          // Handles exceptions that arise from match() or fetch().
          console.error('Error in fetch handler:', error)

          throw error
        })
    }),
  )
})
