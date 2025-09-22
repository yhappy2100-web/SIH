import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const Navbar = () => {
  const location = useLocation()
  const { t } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/', label: t('nav.home'), icon: '🏠' },
    { path: '/lessons', label: t('nav.lessons'), icon: '📚' },
    { path: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { path: '/games', label: t('nav.games'), icon: '🎮' },
    { path: '/teacher', label: 'Teacher', icon: '👨‍🏫' },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-punjab border-b border-punjab-yellow-200 sticky top-0 z-50">
      <div className="container-punjab px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-punjab group-hover:shadow-warm transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-xl">ਨ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold punjab-text-gradient">NabhaLearn</span>
              <span className="text-xs text-gray-500 font-punjabi">ਨਭਾ ਲਰਨ</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  isActive(item.path) ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-punjab-yellow-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-link justify-start ${
                    isActive(item.path) ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
