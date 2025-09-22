// Hook for managing offline data and caching
import { useState, useEffect, useCallback } from 'react'
import { databaseService, Lesson, Quiz, AttendanceRecord, ProgressRecord } from '../services/database'
import { serviceWorkerManager } from '../utils/serviceWorker'

interface UseOfflineDataReturn {
  // Database state
  isDatabaseReady: boolean
  databaseError: string | null
  
  // Lesson management
  lessons: Lesson[]
  saveLesson: (lesson: Lesson) => Promise<void>
  getLesson: (id: string) => Promise<Lesson | undefined>
  deleteLesson: (id: string) => Promise<void>
  refreshLessons: () => Promise<void>
  
  // Quiz management
  quizzes: Quiz[]
  saveQuiz: (quiz: Quiz) => Promise<void>
  getQuiz: (id: string) => Promise<Quiz | undefined>
  getQuizzesByLesson: (lessonId: string) => Promise<Quiz[]>
  deleteQuiz: (id: string) => Promise<void>
  refreshQuizzes: () => Promise<void>
  
  // Attendance management
  attendance: AttendanceRecord[]
  saveAttendance: (attendance: AttendanceRecord) => Promise<void>
  getAttendance: (id: string) => Promise<AttendanceRecord | undefined>
  getUnsyncedAttendance: () => Promise<AttendanceRecord[]>
  refreshAttendance: () => Promise<void>
  
  // Progress management
  progress: ProgressRecord[]
  saveProgress: (progress: ProgressRecord) => Promise<void>
  getProgress: (id: string) => Promise<ProgressRecord | undefined>
  getUnsyncedProgress: () => Promise<ProgressRecord[]>
  refreshProgress: () => Promise<void>
  
  // Cache management
  cacheLessonContent: (lessonId: string, content: any) => Promise<void>
  cacheQuizContent: (quizId: string, content: any) => Promise<void>
  clearCache: () => Promise<void>
  
  // Sync management
  syncData: () => Promise<void>
  isOnline: boolean
  hasUnsyncedData: boolean
}

