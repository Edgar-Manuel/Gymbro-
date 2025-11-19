// Service Worker para GymBro PWA
const CACHE_NAME = 'gymbro-v1';
const STATIC_CACHE = 'gymbro-static-v1';
const DYNAMIC_CACHE = 'gymbro-dynamic-v1';

// Archivos estáticos para cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Activar inmediatamente sin esperar
        return self.skipWaiting();
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Eliminar caches antiguas
              return name !== STATIC_CACHE &&
                     name !== DYNAMIC_CACHE &&
                     name.startsWith('gymbro-');
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Tomar control de todas las páginas
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no son HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ignorar requests a APIs externas (Appwrite, Groq)
  if (url.hostname !== self.location.hostname) {
    // Network only para APIs
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Si falla, intentar devolver respuesta de error
          return new Response(
            JSON.stringify({ error: 'Network error', offline: true }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Estrategia: Stale While Revalidate para assets estáticos
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              // Actualizar cache con la nueva respuesta
              if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseToCache));
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // Estrategia: Network First para documentos HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear la respuesta
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => {
          // Si no hay red, buscar en cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback a la página principal
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => cache.put(request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// Background Sync (para sincronizar datos offline)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-workouts') {
    event.waitUntil(
      // Aquí se implementaría la sincronización de workouts
      Promise.resolve()
    );
  }
});

// Push Notifications (preparado para futuro)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva notificación de GymBro',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'GymBro', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
