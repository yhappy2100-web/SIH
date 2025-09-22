// Offline sync service for managing data synchronization
// This service handles syncing data when the app comes back online

interface SyncItem {
  id: string
  type: 'lesson_progress' | 'game_score' | 'user_data'
  data: any
  timestamp: number
  synced: boolean
}

class SyncService {
  private syncQueue: SyncItem[] = []
  private isOnline = navigator.onLine
  private syncInProgress = false

  constructor() {
    this.setupEventListeners()
    this.loadSyncQueue()
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Listen for visibility change to sync when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processSyncQueue()
      }
    })
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem('nabha_sync_queue')
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
      this.syncQueue = []
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem('nabha_sync_queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  // Add item to sync queue
  addToSyncQueue(type: SyncItem['type'], data: any): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const item: SyncItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    }

    this.syncQueue.push(item)
    this.saveSyncQueue()

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue()
    }

    return id
  }

  // Process sync queue
  private async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline) {
      return
    }

    this.syncInProgress = true

    try {
      const unsyncedItems = this.syncQueue.filter(item => !item.synced)
      
      for (const item of unsyncedItems) {
        await this.syncItem(item)
      }

      // Remove synced items older than 7 days
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      this.syncQueue = this.syncQueue.filter(
        item => !item.synced || item.timestamp > sevenDaysAgo
      )
      
      this.saveSyncQueue()
    } catch (error) {
      console.error('Sync process failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Sync individual item
  private async syncItem(item: SyncItem): Promise<boolean> {
    try {
      // Simulate API call - replace with actual API calls
      await this.simulateApiCall(item)
      
      // Mark as synced
      item.synced = true
      this.saveSyncQueue()
      
      console.log(`Synced item: ${item.id}`)
      return true
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error)
      return false
    }
  }

  // Simulate API call - replace with actual implementation
  private async simulateApiCall(item: SyncItem): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve()
        } else {
          reject(new Error('Simulated API error'))
        }
      }, 1000)
    })
  }

  // Get sync status
  getSyncStatus() {
    const total = this.syncQueue.length
    const synced = this.syncQueue.filter(item => item.synced).length
    const pending = total - synced

    return {
      total,
      synced,
      pending,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
    }
  }

  // Force sync
  async forceSync() {
    if (this.isOnline) {
      await this.processSyncQueue()
    }
  }

  // Clear sync queue
  clearSyncQueue() {
    this.syncQueue = []
    this.saveSyncQueue()
  }
}

// Export singleton instance
export const syncService = new SyncService()

// Export types
export type { SyncItem }
