import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from './supabaseClient'
import { Toaster } from 'react-hot-toast'
import Auth from './Auth'
import MainLayout from './MainLayout'
import PrivacyPolicy from './PrivacyPolicy'
import PlatformFeedback from './PlatformFeedback'
const UserGuide = lazy(() => import('./UserGuide'))

const footerStrings = {
  zh: { privacyLink: '隐私政策', feedbackLink: '平台反馈', guideLink: '用户指南' },
  en: { privacyLink: 'Privacy Policy', feedbackLink: 'Feedback', guideLink: 'User Guide' },
};

function App() {
  const [session, setSession] = useState(null)
  const [language, setLanguage] = useState('zh')
  const [currentPage, setCurrentPage] = useState(
    window.location.hash === '#privacy' ? 'privacy'
    : window.location.hash === '#guide' ? 'guide'
    : 'main'
  )
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      setCurrentPage(hash === '#privacy' ? 'privacy' : hash === '#guide' ? 'guide' : 'main')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateToPrivacy = (e) => {
    e.preventDefault()
    window.location.hash = '#privacy'
    setCurrentPage('privacy')
  }

  const navigateToGuide = (e) => {
    e.preventDefault()
    window.location.hash = '#guide'
    setCurrentPage('guide')
  }

  const navigateBack = () => {
    window.location.hash = ''
    setCurrentPage('main')
  }

  if (currentPage === 'privacy') {
    return (
      <div className="container" style={{ padding: '50px 20px 100px 20px' }}>
        <Toaster position="top-center" />
        <PrivacyPolicy language={language} onBack={navigateBack} />
      </div>
    )
  }

  if (currentPage === 'guide') {
    return (
      <div className="container" style={{ padding: '50px 20px 100px 20px' }}>
        <Toaster position="top-center" />
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
          <UserGuide language={language} onBack={navigateBack} />
        </Suspense>
      </div>
    )
  }

  if (session) {
    return (
      <>
        <Toaster position="top-center" />
        <MainLayout key={session.user.id} session={session} language={language} setLanguage={setLanguage} />
        <footer className="app-footer">
          <a href="#guide" onClick={navigateToGuide}>
            {footerStrings[language].guideLink}
          </a>
          <span className="footer-sep">·</span>
          <a href="#privacy" onClick={navigateToPrivacy}>
            {footerStrings[language].privacyLink}
          </a>
          <span className="footer-sep">·</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowFeedback(true); }}>
            {footerStrings[language].feedbackLink}
          </a>
        </footer>
        {showFeedback && (
          <PlatformFeedback
            language={language}
            userId={session.user.id}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="container" style={{ padding: '50px 20px 100px 20px' }}>
      <Toaster position="top-center" />
      <Auth language={language} setLanguage={setLanguage} />
      <footer className="app-footer">
        <a href="#guide" onClick={navigateToGuide}>
          {footerStrings[language].guideLink}
        </a>
        <span className="footer-sep">·</span>
        <a href="#privacy" onClick={navigateToPrivacy}>
          {footerStrings[language].privacyLink}
        </a>
      </footer>
    </div>
  )
}

export default App
