// Hook for managing teacher dashboard data and sync
import { useState, useEffect, useCallback } from 'react'
import { 
  teacherDatabaseService,
  Student,
  Class,
  AttendanceRecord,
  ScoreRecord,
  Assignment,
  AssignmentSubmission
} from '../services/teacherDatabase'
import { teacherFirebaseSyncService } from '../services/teacherFirebaseSync'

interface UseTeacherDashboardReturn {
  // Database state
  isDatabaseReady: boolean
  databaseError: string | null
  
  // Data state
  students: Student[]
  classes: Class[]
  attendance: AttendanceRecord[]
  scores: ScoreRecord[]
  assignments: Assignment[]
  submissions: AssignmentSubmission[]
  
  // Loading states
  loading: {
    students: boolean
    classes: boolean
    attendance: boolean
    scores: boolean
    assignments: boolean
    submissions: boolean
    sync: boolean
  }
  
  // Sync state
  isOnline: boolean
  syncStatus: {
    isInitialized: boolean
    hasConfig: boolean
    lastSync?: Date
    pendingRecords: number
  }
  
  // Student operations
  saveStudent: (student: Student) => Promise<void>
  updateStudent: (student: Student) => Promise<void>
  deleteStudent: (studentId: string) => Promise<void>
  getStudent: (studentId: string) => Promise<Student | undefined>
  getStudentsByClass: (classId: string) => Promise<Student[]>
  
  // Class operations
  saveClass: (classData: Class) => Promise<void>
  updateClass: (classData: Class) => Promise<void>
  getClass: (classId: string) => Promise<Class | undefined>
  getClassesByTeacher: (teacherId: string) => Promise<Class[]>
  
  // Attendance operations
  saveAttendance: (attendance: AttendanceRecord) => Promise<void>
  getAttendance: (attendanceId: string) => Promise<AttendanceRecord | undefined>
  getAttendanceByClass: (classId: string, date?: Date) => Promise<AttendanceRecord[]>
  markAttendance: (classId: string, studentId: string, status: AttendanceRecord['status'], notes?: string) => Promise<void>
  
  // Score operations
  saveScore: (score: ScoreRecord) => Promise<void>
  getScore: (scoreId: string) => Promise<ScoreRecord | undefined>
  getScoresByStudent: (studentId: string) => Promise<ScoreRecord[]>
  getScoresByClass: (classId: string) => Promise<ScoreRecord[]>
  recordScore: (studentId: string, classId: string, assignmentId: string, marks: number, maxMarks: number, remarks?: string) => Promise<void>
  
  // Assignment operations
  saveAssignment: (assignment: Assignment) => Promise<void>
  updateAssignment: (assignment: Assignment) => Promise<void>
  getAssignment: (assignmentId: string) => Promise<Assignment | undefined>
  getAssignmentsByClass: (classId: string) => Promise<Assignment[]>
  publishAssignment: (assignmentId: string) => Promise<void>
  
  // Submission operations
  saveSubmission: (submission: AssignmentSubmission) => Promise<void>
  getSubmission: (submissionId: string) => Promise<AssignmentSubmission | undefined>
  getSubmissionsByAssignment: (assignmentId: string) => Promise<AssignmentSubmission[]>
  gradeSubmission: (submissionId: string, grade: number, feedback?: string) => Promise<void>
  
  // Sync operations
  syncAllData: () => Promise<void>
  syncAttendance: () => Promise<void>
  syncScores: () => Promise<void>
  syncAssignments: () => Promise<void>
  syncSubmissions: () => Promise<void>
  
  // Utility operations
  refreshAllData: () => Promise<void>
  getDashboardStats: (teacherId: string) => Promise<any>
  exportData: () => Promise<any>
}

