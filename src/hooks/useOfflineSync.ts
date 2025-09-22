import { useState, useEffect, useCallback } from 'react'
import { syncService, SyncItem } from '../services/syncService'

interface UseOfflineSyncReturn {
  isOnline: boolean
  syncStatus: {
    total: number
    synced: number
    pending: number
    syncInProgress: boolean
  }
  addToSyncQueue: (type: SyncItem['type'], data: any) => string
  forceSync: () => Promise<void>
  clearSyncQueue: () => void
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus())

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update sync status periodically
  useEffect(() => {
    const updateSyncStatus = () => {
      setSyncStatus(syncService.getSyncStatus())
    }

    // Update immediately
    updateSyncStatus()

    // Update every 5 seconds
    const interval = setInterval(updateSyncStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  // Add item to sync queue
  const addToSyncQueue = useCallback((type: SyncItem['type'], data: any): string => {
    const id = syncService.addToSyncQueue(type, data)
    setSyncStatus(syncService.getSyncStatus())
    return id
  }, [])

  // Force sync
  const forceSync = useCallback(async (): Promise<void> => {
    await syncService.forceSync()
    setSyncStatus(syncService.getSyncStatus())
  }, [])

  // Clear sync queue
  const clearSyncQueue = useCallback((): void => {
    syncService.clearSyncQueue()
    setSyncStatus(syncService.getSyncStatus())
  }, [])

  return {
    isOnline,
    syncStatus,
    addToSyncQueue,
    forceSync,
    clearSyncQueue,
  }
}
