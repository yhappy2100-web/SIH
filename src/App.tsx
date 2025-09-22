import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Lessons from './pages/Lessons'
import Dashboard from './pages/Dashboard'
import Games from './pages/Games'
import TeacherDashboard from './pages/TeacherDashboard'
import './App.css'

function App() {
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
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/games" element={<Games />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  )
}

export default App
