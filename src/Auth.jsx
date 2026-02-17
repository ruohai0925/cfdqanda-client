// 导入React的useState钩子，用于管理组件状态
import { useState } from 'react'
// 导入Supabase客户端，用于与后端数据库和认证服务通信
import { supabase } from './supabaseClient'
import toast from 'react-hot-toast'

// --- 语言字典 ---
const strings = {
  zh: {
    title: '计算流体力学问答',
    description: '请使用您的邮箱进行登录或注册。',
    email: '邮箱',
    emailPlaceholder: '请输入您的邮箱',
    password: '密码',
    passwordPlaceholder: '请输入您的密码',
    loginButton: '登录',
    signupButton: '注册',
    loading: '加载中...',
    loginSuccess: '登录成功！',
    signupSuccess: '注册成功！请检查您的邮箱进行验证。',
  },
  en: {
    title: 'CFDQandA',
    description: 'Please use your email to login or sign up.',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Login',
    signupButton: 'Sign Up',
    loading: 'Loading...',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Sign up successful! Please check your email for verification.',
  }
};

// 定义认证组件，这是用户登录和注册的主要界面
export default function Auth({ language, setLanguage }) {
  // 创建loading状态，用于显示加载状态（防止重复提交）
  const [loading, setLoading] = useState(false)
  // 创建email状态，用于存储用户输入的邮箱地址
  const [email, setEmail] = useState('')
  // 创建password状态，用于存储用户输入的密码
  const [password, setPassword] = useState('')
  
  // 获取当前语言的翻译文本
  const t = strings[language];

  // 处理用户登录的函数
  const handleLogin = async (event) => {
    event.preventDefault() // 阻止表单默认的提交行为，防止页面刷新

    try {
      setLoading(true) // 开始加载状态，禁用按钮防止重复点击
      // 调用Supabase的登录方法，使用邮箱和密码进行身份验证
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error // 如果有错误，抛出异常
      toast.success(t.loginSuccess) // 登录成功提示
    } catch (error) {
      // 捕获错误并显示给用户，优先显示详细错误描述
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false) // 无论成功还是失败，都要结束加载状态
    }
  }

  // 处理用户注册的函数
  const handleSignUp = async (event) => {
    event.preventDefault() // 阻止表单默认提交行为

    try {
      setLoading(true) // 开始加载状态
      // 调用Supabase的注册方法，创建新用户账户
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error // 如果有错误，抛出异常
      // 注册成功后提示用户检查邮箱（如果开启了邮箱验证功能）
      toast.success(t.signupSuccess)
    } catch (error) {
      // 捕获并显示注册过程中的错误
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false) // 结束加载状态
    }
  }

  // 返回组件的JSX结构，渲染登录和注册界面
  return (
    <div aria-live="polite">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 className="header">{t.title}</h1>
          <div>
            <button onClick={() => setLanguage('en')} disabled={language==='en'} style={{ marginRight: '5px', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', background: language==='en' ? '#6200ea' : 'white', color: language==='en' ? 'white' : '#6200ea' }}>EN</button>
            <button onClick={() => setLanguage('zh')} disabled={language==='zh'} style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', background: language==='zh' ? '#6200ea' : 'white', color: language==='zh' ? 'white' : '#6200ea' }}>ZH</button>
          </div>
        </div>
        <p className="description">{t.description}</p>
        {/* 表单容器，提交时触发登录函数 */}
        <form onSubmit={handleLogin}>
          {/* 邮箱输入标签 */}
          <label htmlFor="email">{t.email}</label>
          <input
            id="email"
            className="inputField"
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)} // 当用户输入时更新email状态
          />
          {/* 密码输入标签 */}
          <label htmlFor="password">{t.password}</label>
          <input
            id="password"
            className="inputField"
            type="password"
            placeholder={t.passwordPlaceholder}
            value={password}
            required={true}
            onChange={(e) => setPassword(e.target.value)} // 当用户输入时更新password状态
          />
          {/* 登录按钮，加载时禁用并显示加载状态 */}
          <button className={'button-block'} disabled={loading}>
            {loading ? <span>{t.loading}</span> : <span>{t.loginButton}</span>}
          </button>
          {/* 注册按钮，点击时触发注册函数，加载时禁用 */}
          <button className={'button-block button-outline'} type="button" disabled={loading} onClick={handleSignUp}>
            {loading ? <span>{t.loading}</span> : <span>{t.signupButton}</span>}
          </button>
        </form>
    </div>
  )
}