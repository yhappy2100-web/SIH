// Assignment management component for teachers
import { useState, useEffect } from 'react'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import { useLanguage } from '../contexts/LanguageContext'
import { Assignment, AssignmentSubmission } from '../services/teacherDatabase'
import Card from './Card'

interface AssignmentManagerProps {
  classId: string
  assignments: Assignment[]
}

const AssignmentManager: React.FC<AssignmentManagerProps> = ({ classId, assignments }) => {
  const { t } = useLanguage()
  const { 
    saveAssignment, 
    updateAssignment, 
    publishAssignment, 
    getAssignmentsByClass,
    getSubmissionsByAssignment,
    loading 
  } = useTeacherDashboard()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [classAssignments, setClassAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission[]>>({})
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxMarks: '',
    dueDate: '',
    instructions: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load assignments and submissions
  useEffect(() => {
    const loadData = async () => {
      if (classId) {
        try {
          const assignments = await getAssignmentsByClass(classId)
          setClassAssignments(assignments)
          
          // Load submissions for each assignment
          const submissionsData: Record<string, AssignmentSubmission[]> = {}
          for (const assignment of assignments) {
            const assignmentSubmissions = await getSubmissionsByAssignment(assignment.id)
            submissionsData[assignment.id] = assignmentSubmissions
          }
          setSubmissions(submissionsData)
        } catch (error) {
          console.error('Failed to load assignments:', error)
        }
      }
    }

    loadData()
  }, [classId, getAssignmentsByClass, getSubmissionsByAssignment])

  const handleCreateAssignment = async () => {
    if (!formData.title || !formData.maxMarks || !formData.dueDate) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const assignment: Assignment = {
        id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        description: formData.description,
        classId,
        className: 'Current Class', // Get from class data
        subject: 'General', // Get from class data
        teacherId: 'current-teacher',
        teacherName: 'Current Teacher',
        maxMarks: parseFloat(formData.maxMarks),
        dueDate: new Date(formData.dueDate),
        instructions: formData.instructions,
        isPublished: false,
        totalSubmissions: 0,
        synced: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await saveAssignment(assignment)
      
      // Reload assignments
      const updatedAssignments = await getAssignmentsByClass(classId)
      setClassAssignments(updatedAssignments)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        maxMarks: '',
        dueDate: '',
        instructions: '',
      })
      setShowCreateForm(false)
      
      alert('Assignment created successfully!')
    } catch (error) {
      console.error('Failed to create assignment:', error)
      alert('Failed to create assignment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublishAssignment = async (assignmentId: string) => {
    try {
      await publishAssignment(assignmentId)
      
      // Reload assignments
      const updatedAssignments = await getAssignmentsByClass(classId)
      setClassAssignments(updatedAssignments)
      
      alert('Assignment published successfully!')
    } catch (error) {
      console.error('Failed to publish assignment:', error)
      alert('Failed to publish assignment. Please try again.')
    }
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description,
      maxMarks: assignment.maxMarks.toString(),
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      instructions: assignment.instructions || '',
    })
    setShowCreateForm(true)
  }

  const handleUpdateAssignment = async () => {
    if (!editingAssignment) return

    setIsSubmitting(true)
    try {
      const updatedAssignment: Assignment = {
        ...editingAssignment,
        title: formData.title,
        description: formData.description,
        maxMarks: parseFloat(formData.maxMarks),
        dueDate: new Date(formData.dueDate),
        instructions: formData.instructions,
        updatedAt: new Date(),
      }

      await updateAssignment(updatedAssignment)
      
      // Reload assignments
      const updatedAssignments = await getAssignmentsByClass(classId)
      setClassAssignments(updatedAssignments)
      
      // Reset form
      setEditingAssignment(null)
      setFormData({
        title: '',
        description: '',
        maxMarks: '',
        dueDate: '',
        instructions: '',
      })
      setShowCreateForm(false)
      
      alert('Assignment updated successfully!')
    } catch (error) {
      console.error('Failed to update assignment:', error)
      alert('Failed to update assignment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (assignment: Assignment) => {
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    
    if (!assignment.isPublished) {
      return 'bg-gray-100 text-gray-800'
    } else if (dueDate < now) {
      return 'bg-red-100 text-red-800'
    } else {
      return 'bg-green-100 text-green-800'
    }
  }

  const getStatusText = (assignment: Assignment) => {
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    
    if (!assignment.isPublished) {
      return 'Draft'
    } else if (dueDate < now) {
      return 'Overdue'
    } else {
      return 'Active'
    }
  }

  if (!classId) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Class Selected
        </h3>
        <p className="text-gray-600">
          Please select a class to manage assignments
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Assignment Management
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          Create Assignment
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Assignment title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Assignment description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Marks *
                </label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: e.target.value }))}
                  placeholder="100"
                  min="1"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Assignment instructions for students"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowCreateForm(false)
                setEditingAssignment(null)
                setFormData({
                  title: '',
                  description: '',
                  maxMarks: '',
                  dueDate: '',
                  instructions: '',
                })
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
              disabled={isSubmitting || loading.assignments || !formData.title || !formData.maxMarks || !formData.dueDate}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading.assignments ? 'Saving...' : editingAssignment ? 'Update' : 'Create'}
            </button>
          </div>
        </Card>
      )}

      {/* Assignments List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Assignments ({classAssignments.length})
        </h3>
        
        <div className="space-y-4">
          {classAssignments.map((assignment) => (
            <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {assignment.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {assignment.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Max Marks: {assignment.maxMarks}</span>
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <span>Submissions: {submissions[assignment.id]?.length || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment)}`}>
                    {getStatusText(assignment)}
                  </span>
                  
                  <div className="flex space-x-1">
                    {!assignment.isPublished && (
                      <button
                        onClick={() => handlePublishAssignment(assignment.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAssignment(assignment)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {assignment.instructions && (
                <div className="mt-3 p-3 bg-white rounded border-l-4 border-primary-200">
                  <p className="text-sm text-gray-700">
                    <strong>Instructions:</strong> {assignment.instructions}
                  </p>
                </div>
              )}

              {/* Submissions Preview */}
              {submissions[assignment.id] && submissions[assignment.id].length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Recent Submissions ({submissions[assignment.id].length})
                  </h5>
                  <div className="space-y-2">
                    {submissions[assignment.id].slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                        <span className="text-gray-800">{submission.studentName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            submission.status === 'graded' ? 'bg-green-100 text-green-700' :
                            submission.status === 'returned' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {submissions[assignment.id].length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{submissions[assignment.id].length - 3} more submissions
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {classAssignments.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📋</div>
              <p className="text-gray-500">No assignments created yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default AssignmentManager