export const useOfflineData = (): UseOfflineDataReturn => {
  const [isDatabaseReady, setDatabaseReady] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Data state
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [progress, setProgress] = useState<ProgressRecord[]>([])

  // Initialize database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await databaseService.init()
        setDatabaseReady(true)
        setDatabaseError(null)
        
        // Load initial data
        await Promise.all([
          refreshLessons(),
          refreshQuizzes(),
          refreshAttendance(),
          refreshProgress(),
        ])
      } catch (error) {
        console.error('Database initialization failed:', error)
        setDatabaseError(error instanceof Error ? error.message : 'Unknown error')
        setDatabaseReady(false)
      }
    }

    initDatabase()
  }, [])

  // Online/offline detection
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

  // Check for unsynced data
  const hasUnsyncedData = attendance.some(record => !record.synced) || 
                         progress.some(record => !record.synced)

  // Lesson management
  const saveLesson = useCallback(async (lesson: Lesson) => {
    try {
      await databaseService.saveLesson(lesson)
      await refreshLessons()
      
      // Cache content in service worker
      await serviceWorkerManager.cacheLessonContent(lesson.id, lesson)
    } catch (error) {
      console.error('Failed to save lesson:', error)
      throw error
    }
  }, [])

  const getLesson = useCallback(async (id: string) => {
    try {
      return await databaseService.getLesson(id)
    } catch (error) {
      console.error('Failed to get lesson:', error)
      throw error
    }
  }, [])

  const deleteLesson = useCallback(async (id: string) => {
    try {
      await databaseService.deleteLesson(id)
      await refreshLessons()
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      throw error
    }
  }, [])

  const refreshLessons = useCallback(async () => {
    try {
      const lessonsData = await databaseService.getAllLessons()
      setLessons(lessonsData)
    } catch (error) {
      console.error('Failed to refresh lessons:', error)
    }
  }, [])

  // Quiz management
  const saveQuiz = useCallback(async (quiz: Quiz) => {
    try {
      await databaseService.saveQuiz(quiz)
      await refreshQuizzes()
      
      // Cache content in service worker
      await serviceWorkerManager.cacheQuizContent(quiz.id, quiz)
    } catch (error) {
      console.error('Failed to save quiz:', error)
      throw error
    }
  }, [])

  const getQuiz = useCallback(async (id: string) => {
    try {
      return await databaseService.getQuiz(id)
    } catch (error) {
      console.error('Failed to get quiz:', error)
      throw error
    }
  }, [])

  const getQuizzesByLesson = useCallback(async (lessonId: string) => {
    try {
      return await databaseService.getQuizzesByLesson(lessonId)
    } catch (error) {
      console.error('Failed to get quizzes by lesson:', error)
      throw error
    }
  }, [])

  const deleteQuiz = useCallback(async (id: string) => {
    try {
      await databaseService.deleteQuiz(id)
      await refreshQuizzes()
    } catch (error) {
      console.error('Failed to delete quiz:', error)
      throw error
    }
  }, [])

  const refreshQuizzes = useCallback(async () => {
    try {
      const quizzesData = await databaseService.getAllQuizzes()
      setQuizzes(quizzesData)
    } catch (error) {
      console.error('Failed to refresh quizzes:', error)
    }
  }, [])

  // Attendance management
  const saveAttendance = useCallback(async (attendanceRecord: AttendanceRecord) => {
    try {
      await databaseService.saveAttendance(attendanceRecord)
      await refreshAttendance()
    } catch (error) {
      console.error('Failed to save attendance:', error)
      throw error
    }
  }, [])

  const getAttendance = useCallback(async (id: string) => {
    try {
      return await databaseService.getAttendance(id)
    } catch (error) {
      console.error('Failed to get attendance:', error)
      throw error
    }
  }, [])

  const getUnsyncedAttendance = useCallback(async () => {
    try {
      return await databaseService.getUnsyncedAttendance()
    } catch (error) {
      console.error('Failed to get unsynced attendance:', error)
      throw error
    }
  }, [])

  const refreshAttendance = useCallback(async () => {
    try {
      const attendanceData = await databaseService.getAttendanceByUser('current-user') // Replace with actual user ID
      setAttendance(attendanceData)
    } catch (error) {
      console.error('Failed to refresh attendance:', error)
    }
  }, [])

  // Progress management
  const saveProgress = useCallback(async (progressRecord: ProgressRecord) => {
    try {
      await databaseService.saveProgress(progressRecord)
      await refreshProgress()
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    }
  }, [])

  const getProgress = useCallback(async (id: string) => {
    try {
      return await databaseService.getProgress(id)
    } catch (error) {
      console.error('Failed to get progress:', error)
      throw error
    }
  }, [])

  const getUnsyncedProgress = useCallback(async () => {
    try {
      return await databaseService.getUnsyncedProgress()
    } catch (error) {
      console.error('Failed to get unsynced progress:', error)
      throw error
    }
  }, [])

  const refreshProgress = useCallback(async () => {
    try {
      const progressData = await databaseService.getProgressByUser('current-user') // Replace with actual user ID
      setProgress(progressData)
    } catch (error) {
      console.error('Failed to refresh progress:', error)
    }
  }, [])

  // Cache management
  const cacheLessonContent = useCallback(async (lessonId: string, content: any) => {
    try {
      await serviceWorkerManager.cacheLessonContent(lessonId, content)
    } catch (error) {
      console.error('Failed to cache lesson content:', error)
    }
  }, [])

  const cacheQuizContent = useCallback(async (quizId: string, content: any) => {
    try {
      await serviceWorkerManager.cacheQuizContent(quizId, content)
    } catch (error) {
      console.error('Failed to cache quiz content:', error)
    }
  }, [])

  const clearCache = useCallback(async () => {
    try {
      await serviceWorkerManager.clearCache()
      await databaseService.clearAllCache()
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }, [])

  // Sync management
  const syncData = useCallback(async () => {
    if (!isOnline) {
      console.log('Cannot sync: offline')
      return
    }

    try {
      // Get unsynced data
      const unsyncedAttendance = await getUnsyncedAttendance()
      const unsyncedProgress = await getUnsyncedProgress()

      // Sync attendance data
      for (const record of unsyncedAttendance) {
        try {
          // Here you would make API calls to sync with server
          // For now, just mark as synced
          record.synced = true
          await databaseService.saveAttendance(record)
        } catch (error) {
          console.error('Failed to sync attendance record:', record.id, error)
        }
      }

      // Sync progress data
      for (const record of unsyncedProgress) {
        try {
          // Here you would make API calls to sync with server
          // For now, just mark as synced
          record.synced = true
          await databaseService.saveProgress(record)
        } catch (error) {
          console.error('Failed to sync progress record:', record.id, error)
        }
      }

      // Refresh data after sync
      await Promise.all([
        refreshAttendance(),
        refreshProgress(),
      ])

      console.log('Data sync completed')
    } catch (error) {
      console.error('Data sync failed:', error)
    }
  }, [isOnline, getUnsyncedAttendance, getUnsyncedProgress, refreshAttendance, refreshProgress])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && hasUnsyncedData) {
      syncData()
    }
  }, [isOnline, hasUnsyncedData, syncData])

  return {
    // Database state
    isDatabaseReady,
    databaseError,
    
    // Lesson management
    lessons,
    saveLesson,
    getLesson,
    deleteLesson,
    refreshLessons,
    
    // Quiz management
    quizzes,
    saveQuiz,
    getQuiz,
    getQuizzesByLesson,
    deleteQuiz,
    refreshQuizzes,
    
    // Attendance management
    attendance,
    saveAttendance,
    getAttendance,
    getUnsyncedAttendance,
    refreshAttendance,
    
    // Progress management
    progress,
    saveProgress,
    getProgress,
    getUnsyncedProgress,
    refreshProgress,
    
    // Cache management
    cacheLessonContent,
    cacheQuizContent,
    clearCache,
    
    // Sync management
    syncData,
    isOnline,
    hasUnsyncedData,
  }
}
