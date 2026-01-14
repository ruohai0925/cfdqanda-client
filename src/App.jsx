import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Toaster } from 'react-hot-toast' // <--- 1. 必须导入这个！
import Auth from './Auth'
import Dashboard from './Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [language, setLanguage] = useState('zh') 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="container" style={{ padding: '50px 20px 100px 20px' }}>
      {/* 2. 必须把 Toaster 组件放在这里，提示框才能弹出来！*/}
      <Toaster position="top-center" />
      
      {!session ? (
        <Auth language={language} setLanguage={setLanguage} />
      ) : (
        <Dashboard key={session.user.id} session={session} language={language} setLanguage={setLanguage} />
      )}
    </div>
  )
}

export default App