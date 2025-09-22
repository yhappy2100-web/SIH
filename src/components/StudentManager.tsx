// Student management component for teachers
import { useState, useEffect } from 'react'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import { useLanguage } from '../contexts/LanguageContext'
import { Student } from '../services/teacherDatabase'
import Card from './Card'

interface StudentManagerProps {
  classId: string
  students: Student[]
}

const StudentManager: React.FC<StudentManagerProps> = ({ classId, students }) => {
  const { t } = useLanguage()
  const { 
    saveStudent, 
    updateStudent, 
    deleteStudent, 
    getScoresByStudent,
    getAttendanceByClass,
    loading 
  } = useTeacherDashboard()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [studentStats, setStudentStats] = useState<Record<string, any>>({})
  
  // Form state
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    dateOfBirth: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter students based on search query
  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredStudents(filtered)
  }, [students, searchQuery])

  // Load student stats
  useEffect(() => {
    const loadStudentStats = async () => {
      const stats: Record<string, any> = {}
      
      for (const student of students) {
        try {
          const scores = await getScoresByStudent(student.id)
          const attendance = await getAttendanceByClass(classId)
          const studentAttendance = attendance.filter(a => a.studentId === student.id)
          
          const totalMarks = scores.reduce((sum, score) => sum + score.obtainedMarks, 0)
          const totalMaxMarks = scores.reduce((sum, score) => sum + score.maxMarks, 0)
          const averagePercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0
          
          const presentCount = studentAttendance.filter(a => a.status === 'present').length
          const totalAttendance = studentAttendance.length
          const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0
          
          stats[student.id] = {
            averagePercentage: Math.round(averagePercentage),
            attendancePercentage: Math.round(attendancePercentage),
            totalScores: scores.length,
            totalAttendance: totalAttendance,
            presentCount,
          }
        } catch (error) {
          console.error('Failed to load stats for student:', student.id, error)
        }
      }
      
      setStudentStats(stats)
    }

    if (students.length > 0) {
      loadStudentStats()
    }
  }, [students, classId, getScoresByStudent, getAttendanceByClass])

  const handleCreateStudent = async () => {
    if (!formData.rollNumber || !formData.name) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const student: Student = {
        id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rollNumber: formData.rollNumber,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        classId,
        className: 'Current Class', // Get from class data
        section: 'A', // Get from class data
        parentName: formData.parentName || undefined,
        parentPhone: formData.parentPhone || undefined,
        address: formData.address || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        admissionDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await saveStudent(student)
      
      // Reset form
      setFormData({
        rollNumber: '',
        name: '',
        email: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        address: '',
        dateOfBirth: '',
      })
      setShowCreateForm(false)
      
      alert('Student added successfully!')
    } catch (error) {
      console.error('Failed to create student:', error)
      alert('Failed to add student. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : '',
    })
    setShowCreateForm(true)
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    setIsSubmitting(true)
    try {
      const updatedStudent: Student = {
        ...editingStudent,
        rollNumber: formData.rollNumber,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        parentName: formData.parentName || undefined,
        parentPhone: formData.parentPhone || undefined,
        address: formData.address || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        updatedAt: new Date(),
      }

      await updateStudent(updatedStudent)
      
      // Reset form
      setEditingStudent(null)
      setFormData({
        rollNumber: '',
        name: '',
        email: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        address: '',
        dateOfBirth: '',
      })
      setShowCreateForm(false)
      
      alert('Student updated successfully!')
    } catch (error) {
      console.error('Failed to update student:', error)
      alert('Failed to update student. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return
    }

    try {
      await deleteStudent(studentId)
      alert('Student deleted successfully!')
    } catch (error) {
      console.error('Failed to delete student:', error)
      alert('Failed to delete student. Please try again.')
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!classId) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Class Selected
        </h3>
        <p className="text-gray-600">
          Please select a class to manage students
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Student Management
          </h2>
          <p className="text-gray-600">
            Manage {students.length} students in this class
          </p>
        </div>
        
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Add Student
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                placeholder="Student roll number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Student full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="student@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Name
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                placeholder="Parent/Guardian name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Phone
              </label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Student address"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowCreateForm(false)
                setEditingStudent(null)
                setFormData({
                  rollNumber: '',
                  name: '',
                  email: '',
                  phone: '',
                  parentName: '',
                  parentPhone: '',
                  address: '',
                  dateOfBirth: '',
                })
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingStudent ? handleUpdateStudent : handleCreateStudent}
              disabled={isSubmitting || loading.students || !formData.rollNumber || !formData.name}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading.students ? 'Saving...' : editingStudent ? 'Update' : 'Add Student'}
            </button>
          </div>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Students ({filteredStudents.length})
        </h3>
        
        <div className="space-y-4">
          {filteredStudents.map((student) => {
            const stats = studentStats[student.id]
            return (
              <div key={student.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                      {student.email && (
                        <p className="text-sm text-gray-500">{student.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Student Stats */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className={`font-semibold ${getGradeColor(stats.averagePercentage)}`}>
                        {stats.averagePercentage}%
                      </div>
                      <div className="text-gray-600">Average</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${getAttendanceColor(stats.attendancePercentage)}`}>
                        {stats.attendancePercentage}%
                      </div>
                      <div className="text-gray-600">Attendance</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">{stats.totalScores}</div>
                      <div className="text-gray-600">Scores</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">
                        {stats.presentCount}/{stats.totalAttendance}
                      </div>
                      <div className="text-gray-600">Present</div>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {(student.phone || student.parentName || student.parentPhone) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {student.phone && (
                        <div>Phone: {student.phone}</div>
                      )}
                      {student.parentName && (
                        <div>Parent: {student.parentName}</div>
                      )}
                      {student.parentPhone && (
                        <div>Parent Phone: {student.parentPhone}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">👥</div>
              <p className="text-gray-500">
                {searchQuery ? 'No students found matching your search' : 'No students added yet'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default StudentManager
