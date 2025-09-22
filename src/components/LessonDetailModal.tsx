// Lesson detail modal component
import { useState } from 'react'
import { Lesson } from '../services/database'
import { useLanguage } from '../contexts/LanguageContext'
import { lessonApiService } from '../services/lessonApi'

interface LessonDetailModalProps {
  lesson: Lesson | null
  isOpen: boolean
  onClose: () => void
  onStartLesson: (lesson: Lesson) => void
}

const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onStartLesson,
}) => {
  const { t } = useLanguage()
  const [downloadingResources, setDownloadingResources] = useState<Set<string>>(new Set())
  const [downloadedResources, setDownloadedResources] = useState<Set<string>>(new Set())

  if (!isOpen || !lesson) return null

  const handleDownloadResource = async (resourceId: string) => {
    setDownloadingResources(prev => new Set(prev).add(resourceId))
    
    try {
      const blob = await lessonApiService.downloadResource(resourceId, lesson.id)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resource-${resourceId}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      setDownloadedResources(prev => new Set(prev).add(resourceId))
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloadingResources(prev => {
        const newSet = new Set(prev)
        newSet.delete(resourceId)
        return newSet
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return t('lessons.difficulty.beginner')
      case 'intermediate':
        return t('lessons.difficulty.intermediate')
      case 'advanced':
        return t('lessons.difficulty.advanced')
      default:
        return difficulty
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {lesson.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {lesson.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lesson Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{t('lessons.duration')}:</span>
                <span className="font-medium">{lesson.duration} {t('lessons.minutes')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Difficulty:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                  {getDifficultyText(lesson.difficulty)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.isOffline ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {lesson.isOffline ? t('lessons.offline') : t('lessons.online')}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Content</h4>
              <p className="text-gray-700 leading-relaxed">
                {lesson.content}
              </p>
            </div>

            {/* Learning Objectives */}
            {lesson.learningObjectives.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('lesson.objectives')}
                </h4>
                <ul className="space-y-2">
                  {lesson.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {lesson.prerequisites.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('lesson.prerequisites')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {lesson.prerequisites.map((prereq, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {lesson.resources.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  {t('lesson.resources')}
                </h4>
                <div className="space-y-3">
                  {lesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {resource.type === 'pdf' && '📄'}
                          {resource.type === 'image' && '🖼️'}
                          {resource.type === 'video' && '🎥'}
                          {resource.type === 'audio' && '🎵'}
                          {resource.type === 'link' && '🔗'}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{resource.title}</h5>
                          <p className="text-sm text-gray-500">
                            {resource.type.toUpperCase()}
                            {resource.size && ` • ${(resource.size / 1024 / 1024).toFixed(1)} MB`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadResource(resource.id)}
                        disabled={downloadingResources.has(resource.id) || downloadedResources.has(resource.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          downloadedResources.has(resource.id)
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : downloadingResources.has(resource.id)
                            ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        }`}
                      >
                        {downloadedResources.has(resource.id)
                          ? t('lesson.downloaded')
                          : downloadingResources.has(resource.id)
                          ? t('lesson.downloading')
                          : t('lesson.download')
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('lesson.close')}
              </button>
              <button
                onClick={() => onStartLesson(lesson)}
                className="btn-primary"
              >
                {t('lesson.start_lesson')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonDetailModal
