// Teacher Dashboard database service for offline storage
import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Extended database schema for teacher data
interface TeacherDB extends DBSchema {
  students: {
    key: string
    value: Student
    indexes: { 'by-class': string; 'by-name': string; 'by-roll': string }
  }
  classes: {
    key: string
    value: Class
    indexes: { 'by-teacher': string; 'by-subject': string }
  }
  attendance: {
    key: string
    value: AttendanceRecord
    indexes: { 'by-date': string; 'by-class': string; 'by-student': string; 'by-synced': boolean }
  }
  scores: {
    key: string
    value: ScoreRecord
    indexes: { 'by-student': string; 'by-assignment': string; 'by-class': string; 'by-synced': boolean }
  }
  assignments: {
    key: string
    value: Assignment
    indexes: { 'by-class': string; 'by-teacher': string; 'by-due-date': string; 'by-synced': boolean }
  }
  submissions: {
    key: string
    value: AssignmentSubmission
    indexes: { 'by-assignment': string; 'by-student': string; 'by-submitted': boolean; 'by-synced': boolean }
  }
  teacher_sync_queue: {
    key: string
    value: SyncQueueItem
    indexes: { 'by-type': string; 'by-priority': number; 'by-created': number }
  }
}

// Data type definitions
export interface Student {
  id: string
  rollNumber: string
  name: string
  email?: string
  phone?: string
  classId: string
  className: string
  section?: string
  parentName?: string
  parentPhone?: string
  address?: string
  dateOfBirth?: Date
  admissionDate: Date
  isActive: boolean
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Class {
  id: string
  name: string
  section?: string
  subject: string
  teacherId: string
  teacherName: string
  academicYear: string
  semester?: string
  schedule: ClassSchedule[]
  totalStudents: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClassSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  startTime: string
  endTime: string
  room?: string
}

export interface AttendanceRecord {
  id: string
  classId: string
  studentId: string
  studentName: string
  date: Date
  status: 'present' | 'absent' | 'late' | 'excused'
  markedBy: string
  markedAt: Date
  notes?: string
  synced: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ScoreRecord {
  id: string
  studentId: string
  studentName: string
  classId: string
  assignmentId?: string
  assignmentName?: string
  examType: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project'
  subject: string
  maxMarks: number
  obtainedMarks: number
  percentage: number
  grade: string
  remarks?: string
  gradedBy: string
  gradedAt: Date
  synced: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  id: string
  title: string
  description: string
  classId: string
  className: string
  subject: string
  teacherId: string
  teacherName: string
  maxMarks: number
  dueDate: Date
  instructions?: string
  attachments?: AssignmentAttachment[]
  isPublished: boolean
  publishedAt?: Date
  totalSubmissions: number
  synced: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AssignmentAttachment {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'docx' | 'image' | 'video' | 'link'
  url: string
  size?: number
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  classId: string
  submittedAt: Date
  submittedContent?: string
  attachments?: SubmissionAttachment[]
  isLate: boolean
  status: 'submitted' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  synced: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SubmissionAttachment {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'docx' | 'image' | 'video' | 'link'
  url: string
  size?: number
}

export interface SyncQueueItem {
  id: string
  type: 'attendance' | 'score' | 'assignment' | 'submission' | 'student' | 'class'
  action: 'create' | 'update' | 'delete'
  data: any
  priority: number
  retryCount: number
  maxRetries: number
  createdAt: Date
  syncedAt?: Date
  error?: string
}

class TeacherDatabaseService {
  private db: IDBPDatabase<TeacherDB> | null = null
  private dbName = 'TeacherDashboardDB'
  private version = 1

  async init(): Promise<void> {
    try {
      this.db = await openDB<TeacherDB>(this.dbName, this.version, {
        upgrade(db) {
          // Students store
          if (!db.objectStoreNames.contains('students')) {
            const studentStore = db.createObjectStore('students', { keyPath: 'id' })
            studentStore.createIndex('by-class', 'classId')
            studentStore.createIndex('by-name', 'name')
            studentStore.createIndex('by-roll', 'rollNumber')
          }

          // Classes store
          if (!db.objectStoreNames.contains('classes')) {
            const classStore = db.createObjectStore('classes', { keyPath: 'id' })
            classStore.createIndex('by-teacher', 'teacherId')
            classStore.createIndex('by-subject', 'subject')
          }

          // Attendance store
          if (!db.objectStoreNames.contains('attendance')) {
            const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' })
            attendanceStore.createIndex('by-date', 'date')
            attendanceStore.createIndex('by-class', 'classId')
            attendanceStore.createIndex('by-student', 'studentId')
            attendanceStore.createIndex('by-synced', 'synced')
          }

          // Scores store
          if (!db.objectStoreNames.contains('scores')) {
            const scoreStore = db.createObjectStore('scores', { keyPath: 'id' })
            scoreStore.createIndex('by-student', 'studentId')
            scoreStore.createIndex('by-assignment', 'assignmentId')
            scoreStore.createIndex('by-class', 'classId')
            scoreStore.createIndex('by-synced', 'synced')
          }

          // Assignments store
          if (!db.objectStoreNames.contains('assignments')) {
            const assignmentStore = db.createObjectStore('assignments', { keyPath: 'id' })
            assignmentStore.createIndex('by-class', 'classId')
            assignmentStore.createIndex('by-teacher', 'teacherId')
            assignmentStore.createIndex('by-due-date', 'dueDate')
            assignmentStore.createIndex('by-synced', 'synced')
          }

          // Submissions store
          if (!db.objectStoreNames.contains('submissions')) {
            const submissionStore = db.createObjectStore('submissions', { keyPath: 'id' })
            submissionStore.createIndex('by-assignment', 'assignmentId')
            submissionStore.createIndex('by-student', 'studentId')
            submissionStore.createIndex('by-submitted', 'submittedAt')
            submissionStore.createIndex('by-synced', 'synced')
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('teacher_sync_queue')) {
            const syncStore = db.createObjectStore('teacher_sync_queue', { keyPath: 'id' })
            syncStore.createIndex('by-type', 'type')
            syncStore.createIndex('by-priority', 'priority')
            syncStore.createIndex('by-created', 'createdAt')
          }
        },
      })
      console.log('Teacher Database initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Teacher Database:', error)
      throw error
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<TeacherDB>> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Teacher Database not initialized')
    }
    return this.db
  }

  // Student operations
  async saveStudent(student: Student): Promise<void> {
    const db = await this.ensureDB()
    await db.put('students', student)
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const db = await this.ensureDB()
    return await db.get('students', id)
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('students', 'by-class', classId)
  }

  async getAllStudents(): Promise<Student[]> {
    const db = await this.ensureDB()
    return await db.getAll('students')
  }

  // Class operations
  async saveClass(classData: Class): Promise<void> {
    const db = await this.ensureDB()
    await db.put('classes', classData)
  }

  async getClass(id: string): Promise<Class | undefined> {
    const db = await this.ensureDB()
    return await db.get('classes', id)
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('classes', 'by-teacher', teacherId)
  }

  async getAllClasses(): Promise<Class[]> {
    const db = await this.ensureDB()
    return await db.getAll('classes')
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

  async getAttendanceByClass(classId: string, date?: Date): Promise<AttendanceRecord[]> {
    const db = await this.ensureDB()
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      const allAttendance = await db.getAllFromIndex('attendance', 'by-class', classId)
      return allAttendance.filter(record => 
        record.date >= startOfDay && record.date <= endOfDay
      )
    }
    return await db.getAllFromIndex('attendance', 'by-class', classId)
  }

  async getUnsyncedAttendance(): Promise<AttendanceRecord[]> {
    const db = await this.ensureDB()
    const all = await db.getAll('attendance')
    return all.filter(record => !record.synced)
  }

  // Score operations
  async saveScore(score: ScoreRecord): Promise<void> {
    const db = await this.ensureDB()
    await db.put('scores', score)
  }

  async getScore(id: string): Promise<ScoreRecord | undefined> {
    const db = await this.ensureDB()
    return await db.get('scores', id)
  }

  async getScoresByStudent(studentId: string): Promise<ScoreRecord[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('scores', 'by-student', studentId)
  }

  async getScoresByClass(classId: string): Promise<ScoreRecord[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('scores', 'by-class', classId)
  }

  async getUnsyncedScores(): Promise<ScoreRecord[]> {
    const db = await this.ensureDB()
    const all = await db.getAll('scores')
    return all.filter(record => !record.synced)
  }

  // Assignment operations
  async saveAssignment(assignment: Assignment): Promise<void> {
    const db = await this.ensureDB()
    await db.put('assignments', assignment)
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const db = await this.ensureDB()
    return await db.get('assignments', id)
  }

  async getAssignmentsByClass(classId: string): Promise<Assignment[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('assignments', 'by-class', classId)
  }

  async getUnsyncedAssignments(): Promise<Assignment[]> {
    const db = await this.ensureDB()
    const all = await db.getAll('assignments')
    return all.filter(record => !record.synced)
  }

  // Submission operations
  async saveSubmission(submission: AssignmentSubmission): Promise<void> {
    const db = await this.ensureDB()
    await db.put('submissions', submission)
  }

  async getSubmission(id: string): Promise<AssignmentSubmission | undefined> {
    const db = await this.ensureDB()
    return await db.get('submissions', id)
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
    const db = await this.ensureDB()
    return await db.getAllFromIndex('submissions', 'by-assignment', assignmentId)
  }

  async getUnsyncedSubmissions(): Promise<AssignmentSubmission[]> {
    const db = await this.ensureDB()
    const all = await db.getAll('submissions')
    return all.filter(record => !record.synced)
  }

  // Sync queue operations
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): Promise<string> {
    const db = await this.ensureDB()
    const id = `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const syncItem: SyncQueueItem = {
      ...item,
      id,
      createdAt: new Date(),
    }
    await db.put('teacher_sync_queue', syncItem)
    return id
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.ensureDB()
    return await db.getAll('teacher_sync_queue')
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.ensureDB()
    await db.delete('teacher_sync_queue', id)
  }

  async clearSyncQueue(): Promise<void> {
    const db = await this.ensureDB()
    await db.clear('teacher_sync_queue')
  }

  // Utility methods
  async getDashboardStats(teacherId: string): Promise<{
    totalStudents: number
    totalClasses: number
    todayAttendance: number
    pendingAssignments: number
    unsyncedRecords: number
  }> {
    const db = await this.ensureDB()
    
    const students = await db.getAll('students')
    const classes = await db.getAllFromIndex('classes', 'by-teacher', teacherId)
    const today = new Date()
    const todayAttendance = await this.getAttendanceByClass(classes[0]?.id || '', today)
    const assignments = await db.getAll('assignments')
    const unsyncedAttendance = await this.getUnsyncedAttendance()
    const unsyncedScores = await this.getUnsyncedScores()
    const unsyncedAssignments = await this.getUnsyncedAssignments()
    const unsyncedSubmissions = await this.getUnsyncedSubmissions()

    return {
      totalStudents: students.length,
      totalClasses: classes.length,
      todayAttendance: todayAttendance.length,
      pendingAssignments: assignments.filter(a => !a.isPublished).length,
      unsyncedRecords: unsyncedAttendance.length + unsyncedScores.length + 
                      unsyncedAssignments.length + unsyncedSubmissions.length
    }
  }

  async exportTeacherData(): Promise<any> {
    const db = await this.ensureDB()
    return {
      students: await db.getAll('students'),
      classes: await db.getAll('classes'),
      attendance: await db.getAll('attendance'),
      scores: await db.getAll('scores'),
      assignments: await db.getAll('assignments'),
      submissions: await db.getAll('submissions'),
      exportedAt: new Date().toISOString(),
    }
  }
}

// Export singleton instance
export const teacherDatabaseService = new TeacherDatabaseService()

// Export types
export type { 
  Student, 
  Class, 
  AttendanceRecord, 
  ScoreRecord, 
  Assignment, 
  AssignmentSubmission, 
  SyncQueueItem 
}
