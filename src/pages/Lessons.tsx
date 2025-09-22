import { useState, useEffect, useCallback } from 'react'
import { Lesson } from '../services/database'
import { useOfflineData } from '../hooks/useOfflineData'
import { lessonApiService } from '../services/lessonApi'
import { useLanguage, LanguageSelector } from '../contexts/LanguageContext'
import Card from '../components/Card'
import LessonDetailModal from '../components/LessonDetailModal'

const Lessons = () => {
  const { t, language } = useLanguage()
  const { isOnline, lessons: offlineLessons, saveLesson, cacheLessonContent } = useOfflineData()
  
  // State management
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  // Fetch lessons based on online/offline status
  const fetchLessons = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let fetchedLessons: Lesson[] = []

      if (isOnline) {
        // Fetch from API when online
        fetchedLessons = await lessonApiService.fetchLessons(language)
        
        // Cache lessons for offline use
        for (const lesson of fetchedLessons) {
          await saveLesson(lesson)
          await cacheLessonContent(lesson.id, lesson)
        }
      } else {
        // Use offline lessons when offline
        fetchedLessons = offlineLessons.filter(lesson => 
          lesson.title.toLowerCase().includes(language) || 
          lesson.description.toLowerCase().includes(language) ||
          language === 'en' // Default to English if no language-specific lessons
        )
      }

      setLessons(fetchedLessons)
      setFilteredLessons(fetchedLessons)
    } catch (err) {
      console.error('Failed to fetch lessons:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons')
      
      // Fallback to offline lessons on error
      if (offlineLessons.length > 0) {
        setLessons(offlineLessons)
        setFilteredLessons(offlineLessons)
      }
    } finally {
      setLoading(false)
    }
  }, [isOnline, language, offlineLessons, saveLesson, cacheLessonContent])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      if (isOnline) {
        const fetchedCategories = await lessonApiService.getCategories(language)
        setCategories(fetchedCategories)
      } else {
        const uniqueCategories = [...new Set(offlineLessons.map(lesson => lesson.category))]
        setCategories(uniqueCategories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }, [isOnline, language, offlineLessons])

  // Filter lessons based on search and filters
  const filterLessons = useCallback(() => {
    let filtered = lessons

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query) ||
        lesson.content.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lesson => lesson.category === selectedCategory)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(lesson => lesson.difficulty === selectedDifficulty)
    }

    setFilteredLessons(filtered)
  }, [lessons, searchQuery, selectedCategory, selectedDifficulty])

  // Effects
  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    filterLessons()
  }, [filterLessons])

  // Handlers
  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsModalOpen(true)
  }

  const handleStartLesson = (lesson: Lesson) => {
    // TODO: Implement lesson start logic
    console.log('Starting lesson:', lesson.id)
    setIsModalOpen(false)
  }

  const handleRetry = () => {
    fetchLessons()
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-punjab">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('lessons.title')}
              </h1>
              <p className="text-gray-600">
                {t('lessons.subtitle')}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <LanguageSelector />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder={t('lessons.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('lessons.filter.all')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('lessons.filter.difficulty')}</option>
              <option value="beginner">{t('lessons.difficulty.beginner')}</option>
              <option value="intermediate">{t('lessons.difficulty.intermediate')}</option>
              <option value="advanced">{t('lessons.difficulty.advanced')}</option>
            </select>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">
                {isOnline ? 'Online' : 'Offline'} Mode
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">
                {filteredLessons.length} {t('lessons.title').toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('lessons.loading')}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('lessons.error')}
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={handleRetry} className="btn-primary">
              {t('lessons.retry')}
            </button>
          </Card>
        )}

        {/* Lessons Grid */}
        {!loading && !error && (
          <>
            {filteredLessons.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {t('lessons.no_lessons')}
                </h3>
                <p className="text-gray-600">
                  {t('lessons.no_lessons_desc')}
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                        {lesson.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          lesson.difficulty
                        )}`}
                      >
                        {getDifficultyText(lesson.difficulty)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {lesson.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{t('lessons.duration')}: {lesson.duration} {t('lessons.minutes')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lesson.isOffline ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {lesson.isOffline ? t('lessons.offline') : t('lessons.online')}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 btn-primary text-sm">
                          {t('lessons.start')}
                        </button>
                        <button className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors">
                          📖
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Coming Soon Card */}
        {!loading && !error && filteredLessons.length > 0 && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                More Lessons Coming Soon!
              </h3>
              <p className="text-gray-600 mb-4">
                We're constantly adding new content to help you learn and grow.
              </p>
              <button className="btn-secondary">
                Get Notified
              </button>
            </Card>
          </div>
        )}
      </div>

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        lesson={selectedLesson}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartLesson={handleStartLesson}
      />
    </div>
  )
}

export default Lessons
