import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Dashboard from './Dashboard' // 1. 在这里导入我们新建的 Dashboard 组件

function App() {
  const [session, setSession] = useState(null)
  const [language, setLanguage] = useState('zh') // 默认使用中文

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 注意：我们把登出逻辑从 App.jsx 中移除了，因为它现在属于 Dashboard 的一部分
  // const handleSignOut = async () => { ... } // 这段代码可以删除了

  return (
    <div className="container" style={{ padding: '50px 20px 100px 20px' }}>
      {!session ? (
        <Auth language={language} setLanguage={setLanguage} />
      ) : (
        // 2. 当 session 存在时，渲染 Dashboard 组件
        //    我们把整个 session 对象作为 prop 传递给它
        //    `key` 是一个特殊的 prop，能确保在用户切换时组件被正确地重新渲染
        <Dashboard key={session.user.id} session={session} language={language} setLanguage={setLanguage} />
      )}
    </div>
  )
}

export default App