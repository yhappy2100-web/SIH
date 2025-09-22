// Demo component to showcase offline functionality
import { useState, useEffect } from 'react'
import { useOfflineData } from '../hooks/useOfflineData'
import Card from './Card'

const OfflineDemo = () => {
  const {
    isDatabaseReady,
    databaseError,
    lessons,
    quizzes,
    attendance,
    progress,
    isOnline,
    hasUnsyncedData,
    syncData,
    clearCache,
    saveLesson,
    saveQuiz,
    saveAttendance,
    saveProgress,
  } = useOfflineData()

  const [demoLesson, setDemoLesson] = useState({
    id: '',
    title: '',
    description: '',
    content: '',
    category: 'demo',
    difficulty: 'beginner' as const,
    duration: 30,
  })

  const [demoQuiz, setDemoQuiz] = useState({
    id: '',
    lessonId: '',
    title: '',
    description: '',
    questions: [],
    passingScore: 70,
    attempts: 0,
  })

  const [storageInfo, setStorageInfo] = useState<any>(null)

  useEffect(() => {
    if (isDatabaseReady) {
      loadStorageInfo()
    }
  }, [isDatabaseReady])

  const loadStorageInfo = async () => {
    try {
      const info = await navigator.storage?.estimate()
      setStorageInfo(info)
    } catch (error) {
      console.error('Failed to load storage info:', error)
    }
  }

  const addDemoLesson = async () => {
    const lesson = {
      ...demoLesson,
      id: `demo-lesson-${Date.now()}`,
      content: 'This is a demo lesson content for offline testing.',
      resources: [],
      prerequisites: [],
      learningObjectives: ['Learn offline functionality'],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isOffline: true,
    }
    
    await saveLesson(lesson)
    setDemoLesson({
      id: '',
      title: '',
      description: '',
      content: '',
      category: 'demo',
      difficulty: 'beginner',
      duration: 30,
    })
  }

  const addDemoQuiz = async () => {
    const quiz = {
      ...demoQuiz,
      id: `demo-quiz-${Date.now()}`,
      lessonId: lessons[0]?.id || 'demo-lesson',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice' as const,
          question: 'What is the main benefit of offline learning?',
          options: ['Faster internet', 'Learn anywhere', 'More expensive', 'Less content'],
          correctAnswer: 'Learn anywhere',
          points: 10,
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isOffline: true,
    }
    
    await saveQuiz(quiz)
    setDemoQuiz({
      id: '',
      lessonId: '',
      title: '',
      description: '',
      questions: [],
      passingScore: 70,
      attempts: 0,
    })
  }

  const addDemoAttendance = async () => {
    const attendanceRecord = {
      id: `demo-attendance-${Date.now()}`,
      userId: 'demo-user',
      lessonId: lessons[0]?.id || 'demo-lesson',
      date: new Date(),
      duration: 30,
      status: 'present' as const,
      notes: 'Demo attendance record',
      synced: false,
    }
    
    await saveAttendance(attendanceRecord)
  }

  const addDemoProgress = async () => {
    const progressRecord = {
      id: `demo-progress-${Date.now()}`,
      userId: 'demo-user',
      lessonId: lessons[0]?.id || 'demo-lesson',
      type: 'lesson' as const,
      status: 'completed' as const,
      score: 85,
      timeSpent: 25,
      lastAccessed: new Date(),
      completedAt: new Date(),
      data: { notes: 'Demo progress record' },
      synced: false,
    }
    
    await saveProgress(progressRecord)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isDatabaseReady) {
    return (
      <Card className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing offline database...</p>
        {databaseError && (
          <p className="text-red-600 mt-2">Error: {databaseError}</p>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <h3 className="font-semibold text-gray-800">Connection</h3>
          <p className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</p>
        </Card>

        <Card className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${hasUnsyncedData ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <h3 className="font-semibold text-gray-800">Sync Status</h3>
          <p className="text-sm text-gray-600">{hasUnsyncedData ? 'Pending' : 'Synced'}</p>
        </Card>

        <Card className="text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-blue-500"></div>
          <h3 className="font-semibold text-gray-800">Database</h3>
          <p className="text-sm text-gray-600">Ready</p>
        </Card>
      </div>

      {/* Storage Information */}
      {storageInfo && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Storage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Used Storage</p>
              <p className="text-lg font-semibold">{formatBytes(storageInfo.usage || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Storage</p>
              <p className="text-lg font-semibold">{formatBytes(storageInfo.quota || 0)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-primary-500 h-2 rounded-full"
              style={{
                width: `${((storageInfo.usage || 0) / (storageInfo.quota || 1)) * 100}%`,
              }}
            ></div>
          </div>
        </Card>
      )}

      {/* Data Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-600">{lessons.length}</div>
          <div className="text-sm text-gray-600">Lessons</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-secondary-600">{quizzes.length}</div>
          <div className="text-sm text-gray-600">Quizzes</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600">{attendance.length}</div>
          <div className="text-sm text-gray-600">Attendance</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{progress.length}</div>
          <div className="text-sm text-gray-600">Progress</div>
        </Card>
      </div>

      {/* Demo Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Demo Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Add Demo Lesson</h4>
            <input
              type="text"
              placeholder="Lesson title"
              value={demoLesson.title}
              onChange={(e) => setDemoLesson({ ...demoLesson, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Lesson description"
              value={demoLesson.description}
              onChange={(e) => setDemoLesson({ ...demoLesson, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={addDemoLesson}
              disabled={!demoLesson.title || !demoLesson.description}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Lesson
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Add Demo Quiz</h4>
            <input
              type="text"
              placeholder="Quiz title"
              value={demoQuiz.title}
              onChange={(e) => setDemoQuiz({ ...demoQuiz, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Quiz description"
              value={demoQuiz.description}
              onChange={(e) => setDemoQuiz({ ...demoQuiz, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={addDemoQuiz}
              disabled={!demoQuiz.title || !demoQuiz.description}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Quiz
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={addDemoAttendance} className="btn-outline">
            Add Demo Attendance
          </button>
          <button onClick={addDemoProgress} className="btn-outline">
            Add Demo Progress
          </button>
          <button onClick={syncData} disabled={!isOnline} className="btn-primary disabled:opacity-50">
            Sync Data
          </button>
          <button onClick={clearCache} className="btn-secondary">
            Clear Cache
          </button>
        </div>
      </Card>

      {/* Recent Data */}
      {lessons.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Lessons</h3>
          <div className="space-y-2">
            {lessons.slice(0, 3).map((lesson) => (
              <div key={lesson.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{lesson.title}</h4>
                  <p className="text-sm text-gray-600">{lesson.description}</p>
                </div>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  {lesson.difficulty}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default OfflineDemo
