// Service Worker registration and management utilities
import { Workbox } from 'workbox-window'

class ServiceWorkerManager {
  private workbox: Workbox | null = null
  private registration: ServiceWorkerRegistration | null = null

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Register the service worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('Service Worker registered successfully:', this.registration)

        // Initialize Workbox
        this.workbox = new Workbox('/sw.js')
        
        // Handle service worker updates
        this.workbox.addEventListener('waiting', () => {
          console.log('New service worker is waiting')
          this.showUpdateNotification()
        })

        this.workbox.addEventListener('controlling', () => {
          console.log('Service worker is now controlling the page')
          window.location.reload()
        })

        // Handle service worker messages
        this.workbox.addEventListener('message', (event) => {
          if (event.data.type === 'CACHE_UPDATED') {
            console.log('Cache updated:', event.data.payload)
          }
        })

        await this.workbox.register()
        
        // Check for updates periodically
        this.startUpdateCheck()
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    } else {
      console.warn('Service Worker not supported in this browser')
    }
  }

  private showUpdateNotification(): void {
    // You can customize this notification UI
    if (confirm('A new version of NabhaLearn is available. Would you like to update now?')) {
      this.updateServiceWorker()
    }
  }

  async updateServiceWorker(): Promise<void> {
    if (this.workbox) {
      await this.workbox.messageSkipWaiting()
    }
  }

  private startUpdateCheck(): void {
    // Check for updates every 30 minutes
    setInterval(() => {
      this.checkForUpdates()
    }, 30 * 60 * 1000)
  }

  private async checkForUpdates(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update()
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }
  }

  async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister()
      console.log('Service Worker unregistered')
    }
  }

  async sendMessage(type: string, payload?: any): Promise<void> {
    if (this.registration && this.registration.active) {
      this.registration.active.postMessage({ type, payload })
    }
  }

  // Cache management methods
  async cacheLessonContent(lessonId: string, content: any): Promise<void> {
    await this.sendMessage('CACHE_LESSON', { lessonId, content })
  }

  async cacheQuizContent(quizId: string, content: any): Promise<void> {
    await this.sendMessage('CACHE_QUIZ', { quizId, content })
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    }
  }

  async getCacheInfo(): Promise<{ name: string; size: number }[]> {
    if (!('caches' in window)) return []

    const cacheNames = await caches.keys()
    const cacheInfo = []

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      const size = keys.length
      cacheInfo.push({ name: cacheName, size })
    }

    return cacheInfo
  }

  // Background sync methods
  async requestBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(tag)
        console.log(`Background sync registered: ${tag}`)
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  // Push notification methods
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (this.registration && 'showNotification' in this.registration) {
      await this.registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      })
    }
  }

  // Offline detection
  isOnline(): boolean {
    return navigator.onLine
  }

  addOnlineListener(callback: () => void): void {
    window.addEventListener('online', callback)
  }

  addOfflineListener(callback: () => void): void {
    window.addEventListener('offline', callback)
  }

  // Service worker state
  getState(): 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | 'unknown' {
    if (this.registration?.installing) return 'installing'
    if (this.registration?.waiting) return 'installed'
    if (this.registration?.active) return 'activated'
    return 'unknown'
  }

  isControlled(): boolean {
    return navigator.serviceWorker.controller !== null
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager()

// Export the class for custom instances
export { ServiceWorkerManager }
