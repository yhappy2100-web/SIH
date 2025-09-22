// Teacher Dashboard page with offline attendance, scores, and assignment management
import { useState, useEffect } from 'react'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import { useLanguage } from '../contexts/LanguageContext'
import Card from '../components/Card'
import AttendanceRecorder from '../components/AttendanceRecorder'
import ScoreManager from '../components/ScoreManager'
import AssignmentManager from '../components/AssignmentManager'
import StudentManager from '../components/StudentManager'

const TeacherDashboard = () => {
  const { t } = useLanguage()
  const {
    isDatabaseReady,
    databaseError,
    students,
    classes,
    attendance,
    scores,
    assignments,
    submissions,
    loading,
    isOnline,
    syncStatus,
    syncAllData,
    getDashboardStats,
  } = useTeacherDashboard()

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'scores' | 'assignments' | 'students'>('overview')
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      if (isDatabaseReady) {
        try {
          const stats = await getDashboardStats('current-teacher')
          setDashboardStats(stats)
        } catch (error) {
          console.error('Failed to load dashboard stats:', error)
        }
      }
    }

    loadStats()
  }, [isDatabaseReady, getDashboardStats])

  // Set default class
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id)
    }
  }, [classes, selectedClass])

  if (!isDatabaseReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing teacher dashboard...</p>
          {databaseError && (
            <p className="text-red-600 mt-2">Error: {databaseError}</p>
          )}
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'attendance', label: 'Attendance', icon: '📝' },
    { id: 'scores', label: 'Scores', icon: '📈' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'students', label: 'Students', icon: '👥' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-punjab px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600">
                Manage attendance, scores, and assignments offline
              </p>
            </div>
            
            {/* Sync Status */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {syncStatus.pendingRecords > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-yellow-600">
                    {syncStatus.pendingRecords} pending sync
                  </span>
                  <button
                    onClick={syncAllData}
                    disabled={!isOnline || loading.sync}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {loading.sync ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-punjab py-8">
        {/* Class Selector */}
        {classes.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.subject}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={dashboardStats}
              students={students}
              classes={classes}
              attendance={attendance}
              scores={scores}
              assignments={assignments}
              submissions={submissions}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceRecorder 
              classId={selectedClass}
              students={students.filter(s => s.classId === selectedClass)}
            />
          )}

          {activeTab === 'scores' && (
            <ScoreManager 
              classId={selectedClass}
              students={students.filter(s => s.classId === selectedClass)}
              scores={scores}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentManager 
              classId={selectedClass}
              assignments={assignments.filter(a => a.classId === selectedClass)}
            />
          )}

          {activeTab === 'students' && (
            <StudentManager 
              classId={selectedClass}
              students={students.filter(s => s.classId === selectedClass)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
const OverviewTab = ({ stats, students, classes, attendance, scores, assignments, submissions }: any) => {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard stats...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {stats.totalStudents}
          </div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-secondary-600 mb-2">
            {stats.totalClasses}
          </div>
          <div className="text-sm text-gray-600">Classes</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats.todayAttendance}
          </div>
          <div className="text-sm text-gray-600">Today's Attendance</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.pendingAssignments}
          </div>
          <div className="text-sm text-gray-600">Pending Assignments</div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Attendance
          </h3>
          <div className="space-y-3">
            {attendance.slice(0, 5).map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{record.studentName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent attendance records</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Scores
          </h3>
          <div className="space-y-3">
            {scores.slice(0, 5).map((score: any) => (
              <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{score.studentName}</p>
                  <p className="text-sm text-gray-600">{score.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {score.obtainedMarks}/{score.maxMarks}
                  </p>
                  <p className="text-sm text-gray-600">{score.grade}</p>
                </div>
              </div>
            ))}
            {scores.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent scores</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium">Mark Attendance</div>
          </button>
          <button className="p-4 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm font-medium">Record Scores</div>
          </button>
          <button className="p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">Create Assignment</div>
          </button>
          <button className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Manage Students</div>
          </button>
        </div>
      </Card>
    </div>
  )
}

export default TeacherDashboard