export const useTeacherDashboard = (): UseTeacherDashboardReturn => {
  const [isDatabaseReady, setDatabaseReady] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Data state
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  
  // Loading states
  const [loading, setLoading] = useState({
    students: false,
    classes: false,
    attendance: false,
    scores: false,
    assignments: false,
    submissions: false,
    sync: false,
  })
  
  // Sync state
  const [syncStatus, setSyncStatus] = useState({
    isInitialized: false,
    hasConfig: false,
    lastSync: undefined as Date | undefined,
    pendingRecords: 0,
  })

  // Initialize database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await teacherDatabaseService.init()
        setDatabaseReady(true)
        setDatabaseError(null)
        
        // Load initial data
        await refreshAllData()
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

  // Update sync status
  useEffect(() => {
    const updateSyncStatus = () => {
      const status = teacherFirebaseSyncService.getSyncStatus()
      setSyncStatus(prev => ({
        ...prev,
        isInitialized: status.isInitialized,
        hasConfig: status.hasConfig,
        pendingRecords: attendance.filter(a => !a.synced).length +
                      scores.filter(s => !s.synced).length +
                      assignments.filter(a => !a.synced).length +
                      submissions.filter(s => !s.synced).length
      }))
    }

    updateSyncStatus()
  }, [attendance, scores, assignments, submissions])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncStatus.pendingRecords > 0) {
      syncAllData()
    }
  }, [isOnline, syncStatus.pendingRecords])

  // Student operations
  const saveStudent = useCallback(async (student: Student) => {
    try {
      setLoading(prev => ({ ...prev, students: true }))
      await teacherDatabaseService.saveStudent(student)
      await refreshStudents()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'student',
        action: 'create',
        data: student,
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
      })
    } catch (error) {
      console.error('Failed to save student:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, students: false }))
    }
  }, [])

  const updateStudent = useCallback(async (student: Student) => {
    try {
      setLoading(prev => ({ ...prev, students: true }))
      await teacherDatabaseService.saveStudent(student)
      await refreshStudents()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'student',
        action: 'update',
        data: student,
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
      })
    } catch (error) {
      console.error('Failed to update student:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, students: false }))
    }
  }, [])

  const deleteStudent = useCallback(async (studentId: string) => {
    try {
      setLoading(prev => ({ ...prev, students: true }))
      // Note: In a real implementation, you might want to soft delete
      await refreshStudents()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'student',
        action: 'delete',
        data: { id: studentId },
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
      })
    } catch (error) {
      console.error('Failed to delete student:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, students: false }))
    }
  }, [])

  const getStudent = useCallback(async (studentId: string) => {
    try {
      return await teacherDatabaseService.getStudent(studentId)
    } catch (error) {
      console.error('Failed to get student:', error)
      throw error
    }
  }, [])

  const getStudentsByClass = useCallback(async (classId: string) => {
    try {
      return await teacherDatabaseService.getStudentsByClass(classId)
    } catch (error) {
      console.error('Failed to get students by class:', error)
      throw error
    }
  }, [])

  // Class operations
  const saveClass = useCallback(async (classData: Class) => {
    try {
      setLoading(prev => ({ ...prev, classes: true }))
      await teacherDatabaseService.saveClass(classData)
      await refreshClasses()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'class',
        action: 'create',
        data: classData,
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
      })
    } catch (error) {
      console.error('Failed to save class:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, classes: false }))
    }
  }, [])

  const updateClass = useCallback(async (classData: Class) => {
    try {
      setLoading(prev => ({ ...prev, classes: true }))
      await teacherDatabaseService.saveClass(classData)
      await refreshClasses()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'class',
        action: 'update',
        data: classData,
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
      })
    } catch (error) {
      console.error('Failed to update class:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, classes: false }))
    }
  }, [])

  const getClass = useCallback(async (classId: string) => {
    try {
      return await teacherDatabaseService.getClass(classId)
    } catch (error) {
      console.error('Failed to get class:', error)
      throw error
    }
  }, [])

  const getClassesByTeacher = useCallback(async (teacherId: string) => {
    try {
      return await teacherDatabaseService.getClassesByTeacher(teacherId)
    } catch (error) {
      console.error('Failed to get classes by teacher:', error)
      throw error
    }
  }, [])

  // Attendance operations
  const saveAttendance = useCallback(async (attendanceRecord: AttendanceRecord) => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }))
      await teacherDatabaseService.saveAttendance(attendanceRecord)
      await refreshAttendance()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'attendance',
        action: 'create',
        data: attendanceRecord,
        priority: 2,
        retryCount: 0,
        maxRetries: 5,
      })
    } catch (error) {
      console.error('Failed to save attendance:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }))
    }
  }, [])

  const markAttendance = useCallback(async (
    classId: string, 
    studentId: string, 
    status: AttendanceRecord['status'], 
    notes?: string
  ) => {
    try {
      const student = await getStudent(studentId)
      if (!student) throw new Error('Student not found')

      const attendanceRecord: AttendanceRecord = {
        id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        classId,
        studentId,
        studentName: student.name,
        date: new Date(),
        status,
        markedBy: 'current-teacher', // Replace with actual teacher ID
        markedAt: new Date(),
        notes,
        synced: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await saveAttendance(attendanceRecord)
    } catch (error) {
      console.error('Failed to mark attendance:', error)
      throw error
    }
  }, [getStudent, saveAttendance])

  const getAttendance = useCallback(async (attendanceId: string) => {
    try {
      return await teacherDatabaseService.getAttendance(attendanceId)
    } catch (error) {
      console.error('Failed to get attendance:', error)
      throw error
    }
  }, [])

  const getAttendanceByClass = useCallback(async (classId: string, date?: Date) => {
    try {
      return await teacherDatabaseService.getAttendanceByClass(classId, date)
    } catch (error) {
      console.error('Failed to get attendance by class:', error)
      throw error
    }
  }, [])

  // Score operations
  const saveScore = useCallback(async (score: ScoreRecord) => {
    try {
      setLoading(prev => ({ ...prev, scores: true }))
      await teacherDatabaseService.saveScore(score)
      await refreshScores()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'score',
        action: 'create',
        data: score,
        priority: 2,
        retryCount: 0,
        maxRetries: 5,
      })
    } catch (error) {
      console.error('Failed to save score:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, scores: false }))
    }
  }, [])

  const recordScore = useCallback(async (
    studentId: string,
    classId: string,
    assignmentId: string,
    marks: number,
    maxMarks: number,
    remarks?: string
  ) => {
    try {
      const student = await getStudent(studentId)
      if (!student) throw new Error('Student not found')

      const percentage = (marks / maxMarks) * 100
      let grade = 'F'
      if (percentage >= 90) grade = 'A+'
      else if (percentage >= 80) grade = 'A'
      else if (percentage >= 70) grade = 'B+'
      else if (percentage >= 60) grade = 'B'
      else if (percentage >= 50) grade = 'C'
      else if (percentage >= 40) grade = 'D'

      const scoreRecord: ScoreRecord = {
        id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        studentName: student.name,
        classId,
        assignmentId,
        assignmentName: 'Assignment', // Get from assignment
        examType: 'assignment',
        subject: 'General', // Get from class
        maxMarks,
        obtainedMarks: marks,
        percentage,
        grade,
        remarks,
        gradedBy: 'current-teacher',
        gradedAt: new Date(),
        synced: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await saveScore(scoreRecord)
    } catch (error) {
      console.error('Failed to record score:', error)
      throw error
    }
  }, [getStudent, saveScore])

  const getScore = useCallback(async (scoreId: string) => {
    try {
      return await teacherDatabaseService.getScore(scoreId)
    } catch (error) {
      console.error('Failed to get score:', error)
      throw error
    }
  }, [])

  const getScoresByStudent = useCallback(async (studentId: string) => {
    try {
      return await teacherDatabaseService.getScoresByStudent(studentId)
    } catch (error) {
      console.error('Failed to get scores by student:', error)
      throw error
    }
  }, [])

  const getScoresByClass = useCallback(async (classId: string) => {
    try {
      return await teacherDatabaseService.getScoresByClass(classId)
    } catch (error) {
      console.error('Failed to get scores by class:', error)
      throw error
    }
  }, [])

  // Assignment operations
  const saveAssignment = useCallback(async (assignment: Assignment) => {
    try {
      setLoading(prev => ({ ...prev, assignments: true }))
      await teacherDatabaseService.saveAssignment(assignment)
      await refreshAssignments()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'assignment',
        action: 'create',
        data: assignment,
        priority: 2,
        retryCount: 0,
        maxRetries: 5,
      })
    } catch (error) {
      console.error('Failed to save assignment:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }))
    }
  }, [])

  const updateAssignment = useCallback(async (assignment: Assignment) => {
    try {
      setLoading(prev => ({ ...prev, assignments: true }))
      await teacherDatabaseService.saveAssignment(assignment)
      await refreshAssignments()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'assignment',
        action: 'update',
        data: assignment,
        priority: 2,
        retryCount: 0,
        maxRetries: 5,
      })
    } catch (error) {
      console.error('Failed to update assignment:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }))
    }
  }, [])

  const publishAssignment = useCallback(async (assignmentId: string) => {
    try {
      const assignment = await teacherDatabaseService.getAssignment(assignmentId)
      if (!assignment) throw new Error('Assignment not found')

      const updatedAssignment = {
        ...assignment,
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      }

      await updateAssignment(updatedAssignment)
    } catch (error) {
      console.error('Failed to publish assignment:', error)
      throw error
    }
  }, [updateAssignment])

  const getAssignment = useCallback(async (assignmentId: string) => {
    try {
      return await teacherDatabaseService.getAssignment(assignmentId)
    } catch (error) {
      console.error('Failed to get assignment:', error)
      throw error
    }
  }, [])

  const getAssignmentsByClass = useCallback(async (classId: string) => {
    try {
      return await teacherDatabaseService.getAssignmentsByClass(classId)
    } catch (error) {
      console.error('Failed to get assignments by class:', error)
      throw error
    }
  }, [])

  // Submission operations
  const saveSubmission = useCallback(async (submission: AssignmentSubmission) => {
    try {
      setLoading(prev => ({ ...prev, submissions: true }))
      await teacherDatabaseService.saveSubmission(submission)
      await refreshSubmissions()
      
      // Add to sync queue
      await teacherDatabaseService.addToSyncQueue({
        type: 'submission',
        action: 'create',
        data: submission,
        priority: 2,
        retryCount: 0,
        maxRetries: 5,
      })
    } catch (error) {
      console.error('Failed to save submission:', error)
      throw error
    } finally {
      setLoading(prev => ({ ...prev, submissions: false }))
    }
  }, [])

  const gradeSubmission = useCallback(async (submissionId: string, grade: number, feedback?: string) => {
    try {
      const submission = await teacherDatabaseService.getSubmission(submissionId)
      if (!submission) throw new Error('Submission not found')

      const updatedSubmission = {
        ...submission,
        grade,
        feedback,
        status: 'graded' as const,
        updatedAt: new Date(),
      }

      await saveSubmission(updatedSubmission)
    } catch (error) {
      console.error('Failed to grade submission:', error)
      throw error
    }
  }, [saveSubmission])

  const getSubmission = useCallback(async (submissionId: string) => {
    try {
      return await teacherDatabaseService.getSubmission(submissionId)
    } catch (error) {
      console.error('Failed to get submission:', error)
      throw error
    }
  }, [])

  const getSubmissionsByAssignment = useCallback(async (assignmentId: string) => {
    try {
      return await teacherDatabaseService.getSubmissionsByAssignment(assignmentId)
    } catch (error) {
      console.error('Failed to get submissions by assignment:', error)
      throw error
    }
  }, [])

  // Refresh functions
  const refreshStudents = useCallback(async () => {
    try {
      const data = await teacherDatabaseService.getAllStudents()
      setStudents(data)
    } catch (error) {
      console.error('Failed to refresh students:', error)
    }
  }, [])

  const refreshClasses = useCallback(async () => {
    try {
      const data = await teacherDatabaseService.getAllClasses()
      setClasses(data)
    } catch (error) {
      console.error('Failed to refresh classes:', error)
    }
  }, [])

  const refreshAttendance = useCallback(async () => {
    try {
      const data = await teacherDatabaseService.getUnsyncedAttendance()
      setAttendance(data)
    } catch (error) {
      console.error('Failed to refresh attendance:', error)
    }
  }, [])

  const refreshScores = useCallback(async () => {
    try {
      const data = await teacherDatabaseService.getUnsyncedScores()
      setScores(data)
    } catch (error) {
      console.error('Failed to refresh scores:', error)
    }
  }, [])

  const refreshAssignments = useCallback(async () => {
    try {
      const data = await teacherDatabaseService.getUnsyncedAssignments()
      setAssignments(data)
    } catch (error) {
      console.error('Failed to refresh assignments:', error)
    }
  }, [])

  const refreshSubmissions = useCallback(async () => {
    try {
      const data = await teacherDatabaseService.getUnsyncedSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error('Failed to refresh submissions:', error)
    }
  }, [])

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refreshStudents(),
      refreshClasses(),
      refreshAttendance(),
      refreshScores(),
      refreshAssignments(),
      refreshSubmissions(),
    ])
  }, [refreshStudents, refreshClasses, refreshAttendance, refreshScores, refreshAssignments, refreshSubmissions])

  // Sync operations
  const syncAllData = useCallback(async () => {
    if (!isOnline) {
      console.log('Cannot sync: offline')
      return
    }

    try {
      setLoading(prev => ({ ...prev, sync: true }))
      
      const syncQueue = await teacherDatabaseService.getSyncQueue()
      const results = await teacherFirebaseSyncService.processSyncQueue(syncQueue)
      
      console.log('Sync completed:', results)
      
      // Clear successfully synced items
      for (const item of syncQueue.slice(0, results.processed)) {
        await teacherDatabaseService.removeFromSyncQueue(item.id)
      }
      
      // Refresh data after sync
      await refreshAllData()
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingRecords: 0,
      }))
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setLoading(prev => ({ ...prev, sync: false }))
    }
  }, [isOnline, refreshAllData])

  const syncAttendance = useCallback(async () => {
    if (!isOnline) return
    
    try {
      setLoading(prev => ({ ...prev, sync: true }))
      const unsyncedAttendance = await teacherDatabaseService.getUnsyncedAttendance()
      const results = await teacherFirebaseSyncService.syncAttendanceBatch(unsyncedAttendance)
      console.log('Attendance sync completed:', results)
      await refreshAttendance()
    } catch (error) {
      console.error('Attendance sync failed:', error)
    } finally {
      setLoading(prev => ({ ...prev, sync: false }))
    }
  }, [isOnline, refreshAttendance])

  const syncScores = useCallback(async () => {
    if (!isOnline) return
    
    try {
      setLoading(prev => ({ ...prev, sync: true }))
      const unsyncedScores = await teacherDatabaseService.getUnsyncedScores()
      const results = await teacherFirebaseSyncService.syncScoreBatch(unsyncedScores)
      console.log('Scores sync completed:', results)
      await refreshScores()
    } catch (error) {
      console.error('Scores sync failed:', error)
    } finally {
      setLoading(prev => ({ ...prev, sync: false }))
    }
  }, [isOnline, refreshScores])

  const syncAssignments = useCallback(async () => {
    if (!isOnline) return
    
    try {
      setLoading(prev => ({ ...prev, sync: true }))
      const unsyncedAssignments = await teacherDatabaseService.getUnsyncedAssignments()
      for (const assignment of unsyncedAssignments) {
        await teacherFirebaseSyncService.syncAssignment(assignment)
      }
      await refreshAssignments()
    } catch (error) {
      console.error('Assignments sync failed:', error)
    } finally {
      setLoading(prev => ({ ...prev, sync: false }))
    }
  }, [isOnline, refreshAssignments])

  const syncSubmissions = useCallback(async () => {
    if (!isOnline) return
    
    try {
      setLoading(prev => ({ ...prev, sync: true }))
      const unsyncedSubmissions = await teacherDatabaseService.getUnsyncedSubmissions()
      for (const submission of unsyncedSubmissions) {
        await teacherFirebaseSyncService.syncSubmission(submission)
      }
      await refreshSubmissions()
    } catch (error) {
      console.error('Submissions sync failed:', error)
    } finally {
      setLoading(prev => ({ ...prev, sync: false }))
    }
  }, [isOnline, refreshSubmissions])

  // Utility operations
  const getDashboardStats = useCallback(async (teacherId: string) => {
    try {
      return await teacherDatabaseService.getDashboardStats(teacherId)
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      throw error
    }
  }, [])

  const exportData = useCallback(async () => {
    try {
      return await teacherDatabaseService.exportTeacherData()
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }, [])

  return {
    // Database state
    isDatabaseReady,
    databaseError,
    
    // Data state
    students,
    classes,
    attendance,
    scores,
    assignments,
    submissions,
    
    // Loading states
    loading,
    
    // Sync state
    isOnline,
    syncStatus,
    
    // Student operations
    saveStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    getStudentsByClass,
    
    // Class operations
    saveClass,
    updateClass,
    getClass,
    getClassesByTeacher,
    
    // Attendance operations
    saveAttendance,
    getAttendance,
    getAttendanceByClass,
    markAttendance,
    
    // Score operations
    saveScore,
    getScore,
    getScoresByStudent,
    getScoresByClass,
    recordScore,
    
    // Assignment operations
    saveAssignment,
    updateAssignment,
    getAssignment,
    getAssignmentsByClass,
    publishAssignment,
    
    // Submission operations
    saveSubmission,
    getSubmission,
    getSubmissionsByAssignment,
    gradeSubmission,
    
    // Sync operations
    syncAllData,
    syncAttendance,
    syncScores,
    syncAssignments,
    syncSubmissions,
    
    // Utility operations
    refreshAllData,
    getDashboardStats,
    exportData,
  }
}
