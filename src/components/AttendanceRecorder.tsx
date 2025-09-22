// Attendance recording component for teachers
import { useState, useEffect } from 'react'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import { useLanguage } from '../contexts/LanguageContext'
import { Student, AttendanceRecord } from '../services/teacherDatabase'
import Card from './Card'

interface AttendanceRecorderProps {
  classId: string
  students: Student[]
}

const AttendanceRecorder: React.FC<AttendanceRecorderProps> = ({ classId, students }) => {
  const { t } = useLanguage()
  const { markAttendance, getAttendanceByClass, loading } = useTeacherDashboard()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [studentAttendance, setStudentAttendance] = useState<Record<string, AttendanceRecord['status']>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing attendance for selected date
  useEffect(() => {
    const loadAttendance = async () => {
      if (classId) {
        try {
          const records = await getAttendanceByClass(classId, selectedDate)
          setAttendanceRecords(records)
          
          // Initialize student attendance state
          const attendanceMap: Record<string, AttendanceRecord['status']> = {}
          const notesMap: Record<string, string> = {}
          
          records.forEach(record => {
            attendanceMap[record.studentId] = record.status
            if (record.notes) {
              notesMap[record.studentId] = record.notes
            }
          })
          
          setStudentAttendance(attendanceMap)
          setNotes(notesMap)
        } catch (error) {
          console.error('Failed to load attendance:', error)
        }
      }
    }

    loadAttendance()
  }, [classId, selectedDate, getAttendanceByClass])

  const handleAttendanceChange = (studentId: string, status: AttendanceRecord['status']) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleNotesChange = (studentId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: note
    }))
  }

  const handleSubmitAttendance = async () => {
    if (!classId) return

    setIsSubmitting(true)
    try {
      for (const student of students) {
        const status = studentAttendance[student.id] || 'absent'
        const note = notes[student.id] || ''
        
        await markAttendance(classId, student.id, status, note)
      }
      
      // Reload attendance records
      const records = await getAttendanceByClass(classId, selectedDate)
      setAttendanceRecords(records)
      
      alert('Attendance recorded successfully!')
    } catch (error) {
      console.error('Failed to submit attendance:', error)
      alert('Failed to record attendance. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 }
    Object.values(studentAttendance).forEach(status => {
      counts[status]++
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  if (!classId) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Class Selected
        </h3>
        <p className="text-gray-600">
          Please select a class to record attendance
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Attendance Recording
            </h2>
            <p className="text-gray-600">
              Record attendance for {students.length} students
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{statusCounts.present}</div>
            <div className="text-sm text-green-700">Present</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{statusCounts.absent}</div>
            <div className="text-sm text-red-700">Absent</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.late}</div>
            <div className="text-sm text-yellow-700">Late</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.excused}</div>
            <div className="text-sm text-blue-700">Excused</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const allPresent: Record<string, AttendanceRecord['status']> = {}
              students.forEach(student => {
                allPresent[student.id] = 'present'
              })
              setStudentAttendance(allPresent)
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
          >
            Mark All Present
          </button>
          <button
            onClick={() => {
              const allAbsent: Record<string, AttendanceRecord['status']> = {}
              students.forEach(student => {
                allAbsent[student.id] = 'absent'
              })
              setStudentAttendance(allAbsent)
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            Mark All Absent
          </button>
          <button
            onClick={() => {
              setStudentAttendance({})
              setNotes({})
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Clear All
          </button>
        </div>
      </Card>

      {/* Student List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Student Attendance
        </h3>
        
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {student.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Roll: {student.rollNumber}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {['present', 'absent', 'late', 'excused'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleAttendanceChange(student.id, status as AttendanceRecord['status'])}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      studentAttendance[student.id] === status
                        ? getStatusColor(status as AttendanceRecord['status'])
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex-shrink-0">
                <input
                  type="text"
                  placeholder="Notes..."
                  value={notes[student.id] || ''}
                  onChange={(e) => handleNotesChange(student.id, e.target.value)}
                  className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">👥</div>
            <p className="text-gray-500">No students found for this class</p>
          </div>
        )}
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmitAttendance}
          disabled={isSubmitting || loading.attendance}
          className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading.attendance ? 'Recording...' : 'Record Attendance'}
        </button>
      </div>

      {/* Existing Records */}
      {attendanceRecords.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Existing Records for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-2">
            {attendanceRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{record.studentName}</p>
                  <p className="text-sm text-gray-600">
                    Marked at {new Date(record.markedAt).toLocaleTimeString()}
                    {record.notes && ` • ${record.notes}`}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AttendanceRecorder
