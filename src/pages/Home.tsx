import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import Card from '../components/Card'
import OfflineDemo from '../components/OfflineDemo'

const Home = () => {
  const [count, setCount] = useState(0)
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null)

  useEffect(() => {
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        console.log('New content available, please refresh.')
        setUpdateSW(() => updateServiceWorker)
      },
      onOfflineReady() {
        console.log('App ready to work offline')
      },
    })
  }, [])

  return (
    <div className="min-h-screen hero-gradient">
      <div className="container-punjab section-padding">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold punjab-text-gradient mb-6">
            Welcome to NabhaLearn
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-4">
            A Progressive Web App built with React, Vite, and TailwindCSS
          </p>
          <p className="text-lg text-gray-600 font-punjabi">
            ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਿੱਖਿਆ ਦਾ ਇੱਕ ਨਵਾਂ ਤਰੀਕਾ
          </p>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="feature-card text-center">
              <div className="text-6xl font-bold punjab-text-gradient mb-4">
                {count}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Interactive Counter
              </h3>
              <div className="space-x-2">
                <button
                  onClick={() => setCount((count) => count + 1)}
                  className="btn-primary"
                >
                  Increment
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="btn-secondary"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="feature-card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                PWA Features
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-secondary-500 rounded-full mr-3"></span>
                  Service Worker Active
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-secondary-500 rounded-full mr-3"></span>
                  Offline Support
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-secondary-500 rounded-full mr-3"></span>
                  Installable
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-secondary-500 rounded-full mr-3"></span>
                  Responsive Design
                </li>
              </ul>
            </div>

            <div className="feature-card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Quick Navigation
              </h3>
              <div className="space-y-3">
                <Link
                  to="/lessons"
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-punjab-yellow-50 to-punjab-green-50 text-primary-700 rounded-xl hover:from-punjab-yellow-100 hover:to-punjab-green-100 transition-all duration-300 border border-punjab-yellow-200"
                >
                  <span className="text-lg mr-2">📚</span>
                  Browse Lessons
                </Link>
                <Link
                  to="/dashboard"
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-punjab-yellow-50 to-punjab-green-50 text-primary-700 rounded-xl hover:from-punjab-yellow-100 hover:to-punjab-green-100 transition-all duration-300 border border-punjab-yellow-200"
                >
                  <span className="text-lg mr-2">📊</span>
                  View Dashboard
                </Link>
                <Link
                  to="/games"
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-punjab-yellow-50 to-punjab-green-50 text-primary-700 rounded-xl hover:from-punjab-yellow-100 hover:to-punjab-green-100 transition-all duration-300 border border-punjab-yellow-200"
                >
                  <span className="text-lg mr-2">🎮</span>
                  Play Games
                </Link>
              </div>
            </div>
          </div>

          {updateSW && (
            <Card className="bg-yellow-50 border-yellow-200 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Update Available
                  </h3>
                  <p className="text-yellow-700">
                    A new version of the app is available. Click to update.
                  </p>
                </div>
                <button
                  onClick={() => updateSW()}
                  className="btn-primary bg-yellow-600 hover:bg-yellow-700"
                >
                  Update Now
                </button>
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">React</div>
                <div className="text-sm text-gray-600">Frontend</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Vite</div>
                <div className="text-sm text-gray-600">Build Tool</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">Tailwind</div>
                <div className="text-sm text-gray-600">Styling</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">PWA</div>
                <div className="text-sm text-gray-600">Progressive</div>
              </div>
            </div>
          </Card>

          {/* Offline Demo Section */}
          <Card className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Offline Functionality Demo
            </h2>
            <p className="text-gray-600 mb-6">
              Test the offline capabilities with IndexedDB storage and Workbox caching.
              Try adding lessons, quizzes, and other data while offline!
            </p>
            <OfflineDemo />
          </Card>
        </main>
      </div>
    </div>
  )
}

export default Home
