// Language context for multi-language support
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'hi' | 'pa'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.lessons': 'Lessons',
    'nav.dashboard': 'Dashboard',
    'nav.games': 'Games',
    
    // Lessons page
    'lessons.title': 'Lessons',
    'lessons.subtitle': 'Explore our comprehensive collection of learning materials',
    'lessons.search.placeholder': 'Search lessons...',
    'lessons.filter.all': 'All Categories',
    'lessons.filter.difficulty': 'All Difficulties',
    'lessons.difficulty.beginner': 'Beginner',
    'lessons.difficulty.intermediate': 'Intermediate',
    'lessons.difficulty.advanced': 'Advanced',
    'lessons.duration': 'Duration',
    'lessons.minutes': 'minutes',
    'lessons.start': 'Start',
    'lessons.continue': 'Continue',
    'lessons.completed': 'Completed',
    'lessons.progress': 'Progress',
    'lessons.offline': 'Available Offline',
    'lessons.online': 'Online Only',
    'lessons.loading': 'Loading lessons...',
    'lessons.error': 'Failed to load lessons',
    'lessons.retry': 'Retry',
    'lessons.no_lessons': 'No lessons found',
    'lessons.no_lessons_desc': 'Try adjusting your search or filter criteria',
    
    // Lesson details
    'lesson.objectives': 'Learning Objectives',
    'lesson.prerequisites': 'Prerequisites',
    'lesson.resources': 'Resources',
    'lesson.download': 'Download',
    'lesson.downloaded': 'Downloaded',
    'lesson.downloading': 'Downloading...',
    'lesson.close': 'Close',
    'lesson.start_lesson': 'Start Lesson',
    'lesson.resume_lesson': 'Resume Lesson',
    
    // Language selector
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.punjabi': 'ਪੰਜਾਬੀ',
    'language.select': 'Select Language',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  hi: {
    // Navigation
    'nav.home': 'घर',
    'nav.lessons': 'पाठ',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.games': 'खेल',
    
    // Lessons page
    'lessons.title': 'पाठ',
    'lessons.subtitle': 'हमारी व्यापक शिक्षण सामग्री का संग्रह देखें',
    'lessons.search.placeholder': 'पाठ खोजें...',
    'lessons.filter.all': 'सभी श्रेणियां',
    'lessons.filter.difficulty': 'सभी स्तर',
    'lessons.difficulty.beginner': 'शुरुआती',
    'lessons.difficulty.intermediate': 'मध्यम',
    'lessons.difficulty.advanced': 'उन्नत',
    'lessons.duration': 'अवधि',
    'lessons.minutes': 'मिनट',
    'lessons.start': 'शुरू करें',
    'lessons.continue': 'जारी रखें',
    'lessons.completed': 'पूर्ण',
    'lessons.progress': 'प्रगति',
    'lessons.offline': 'ऑफलाइन उपलब्ध',
    'lessons.online': 'केवल ऑनलाइन',
    'lessons.loading': 'पाठ लोड हो रहे हैं...',
    'lessons.error': 'पाठ लोड करने में विफल',
    'lessons.retry': 'पुनः प्रयास करें',
    'lessons.no_lessons': 'कोई पाठ नहीं मिला',
    'lessons.no_lessons_desc': 'अपनी खोज या फ़िल्टर मानदंड को समायोजित करने का प्रयास करें',
    
    // Lesson details
    'lesson.objectives': 'सीखने के उद्देश्य',
    'lesson.prerequisites': 'पूर्वापेक्षाएं',
    'lesson.resources': 'संसाधन',
    'lesson.download': 'डाउनलोड',
    'lesson.downloaded': 'डाउनलोड किया गया',
    'lesson.downloading': 'डाउनलोड हो रहा है...',
    'lesson.close': 'बंद करें',
    'lesson.start_lesson': 'पाठ शुरू करें',
    'lesson.resume_lesson': 'पाठ जारी रखें',
    
    // Language selector
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.punjabi': 'ਪੰਜਾਬੀ',
    'language.select': 'भाषा चुनें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.retry': 'पुनः प्रयास करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.close': 'बंद करें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.clear': 'साफ़ करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
  },
  pa: {
    // Navigation
    'nav.home': 'ਘਰ',
    'nav.lessons': 'ਪਾਠ',
    'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'nav.games': 'ਖੇਡਾਂ',
    
    // Lessons page
    'lessons.title': 'ਪਾਠ',
    'lessons.subtitle': 'ਸਾਡੇ ਵਿਆਪਕ ਸਿੱਖਿਆ ਸਮੱਗਰੀ ਦੇ ਸੰਗ੍ਰਹਿ ਦੀ ਪੜਚੋਲ ਕਰੋ',
    'lessons.search.placeholder': 'ਪਾਠ ਖੋਜੋ...',
    'lessons.filter.all': 'ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ',
    'lessons.filter.difficulty': 'ਸਾਰੇ ਪੱਧਰ',
    'lessons.difficulty.beginner': 'ਸ਼ੁਰੂਆਤੀ',
    'lessons.difficulty.intermediate': 'ਮੱਧਮ',
    'lessons.difficulty.advanced': 'ਉੱਨਤ',
    'lessons.duration': 'ਅਵਧੀ',
    'lessons.minutes': 'ਮਿੰਟ',
    'lessons.start': 'ਸ਼ੁਰੂ ਕਰੋ',
    'lessons.continue': 'ਜਾਰੀ ਰੱਖੋ',
    'lessons.completed': 'ਪੂਰਾ',
    'lessons.progress': 'ਤਰੱਕੀ',
    'lessons.offline': 'ਔਫਲਾਈਨ ਉਪਲਬਧ',
    'lessons.online': 'ਸਿਰਫ਼ ਔਨਲਾਈਨ',
    'lessons.loading': 'ਪਾਠ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
    'lessons.error': 'ਪਾਠ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
    'lessons.retry': 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    'lessons.no_lessons': 'ਕੋਈ ਪਾਠ ਨਹੀਂ ਮਿਲਿਆ',
    'lessons.no_lessons_desc': 'ਆਪਣੇ ਖੋਜ ਜਾਂ ਫਿਲਟਰ ਮਾਪਦੰਡ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਉਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    
    // Lesson details
    'lesson.objectives': 'ਸਿੱਖਣ ਦੇ ਟੀਚੇ',
    'lesson.prerequisites': 'ਪੂਰਵ-ਸ਼ਰਤਾਂ',
    'lesson.resources': 'ਸਰੋਤ',
    'lesson.download': 'ਡਾਉਨਲੋਡ',
    'lesson.downloaded': 'ਡਾਉਨਲੋਡ ਕੀਤਾ ਗਿਆ',
    'lesson.downloading': 'ਡਾਉਨਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    'lesson.close': 'ਬੰਦ ਕਰੋ',
    'lesson.start_lesson': 'ਪਾਠ ਸ਼ੁਰੂ ਕਰੋ',
    'lesson.resume_lesson': 'ਪਾਠ ਜਾਰੀ ਰੱਖੋ',
    
    // Language selector
    'language.english': 'English',
    'language.hindi': 'हिन्दी',
    'language.punjabi': 'ਪੰਜਾਬੀ',
    'language.select': 'ਭਾਸ਼ਾ ਚੁਣੋ',
    
    // Common
    'common.loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    'common.error': 'ਗਲਤੀ',
    'common.retry': 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    'common.cancel': 'ਰੱਦ ਕਰੋ',
    'common.save': 'ਸੇਵ ਕਰੋ',
    'common.close': 'ਬੰਦ ਕਰੋ',
    'common.search': 'ਖੋਜੋ',
    'common.filter': 'ਫਿਲਟਰ',
    'common.clear': 'ਸਾਫ਼ ਕਰੋ',
    'common.back': 'ਵਾਪਸ',
    'common.next': 'ਅਗਲਾ',
    'common.previous': 'ਪਿਛਲਾ',
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('nabha-learn-language') as Language
    return savedLanguage && ['en', 'hi', 'pa'].includes(savedLanguage) ? savedLanguage : 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('nabha-learn-language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const isRTL = language === 'pa' // Punjabi is RTL

  // Update document direction and language
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [language, isRTL])

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Language selector component
export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage()

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'hi', name: t('language.hindi'), flag: '🇮🇳' },
    { code: 'pa', name: t('language.punjabi'), flag: '🇮🇳' },
  ]

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
