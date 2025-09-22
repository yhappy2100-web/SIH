// IndexedDB service for offline storage using idb library
import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Database schema definitions
interface NabhaLearnDB extends DBSchema {
  lessons: {
    key: string
    value: Lesson
    indexes: { 'by-category': string; 'by-difficulty': string; 'by-updated': number }
  }
  quizzes: {
    key: string
    value: Quiz
    indexes: { 'by-lesson': string; 'by-completed': boolean; 'by-created': number }
  }
  attendance: {
    key: string
    value: AttendanceRecord
    indexes: { 'by-date': string; 'by-lesson': string; 'by-user': string }
  }
  progress: {
    key: string
    value: ProgressRecord
    indexes: { 'by-user': string; 'by-lesson': string; 'by-date': string }
  }
  cache: {
    key: string
    value: CacheItem
    indexes: { 'by-type': string; 'by-expiry': number }
  }
}

// Data type definitions
export interface Lesson {
  id: string
  title: string
  description: string
  content: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  thumbnail?: string
  videoUrl?: string
  audioUrl?: string
  resources: Resource[]
  prerequisites: string[]
  learningObjectives: string[]
  createdAt: Date
  updatedAt: Date
  version: number
  isOffline: boolean
}

export interface Resource {
  id: string
  type: 'pdf' | 'image' | 'video' | 'audio' | 'link'
  title: string
  url: string
  size?: number
  downloaded?: boolean
}

export interface Quiz {
  id: string
  lessonId: string
  title: string
  description: string
  questions: Question[]
  passingScore: number
  timeLimit?: number // in minutes
  attempts: number
  maxAttempts?: number
  createdAt: Date
  updatedAt: Date
  isOffline: boolean
}

export interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

export interface AttendanceRecord {
  id: string
  userId: string
  lessonId: string
  date: Date
  duration: number // in minutes
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  location?: string
  deviceInfo?: string
  synced: boolean
}

export interface ProgressRecord {
  id: string
  userId: string
  lessonId: string
  quizId?: string
  type: 'lesson' | 'quiz' | 'attendance'
  status: 'started' | 'in-progress' | 'completed' | 'failed'
  score?: number
  timeSpent: number // in minutes
  lastAccessed: Date
  completedAt?: Date
  data: any // flexible data storage
  synced: boolean
}

export interface CacheItem {
  key: string
  type: 'lesson' | 'quiz' | 'resource' | 'image' | 'video' | 'audio'
  data: any
  url?: string
  size: number
  expiry: Date
  createdAt: Date
}

class DatabaseService {
  private db: IDBPDatabase<NabhaLearnDB> | null = null
  private dbName = 'NabhaLearnDB'
  private version = 1

