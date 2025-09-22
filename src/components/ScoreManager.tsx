// Score management component for teachers
import { useState, useEffect } from 'react'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import { useLanguage } from '../contexts/LanguageContext'
import { Student, ScoreRecord } from '../services/teacherDatabase'
import Card from './Card'

interface ScoreManagerProps {
  classId: string
  students: Student[]
  scores: ScoreRecord[]
}

const ScoreManager: React.FC<ScoreManagerProps> = ({ classId, students, scores }) => {
  const { t } = useLanguage()
  const { recordScore, getScoresByClass, loading } = useTeacherDashboard()
  
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedAssignment, setSelectedAssignment] = useState<string>('')
  const [obtainedMarks, setObtainedMarks] = useState<string>('')
  const [maxMarks, setMaxMarks] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classScores, setClassScores] = useState<ScoreRecord[]>([])

  // Load scores for the class
  useEffect(() => {
    const loadScores = async () => {
      if (classId) {
        try {
          const scores = await getScoresByClass(classId)
          setClassScores(scores)
        } catch (error) {
          console.error('Failed to load scores:', error)
        }
      }
    }

    loadScores()
  }, [classId, getScoresByClass])

  const handleSubmitScore = async () => {
    if (!selectedStudent || !obtainedMarks || !maxMarks) {
      alert('Please fill in all required fields')
      return
    }

    const marks = parseFloat(obtainedMarks)
    const max = parseFloat(maxMarks)

    if (isNaN(marks) || isNaN(max) || marks < 0 || max <= 0 || marks > max) {
      alert('Please enter valid marks')
      return
    }

    setIsSubmitting(true)
    try {
      await recordScore(
        selectedStudent,
        classId,
        selectedAssignment || 'general',
        marks,
        max,
        remarks || undefined
      )
      
      // Reload scores
      const updatedScores = await getScoresByClass(classId)
      setClassScores(updatedScores)
      
      // Reset form
      setSelectedStudent('')
      setSelectedAssignment('')
      setObtainedMarks('')
      setMaxMarks('')
      setRemarks('')
      
      alert('Score recorded successfully!')
    } catch (error) {
      console.error('Failed to record score:', error)
      alert('Failed to record score. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800'
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800'
      case 'C':
        return 'bg-yellow-100 text-yellow-800'
      case 'D':
        return 'bg-orange-100 text-orange-800'
      case 'F':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStudentStats = (studentId: string) => {
    const studentScores = classScores.filter(score => score.studentId === studentId)
    if (studentScores.length === 0) return null

    const totalMarks = studentScores.reduce((sum, score) => sum + score.obtainedMarks, 0)
    const totalMaxMarks = studentScores.reduce((sum, score) => sum + score.maxMarks, 0)
    const averagePercentage = (totalMarks / totalMaxMarks) * 100

    return {
      totalScores: studentScores.length,
      averagePercentage: Math.round(averagePercentage),
      totalMarks,
      totalMaxMarks
    }
  }

  if (!classId) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Class Selected
        </h3>
        <p className="text-gray-600">
          Please select a class to manage scores
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Score Form */}
      <Card>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Record New Score
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment (Optional)
            </label>
            <input
              type="text"
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              placeholder="Assignment name or ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obtained Marks *
            </label>
            <input
              type="number"
              value={obtainedMarks}
              onChange={(e) => setObtainedMarks(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Marks *
            </label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              placeholder="100"
              min="1"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Additional comments or feedback..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmitScore}
            disabled={isSubmitting || loading.scores || !selectedStudent || !obtainedMarks || !maxMarks}
            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading.scores ? 'Recording...' : 'Record Score'}
          </button>
        </div>
      </Card>

      {/* Student Scores Overview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Student Performance Overview
        </h3>
        
        <div className="space-y-4">
          {students.map((student) => {
            const stats = getStudentStats(student.id)
            return (
              <div key={student.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{student.name}</h4>
                    <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                  </div>
                  {stats && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        {stats.averagePercentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {stats.totalScores} scores
                      </div>
                    </div>
                  )}
                </div>

                {stats ? (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-800">{stats.totalMarks}</div>
                      <div className="text-gray-600">Total Marks</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-800">{stats.totalMaxMarks}</div>
                      <div className="text-gray-600">Max Marks</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-800">
                        {stats.averagePercentage >= 80 ? 'A' :
                         stats.averagePercentage >= 70 ? 'B' :
                         stats.averagePercentage >= 60 ? 'C' :
                         stats.averagePercentage >= 50 ? 'D' : 'F'}
                      </div>
                      <div className="text-gray-600">Grade</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2">No scores recorded yet</p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent Scores */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Scores
        </h3>
        
        <div className="space-y-3">
          {classScores.slice(0, 10).map((score) => (
            <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{score.studentName}</p>
                <p className="text-sm text-gray-600">
                  {score.assignmentName || 'General'} • {score.subject}
                </p>
                {score.remarks && (
                  <p className="text-sm text-gray-500 mt-1">{score.remarks}</p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800">
                    {score.obtainedMarks}/{score.maxMarks}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(score.grade)}`}>
                    {score.grade}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {score.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
          
          {classScores.length === 0 && (
            <p className="text-gray-500 text-center py-8">No scores recorded yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ScoreManager
