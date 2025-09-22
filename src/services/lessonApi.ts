// Mock API service for lesson data
import { Lesson, Quiz } from './database'

// Mock lesson data in multiple languages
const mockLessons: Record<string, Lesson[]> = {
  en: [
    {
      id: 'lesson-1',
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming concepts and logic.',
      content: 'This lesson covers fundamental programming concepts including variables, data types, control structures, and basic algorithms. You will learn how to think like a programmer and solve problems step by step.',
      category: 'programming',
      difficulty: 'beginner',
      duration: 45,
      thumbnail: '/images/lesson-1.jpg',
      videoUrl: '/videos/lesson-1.mp4',
      audioUrl: '/audio/lesson-1.mp3',
      resources: [
        {
          id: 'res-1',
          type: 'pdf',
          title: 'Programming Basics Guide',
          url: '/resources/programming-basics.pdf',
          size: 1024000,
          downloaded: false,
        },
        {
          id: 'res-2',
          type: 'link',
          title: 'Online Code Editor',
          url: 'https://repl.it',
          downloaded: false,
        }
      ],
      prerequisites: [],
      learningObjectives: [
        'Understand basic programming concepts',
        'Learn about variables and data types',
        'Master control structures',
        'Practice problem-solving skills'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      version: 1,
      isOffline: false,
    },
    {
      id: 'lesson-2',
      title: 'Web Development Fundamentals',
      description: 'HTML, CSS, and JavaScript essentials for web development.',
      content: 'This comprehensive lesson covers the three core technologies of web development: HTML for structure, CSS for styling, and JavaScript for interactivity. You will build your first website from scratch.',
      category: 'web-development',
      difficulty: 'intermediate',
      duration: 90,
      thumbnail: '/images/lesson-2.jpg',
      videoUrl: '/videos/lesson-2.mp4',
      resources: [
        {
          id: 'res-3',
          type: 'pdf',
          title: 'HTML Reference Guide',
          url: '/resources/html-reference.pdf',
          size: 2048000,
          downloaded: false,
        },
        {
          id: 'res-4',
          type: 'image',
          title: 'CSS Cheat Sheet',
          url: '/resources/css-cheatsheet.png',
          size: 512000,
          downloaded: false,
        }
      ],
      prerequisites: ['lesson-1'],
      learningObjectives: [
        'Master HTML structure and semantics',
        'Create responsive CSS layouts',
        'Add interactivity with JavaScript',
        'Build a complete website project'
      ],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      version: 1,
      isOffline: false,
    },
    {
      id: 'lesson-3',
      title: 'React Components & Hooks',
      description: 'Master React components, state management, and hooks.',
      content: 'Learn modern React development with functional components, hooks, and state management. This lesson covers useState, useEffect, custom hooks, and component composition patterns.',
      category: 'react',
      difficulty: 'intermediate',
      duration: 120,
      thumbnail: '/images/lesson-3.jpg',
      videoUrl: '/videos/lesson-3.mp4',
      resources: [
        {
          id: 'res-5',
          type: 'pdf',
          title: 'React Hooks Guide',
          url: '/resources/react-hooks.pdf',
          size: 1536000,
          downloaded: false,
        }
      ],
      prerequisites: ['lesson-2'],
      learningObjectives: [
        'Understand React component lifecycle',
        'Master useState and useEffect hooks',
        'Create custom hooks',
        'Build reusable components'
      ],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      version: 1,
      isOffline: false,
    },
    {
      id: 'lesson-4',
      title: 'Database Design',
      description: 'Learn database concepts, SQL, and data modeling.',
      content: 'This lesson covers relational database design, SQL queries, normalization, and data modeling. You will learn to design efficient databases and write complex queries.',
      category: 'database',
      difficulty: 'advanced',
      duration: 150,
      thumbnail: '/images/lesson-4.jpg',
      videoUrl: '/videos/lesson-4.mp4',
      resources: [
        {
          id: 'res-6',
          type: 'pdf',
          title: 'SQL Reference Manual',
          url: '/resources/sql-reference.pdf',
          size: 3072000,
          downloaded: false,
        }
      ],
      prerequisites: ['lesson-1'],
      learningObjectives: [
        'Design normalized database schemas',
        'Write complex SQL queries',
        'Understand database relationships',
        'Optimize database performance'
      ],
      createdAt: new Date('2024-01-30'),
      updatedAt: new Date('2024-01-30'),
      version: 1,
      isOffline: false,
    }
  ],
  hi: [
    {
      id: 'lesson-1',
      title: 'प्रोग्रामिंग का परिचय',
      description: 'प्रोग्रामिंग की मूल अवधारणाओं और तर्क को सीखें।',
      content: 'यह पाठ मूल प्रोग्रामिंग अवधारणाओं को कवर करता है जिसमें चर, डेटा प्रकार, नियंत्रण संरचनाएं और बुनियादी एल्गोरिदम शामिल हैं। आप सीखेंगे कि कैसे एक प्रोग्रामर की तरह सोचें और कदम से कदम समस्याओं को हल करें।',
      category: 'programming',
      difficulty: 'beginner',
      duration: 45,
      thumbnail: '/images/lesson-1.jpg',
      videoUrl: '/videos/lesson-1-hi.mp4',
      audioUrl: '/audio/lesson-1-hi.mp3',
      resources: [
        {
          id: 'res-1',
          type: 'pdf',
          title: 'प्रोग्रामिंग बेसिक्स गाइड',
          url: '/resources/programming-basics-hi.pdf',
          size: 1024000,
          downloaded: false,
        }
      ],
      prerequisites: [],
      learningObjectives: [
        'मूल प्रोग्रामिंग अवधारणाओं को समझें',
        'चर और डेटा प्रकारों के बारे में जानें',
        'नियंत्रण संरचनाओं में महारत हासिल करें',
        'समस्या-समाधान कौशल का अभ्यास करें'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      version: 1,
      isOffline: false,
    },
    {
      id: 'lesson-2',
      title: 'वेब डेवलपमेंट के मूल सिद्धांत',
      description: 'वेब डेवलपमेंट के लिए HTML, CSS और JavaScript की आवश्यकताएं।',
      content: 'यह व्यापक पाठ वेब डेवलपमेंट की तीन मुख्य तकनीकों को कवर करता है: संरचना के लिए HTML, स्टाइलिंग के लिए CSS, और इंटरैक्टिविटी के लिए JavaScript। आप शुरुआत से अपनी पहली वेबसाइट बनाएंगे।',
      category: 'web-development',
      difficulty: 'intermediate',
      duration: 90,
      thumbnail: '/images/lesson-2.jpg',
      videoUrl: '/videos/lesson-2-hi.mp4',
      resources: [
        {
          id: 'res-3',
          type: 'pdf',
          title: 'HTML संदर्भ गाइड',
          url: '/resources/html-reference-hi.pdf',
          size: 2048000,
          downloaded: false,
        }
      ],
      prerequisites: ['lesson-1'],
      learningObjectives: [
        'HTML संरचना और शब्दार्थ में महारत हासिल करें',
        'रिस्पॉन्सिव CSS लेआउट बनाएं',
        'JavaScript के साथ इंटरैक्टिविटी जोड़ें',
        'एक पूर्ण वेबसाइट प्रोजेक्ट बनाएं'
      ],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      version: 1,
      isOffline: false,
    }
  ],
  pa: [
    {
      id: 'lesson-1',
      title: 'ਪ੍ਰੋਗਰਾਮਿੰਗ ਦਾ ਜਾਣ-ਪਛਾਣ',
      description: 'ਪ੍ਰੋਗਰਾਮਿੰਗ ਦੀਆਂ ਮੂਲ ਧਾਰਨਾਵਾਂ ਅਤੇ ਤਰਕ ਸਿੱਖੋ।',
      content: 'ਇਹ ਪਾਠ ਮੂਲ ਪ੍ਰੋਗਰਾਮਿੰਗ ਧਾਰਨਾਵਾਂ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ ਜਿਸ ਵਿੱਚ ਵੇਰੀਏਬਲ, ਡੇਟਾ ਪ੍ਰਕਾਰ, ਨਿਯੰਤਰਣ ਢਾਂਚੇ ਅਤੇ ਬੁਨਿਆਦੀ ਐਲਗੋਰਿਦਮ ਸ਼ਾਮਲ ਹਨ। ਤੁਸੀਂ ਸਿੱਖੋਗੇ ਕਿ ਕਿਵੇਂ ਇੱਕ ਪ੍ਰੋਗਰਾਮਰ ਵਾਂਗ ਸੋਚੋ ਅਤੇ ਕਦਮ-ਦਰ-ਕਦਮ ਸਮੱਸਿਆਵਾਂ ਨੂੰ ਹੱਲ ਕਰੋ।',
      category: 'programming',
      difficulty: 'beginner',
      duration: 45,
      thumbnail: '/images/lesson-1.jpg',
      videoUrl: '/videos/lesson-1-pa.mp4',
      audioUrl: '/audio/lesson-1-pa.mp3',
      resources: [
        {
          id: 'res-1',
          type: 'pdf',
          title: 'ਪ੍ਰੋਗਰਾਮਿੰਗ ਬੇਸਿਕਸ ਗਾਈਡ',
          url: '/resources/programming-basics-pa.pdf',
          size: 1024000,
          downloaded: false,
        }
      ],
      prerequisites: [],
      learningObjectives: [
        'ਮੂਲ ਪ੍ਰੋਗਰਾਮਿੰਗ ਧਾਰਨਾਵਾਂ ਨੂੰ ਸਮਝੋ',
        'ਵੇਰੀਏਬਲ ਅਤੇ ਡੇਟਾ ਪ੍ਰਕਾਰਾਂ ਬਾਰੇ ਜਾਣੋ',
        'ਨਿਯੰਤਰਣ ਢਾਂਚਿਆਂ ਵਿੱਚ ਮਹਾਰਤ ਹਾਸਲ ਕਰੋ',
        'ਸਮੱਸਿਆ-ਹੱਲ ਕੁਸ਼ਲਤਾ ਦਾ ਅਭਿਆਸ ਕਰੋ'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      version: 1,
      isOffline: false,
    },
    {
      id: 'lesson-2',
      title: 'ਵੈੱਬ ਡਿਵੈਲਪਮੈਂਟ ਦੇ ਮੂਲ ਸਿਧਾਂਤ',
      description: 'ਵੈੱਬ ਡਿਵੈਲਪਮੈਂਟ ਲਈ HTML, CSS ਅਤੇ JavaScript ਦੀਆਂ ਜ਼ਰੂਰਤਾਂ।',
      content: 'ਇਹ ਵਿਆਪਕ ਪਾਠ ਵੈੱਬ ਡਿਵੈਲਪਮੈਂਟ ਦੀਆਂ ਤਿੰਨ ਮੁੱਖ ਤਕਨੀਕਾਂ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ: ਢਾਂਚੇ ਲਈ HTML, ਸਟਾਈਲਿੰਗ ਲਈ CSS, ਅਤੇ ਇੰਟਰਐਕਟਿਵਿਟੀ ਲਈ JavaScript। ਤੁਸੀਂ ਸ਼ੁਰੂ ਤੋਂ ਆਪਣੀ ਪਹਿਲੀ ਵੈੱਬਸਾਈਟ ਬਣਾਓਗੇ।',
      category: 'web-development',
      difficulty: 'intermediate',
      duration: 90,
      thumbnail: '/images/lesson-2.jpg',
      videoUrl: '/videos/lesson-2-pa.mp4',
      resources: [
        {
          id: 'res-3',
          type: 'pdf',
          title: 'HTML ਹਵਾਲਾ ਗਾਈਡ',
          url: '/resources/html-reference-pa.pdf',
          size: 2048000,
          downloaded: false,
        }
      ],
      prerequisites: ['lesson-1'],
      learningObjectives: [
        'HTML ਢਾਂਚੇ ਅਤੇ ਸ਼ਬਦਾਰਥ ਵਿੱਚ ਮਹਾਰਤ ਹਾਸਲ ਕਰੋ',
        'ਰਿਸਪੌਨਸਿਵ CSS ਲੇਆਉਟ ਬਣਾਓ',
        'JavaScript ਨਾਲ ਇੰਟਰਐਕਟਿਵਿਟੀ ਜੋੜੋ',
        'ਇੱਕ ਪੂਰਾ ਵੈੱਬਸਾਈਟ ਪ੍ਰੋਜੈਕਟ ਬਣਾਓ'
      ],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      version: 1,
      isOffline: false,
    }
  ]
}

// Mock API delay simulation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class LessonApiService {
  private baseUrl = '/api/lessons'

  // Fetch lessons from mock API
  async fetchLessons(language: string = 'en'): Promise<Lesson[]> {
    try {
      // Simulate API delay
      await delay(1000)
      
      const lessons = mockLessons[language] || mockLessons.en
      
      // Simulate network error occasionally
      if (Math.random() < 0.1) {
        throw new Error('Network error: Failed to fetch lessons')
      }
      
      return lessons
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Fetch single lesson by ID
  async fetchLessonById(id: string, language: string = 'en'): Promise<Lesson | null> {
    try {
      await delay(500)
      
      const lessons = mockLessons[language] || mockLessons.en
      const lesson = lessons.find(l => l.id === id)
      
      if (!lesson) {
        throw new Error(`Lesson with ID ${id} not found`)
      }
      
      return lesson
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Fetch lessons by category
  async fetchLessonsByCategory(category: string, language: string = 'en'): Promise<Lesson[]> {
    try {
      await delay(800)
      
      const lessons = mockLessons[language] || mockLessons.en
      return lessons.filter(lesson => lesson.category === category)
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Fetch lessons by difficulty
  async fetchLessonsByDifficulty(difficulty: string, language: string = 'en'): Promise<Lesson[]> {
    try {
      await delay(800)
      
      const lessons = mockLessons[language] || mockLessons.en
      return lessons.filter(lesson => lesson.difficulty === difficulty)
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Search lessons
  async searchLessons(query: string, language: string = 'en'): Promise<Lesson[]> {
    try {
      await delay(600)
      
      const lessons = mockLessons[language] || mockLessons.en
      const lowercaseQuery = query.toLowerCase()
      
      return lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(lowercaseQuery) ||
        lesson.description.toLowerCase().includes(lowercaseQuery) ||
        lesson.content.toLowerCase().includes(lowercaseQuery)
      )
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Get available categories
  async getCategories(language: string = 'en'): Promise<string[]> {
    try {
      await delay(300)
      
      const lessons = mockLessons[language] || mockLessons.en
      const categories = [...new Set(lessons.map(lesson => lesson.category))]
      return categories
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Get available difficulties
  async getDifficulties(): Promise<string[]> {
    try {
      await delay(200)
      return ['beginner', 'intermediate', 'advanced']
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Download lesson resource
  async downloadResource(resourceId: string, lessonId: string): Promise<Blob> {
    try {
      await delay(2000) // Simulate download time
      
      // Simulate file download
      const mockFileContent = `Mock content for resource ${resourceId}`
      return new Blob([mockFileContent], { type: 'application/octet-stream' })
    } catch (error) {
      console.error('Download Error:', error)
      throw error
    }
  }

  // Mark lesson as completed
  async markLessonCompleted(lessonId: string, userId: string): Promise<void> {
    try {
      await delay(500)
      console.log(`Lesson ${lessonId} marked as completed for user ${userId}`)
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Get lesson progress
  async getLessonProgress(lessonId: string, userId: string): Promise<number> {
    try {
      await delay(300)
      // Simulate random progress
      return Math.floor(Math.random() * 100)
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const lessonApiService = new LessonApiService()

// Export types
export type { Lesson, Quiz }
