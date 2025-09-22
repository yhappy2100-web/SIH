// Service Worker with Workbox for NabhaLearn PWA
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

declare const self: ServiceWorkerGlobalScope

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Cache strategies for different types of content

// 1. Static assets (JS, CSS, images) - Cache First
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style' || 
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)

// 2. API calls - Network First with fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
)

// 3. Lesson content - Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.includes('/lessons/') || url.pathname.includes('/lesson-content/'),
  new StaleWhileRevalidate({
    cacheName: 'lesson-content',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
)

// 4. Quiz data - Network First
registerRoute(
  ({ url }) => url.pathname.includes('/quizzes/') || url.pathname.includes('/quiz-data/'),
  new NetworkFirst({
    cacheName: 'quiz-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
)

// 5. Media files (videos, audio) - Cache First
registerRoute(
  ({ request }) => 
    request.destination === 'video' || 
    request.destination === 'audio',
  new CacheFirst({
    cacheName: 'media-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)

// 6. Fonts - Cache First
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
)

// Background sync for offline data
const backgroundSyncPlugin = new BackgroundSyncPlugin('nabha-learn-sync', {
  maxRetentionTime: 24 * 60, // 24 hours
})

// Handle attendance and progress sync
registerRoute(
  ({ url }) => url.pathname.includes('/api/attendance') || url.pathname.includes('/api/progress'),
  new NetworkOnly({
    plugins: [backgroundSyncPlugin],
  }),
  'POST'
)

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_LESSON') {
    const { lessonId, content } = event.data
    cacheLessonContent(lessonId, content)
  }
  
  if (event.data && event.data.type === 'CACHE_QUIZ') {
    const { quizId, content } = event.data
    cacheQuizContent(quizId, content)
  }
})

// Cache lesson content for offline access
async function cacheLessonContent(lessonId: string, content: any) {
  try {
    const cache = await caches.open('lesson-content')
    const response = new Response(JSON.stringify(content), {
      headers: { 'Content-Type': 'application/json' }
    })
    await cache.put(`/api/lessons/${lessonId}`, response)
    console.log(`Cached lesson content for ${lessonId}`)
  } catch (error) {
    console.error('Failed to cache lesson content:', error)
  }
}

// Cache quiz content for offline access
async function cacheQuizContent(quizId: string, content: any) {
  try {
    const cache = await caches.open('quiz-data')
    const response = new Response(JSON.stringify(content), {
      headers: { 'Content-Type': 'application/json' }
    })
    await cache.put(`/api/quizzes/${quizId}`, response)
    console.log(`Cached quiz content for ${quizId}`)
  } catch (error) {
    console.error('Failed to cache quiz content:', error)
  }
}

// Handle fetch events for custom caching logic
self.addEventListener('fetch', (event) => {
  // Handle offline fallback for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || caches.match('/index.html')
        })
    )
  }
})

// Periodic cleanup of old caches
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupOldCaches())
  }
})

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('nabha-learn-') && 
      name !== 'nabha-learn-v1'
    )
    
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    )
    
    console.log('Cleaned up old caches')
  } catch (error) {
    console.error('Failed to cleanup old caches:', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || []
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'view-lesson' && event.notification.data?.lessonId) {
    event.waitUntil(
      clients.openWindow(`/lessons/${event.notification.data.lessonId}`)
    )
  }
})

// Sync event for background data synchronization
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  try {
    // This would integrate with your sync service
    console.log('Syncing offline data...')
    // Implementation would depend on your specific sync requirements
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

export {}