  async init(): Promise<void> {
    try {
      this.db = await openDB<NabhaLearnDB>(this.dbName, this.version, {
        upgrade(db) {
          // Lessons store
          if (!db.objectStoreNames.contains('lessons')) {
            const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' })
            lessonStore.createIndex('by-category', 'category')
            lessonStore.createIndex('by-difficulty', 'difficulty')
            lessonStore.createIndex('by-updated', 'updatedAt')
          }

          // Quizzes store
          if (!db.objectStoreNames.contains('quizzes')) {
            const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' })
            quizStore.createIndex('by-lesson', 'lessonId')
            quizStore.createIndex('by-completed', 'completed')
            quizStore.createIndex('by-created', 'createdAt')
          }

          // Attendance store
          if (!db.objectStoreNames.contains('attendance')) {
            const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' })
            attendanceStore.createIndex('by-date', 'date')
            attendanceStore.createIndex('by-lesson', 'lessonId')
            attendanceStore.createIndex('by-user', 'userId')
          }

          // Progress store
          if (!db.objectStoreNames.contains('progress')) {
            const progressStore = db.createObjectStore('progress', { keyPath: 'id' })
            progressStore.createIndex('by-user', 'userId')
            progressStore.createIndex('by-lesson', 'lessonId')
            progressStore.createIndex('by-date', 'lastAccessed')
          }

          // Cache store
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
            cacheStore.createIndex('by-type', 'type')
            cacheStore.createIndex('by-expiry', 'expiry')
          }
        },
      })
      console.log('IndexedDB initialized successfully')
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error)
      throw error
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<NabhaLearnDB>> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db
  }

  // Lesson operations
  async saveLesson(lesson: Lesson): Promise<void> {
    const db = await this.ensureDB()
    await db.put('lessons', lesson)
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const db = await this.ensureDB()
    return await db.get('lessons', id)
  }

  async getAllLessons(): Promise<Lesson[]> {
    const db = await this.ensureDB()
    return await db.getAll('lessons')
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('lessons', 'by-category', category)
  }

  async getLessonsByDifficulty(difficulty: string): Promise<Lesson[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('lessons', 'by-difficulty', difficulty)
  }

  async deleteLesson(id: string): Promise<void> {
    const db = await this.ensureDB()
    await db.delete('lessons', id)
  }

  // Quiz operations
  async saveQuiz(quiz: Quiz): Promise<void> {
    const db = await this.ensureDB()
    await db.put('quizzes', quiz)
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const db = await this.ensureDB()
    return await db.get('quizzes', id)
  }

  async getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('quizzes', 'by-lesson', lessonId)
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const db = await this.ensureDB()
    return await db.getAll('quizzes')
  }

  async deleteQuiz(id: string): Promise<void> {
    const db = await this.ensureDB()
    await db.delete('quizzes', id)
  }

  // Attendance operations
  async saveAttendance(attendance: AttendanceRecord): Promise<void> {
    const db = await this.ensureDB()
    await db.put('attendance', attendance)
  }

  async getAttendance(id: string): Promise<AttendanceRecord | undefined> {
    const db = await this.ensureDB()
    return await db.get('attendance', id)
  }

  async getAttendanceByUser(userId: string): Promise<AttendanceRecord[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('attendance', 'by-user', userId)
  }

  async getAttendanceByLesson(lessonId: string): Promise<AttendanceRecord[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('attendance', 'by-lesson', lessonId)
  }

  async getUnsyncedAttendance(): Promise<AttendanceRecord[]> {
    const db = await this.ensureDB()
    const all = await db.getAll('attendance')
    return all.filter(record => !record.synced)
  }

  // Progress operations
  async saveProgress(progress: ProgressRecord): Promise<void> {
    const db = await this.ensureDB()
    await db.put('progress', progress)
  }

  async getProgress(id: string): Promise<ProgressRecord | undefined> {
    const db = await this.ensureDB()
    return await db.get('progress', id)
  }

  async getProgressByUser(userId: string): Promise<ProgressRecord[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('progress', 'by-user', userId)
  }

  async getProgressByLesson(lessonId: string): Promise<ProgressRecord[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('progress', 'by-lesson', lessonId)
  }

  async getUnsyncedProgress(): Promise<ProgressRecord[]> {
    const db = await this.ensureDB()
    const all = await db.getAll('progress')
    return all.filter(record => !record.synced)
  }

  // Cache operations
  async saveToCache(key: string, data: any, type: CacheItem['type'], expiryHours = 24): Promise<void> {
    const db = await this.ensureDB()
    const expiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000)
    const cacheItem: CacheItem = {
      key,
      type,
      data,
      size: JSON.stringify(data).length,
      expiry,
      createdAt: new Date(),
    }
    await db.put('cache', cacheItem)
  }

  async getFromCache(key: string): Promise<any | null> {
    const db = await this.ensureDB()
    const item = await db.get('cache', key)
    
    if (!item) return null
    
    // Check if expired
    if (new Date() > item.expiry) {
      await db.delete('cache', key)
      return null
    }
    
    return item.data
  }

  async clearExpiredCache(): Promise<void> {
    const db = await this.ensureDB()
    const now = new Date()
    const expired = await db.getAllFromIndex('cache', 'by-expiry', IDBKeyRange.upperBound(now))
    
    for (const item of expired) {
      await db.delete('cache', item.key)
    }
  }

  async clearAllCache(): Promise<void> {
    const db = await this.ensureDB()
    await db.clear('cache')
  }

  // Utility methods
  async getStorageInfo(): Promise<{ used: number; available: number; breakdown: any }> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { used: 0, available: 0, breakdown: {} }
    }

    const estimate = await navigator.storage.estimate()
    const used = estimate.usage || 0
    const available = estimate.quota || 0

    // Get breakdown by store
    const db = await this.ensureDB()
    const breakdown = {
      lessons: (await db.getAll('lessons')).length,
      quizzes: (await db.getAll('quizzes')).length,
      attendance: (await db.getAll('attendance')).length,
      progress: (await db.getAll('progress')).length,
      cache: (await db.getAll('cache')).length,
    }

    return { used, available, breakdown }
  }

  async exportData(): Promise<any> {
    const db = await this.ensureDB()
    return {
      lessons: await db.getAll('lessons'),
      quizzes: await db.getAll('quizzes'),
      attendance: await db.getAll('attendance'),
      progress: await db.getAll('progress'),
      exportedAt: new Date().toISOString(),
    }
  }

  async importData(data: any): Promise<void> {
    const db = await this.ensureDB()
    const tx = db.transaction(['lessons', 'quizzes', 'attendance', 'progress'], 'readwrite')

    if (data.lessons) {
      for (const lesson of data.lessons) {
        await tx.objectStore('lessons').put(lesson)
      }
    }

    if (data.quizzes) {
      for (const quiz of data.quizzes) {
        await tx.objectStore('quizzes').put(quiz)
      }
    }

    if (data.attendance) {
      for (const attendance of data.attendance) {
        await tx.objectStore('attendance').put(attendance)
      }
    }

    if (data.progress) {
      for (const progress of data.progress) {
        await tx.objectStore('progress').put(progress)
      }
    }

    await tx.done
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()

// Export types
export type { Lesson, Quiz, AttendanceRecord, ProgressRecord, CacheItem, Resource, Question }
