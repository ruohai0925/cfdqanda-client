import { useState } from 'react'
import { supabase } from './supabaseClient'
import toast from 'react-hot-toast'
import { Turnstile } from '@marsidev/react-turnstile'

// --- Language dictionary ---
const strings = {
  zh: {
    title: '计算流体力学问答',
    descriptionLogin: '请使用您的邮箱进行登录。',
    descriptionSignup: '创建新账户。',
    descriptionReset: '输入您的邮箱，我们将发送密码重置链接。',
    email: '邮箱',
    emailPlaceholder: '请输入您的邮箱',
    password: '密码',
    passwordPlaceholder: '请输入您的密码',
    displayName: '用户名',
    displayNamePlaceholder: '请输入您的用户名',
    organization: '机构',
    organizationPlaceholder: '请输入您的机构名称',
    loginButton: '登录',
    signupButton: '注册',
    resetButton: '发送重置邮件',
    loading: '加载中...',
    loginSuccess: '登录成功！',
    signupSuccess: '注册成功！请检查您的邮箱进行验证。',
    resetEmailSent: '重置邮件已发送，请检查收件箱。',
    forgotPassword: '忘记密码？',
    backToLogin: '返回登录',
    noAccount: '没有账号？',
    hasAccount: '已有账号？',
    switchToSignup: '注册',
    switchToLogin: '登录',
    privacyAccept: '我已阅读并同意',
    privacyLink: '隐私政策',
    privacyRequired: '请先同意隐私政策。',
    displayNameRequired: '请输入用户名。',
    captchaRequired: '请完成人机验证。',
  },
  en: {
    title: 'CFDQandA',
    descriptionLogin: 'Please log in with your email.',
    descriptionSignup: 'Create a new account.',
    descriptionReset: 'Enter your email and we will send a password reset link.',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    displayName: 'Display Name',
    displayNamePlaceholder: 'Enter your display name',
    organization: 'Organization',
    organizationPlaceholder: 'Enter your organization',
    loginButton: 'Login',
    signupButton: 'Sign Up',
    resetButton: 'Send Reset Email',
    loading: 'Loading...',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Sign up successful! Please check your email for verification.',
    resetEmailSent: 'Reset email sent. Please check your inbox.',
    forgotPassword: 'Forgot password?',
    backToLogin: 'Back to Login',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    switchToSignup: 'Sign Up',
    switchToLogin: 'Login',
    privacyAccept: 'I have read and agree to the',
    privacyLink: 'Privacy Policy',
    privacyRequired: 'Please accept the Privacy Policy.',
    displayNameRequired: 'Please enter a display name.',
    captchaRequired: 'Please complete the CAPTCHA verification.',
  }
};

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function Auth({ language, setLanguage }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formMode, setFormMode] = useState('login') // 'login' | 'signup' | 'reset'

  // Signup-only fields
  const [displayName, setDisplayName] = useState('')
  const [organization, setOrganization] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  const t = strings[language];

  const handleLogin = async (event) => {
    event.preventDefault()
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      toast.error(t.captchaRequired);
      return;
    }
    try {
      setLoading(true)
      const options = {};
      if (captchaToken) {
        options.captchaToken = captchaToken;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password, options })
      if (error) throw error
      toast.success(t.loginSuccess)
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (event) => {
    event.preventDefault()

    if (!displayName.trim()) {
      toast.error(t.displayNameRequired);
      return;
    }
    if (!privacyAccepted) {
      toast.error(t.privacyRequired);
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      toast.error(t.captchaRequired);
      return;
    }

    try {
      setLoading(true)
      const signUpOptions = {};
      if (captchaToken) {
        signUpOptions.captchaToken = captchaToken;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions,
      })
      if (error) throw error

      // Write profile to user_profiles table
      if (data.user) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: data.user.id,
          display_name: displayName.trim(),
          organization: organization.trim() || null,
          privacy_accepted_at: new Date().toISOString(),
        });
        if (profileError) {
          console.error('Failed to create profile:', profileError);
        }
      }

      toast.success(t.signupSuccess)
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      })
      if (error) throw error
      toast.success(t.resetEmailSent)
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (mode) => {
    setFormMode(mode);
    setCaptchaToken('');
  };

  const description = formMode === 'signup' ? t.descriptionSignup
    : formMode === 'reset' ? t.descriptionReset
    : t.descriptionLogin;

  return (
    <div aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="header">{t.title}</h1>
        <div>
          <button onClick={() => setLanguage('en')} disabled={language==='en'} style={{ marginRight: '5px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', background: language==='en' ? 'var(--accent)' : 'transparent', color: language==='en' ? '#ffffff' : 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>EN</button>
          <button onClick={() => setLanguage('zh')} disabled={language==='zh'} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', background: language==='zh' ? 'var(--accent)' : 'transparent', color: language==='zh' ? '#ffffff' : 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>ZH</button>
        </div>
      </div>
      <p className="description">{description}</p>

      {/* === Login Form === */}
      {formMode === 'login' && (
        <form onSubmit={handleLogin}>
          <label htmlFor="email">{t.email}</label>
          <input id="email" className="inputField" type="email" placeholder={t.emailPlaceholder} value={email} required onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="password">{t.password}</label>
          <input id="password" className="inputField" type="password" placeholder={t.passwordPlaceholder} value={password} required onChange={(e) => setPassword(e.target.value)} />

          {/* Cloudflare Turnstile CAPTCHA */}
          {TURNSTILE_SITE_KEY && (
            <div style={{ margin: '12px 0' }}>
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                options={{ theme: 'dark', size: 'normal' }}
              />
            </div>
          )}

          <button className="button-block" disabled={loading}>
            {loading ? t.loading : t.loginButton}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.85rem' }}>
            <button type="button" onClick={() => switchMode('reset')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>
              {t.forgotPassword}
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>
              {t.noAccount}{' '}
              <button type="button" onClick={() => switchMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                {t.switchToSignup}
              </button>
            </span>
          </div>
        </form>
      )}

      {/* === Signup Form === */}
      {formMode === 'signup' && (
        <form onSubmit={handleSignUp}>
          <label htmlFor="signup-email">{t.email}</label>
          <input id="signup-email" className="inputField" type="email" placeholder={t.emailPlaceholder} value={email} required onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="signup-password">{t.password}</label>
          <input id="signup-password" className="inputField" type="password" placeholder={t.passwordPlaceholder} value={password} required onChange={(e) => setPassword(e.target.value)} />
          <label htmlFor="display-name">{t.displayName}</label>
          <input id="display-name" className="inputField" type="text" placeholder={t.displayNamePlaceholder} value={displayName} required onChange={(e) => setDisplayName(e.target.value)} />
          <label htmlFor="organization">{t.organization}</label>
          <input id="organization" className="inputField" type="text" placeholder={t.organizationPlaceholder} value={organization} onChange={(e) => setOrganization(e.target.value)} />

          {/* Privacy policy checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 6px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} />
            <span>
              {t.privacyAccept}{' '}
              <a href="#privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                {t.privacyLink}
              </a>
            </span>
          </label>

          {/* Cloudflare Turnstile CAPTCHA */}
          {TURNSTILE_SITE_KEY && (
            <div style={{ margin: '12px 0' }}>
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                options={{ theme: 'dark', size: 'normal' }}
              />
            </div>
          )}

          <button className="button-block" disabled={loading || !privacyAccepted}>
            {loading ? t.loading : t.signupButton}
          </button>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t.hasAccount}{' '}
            <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 600 }}>
              {t.switchToLogin}
            </button>
          </div>
        </form>
      )}

      {/* === Password Reset Form === */}
      {formMode === 'reset' && (
        <form onSubmit={handleResetPassword}>
          <label htmlFor="reset-email">{t.email}</label>
          <input id="reset-email" className="inputField" type="email" placeholder={t.emailPlaceholder} value={email} required onChange={(e) => setEmail(e.target.value)} />
          <button className="button-block" disabled={loading}>
            {loading ? t.loading : t.resetButton}
          </button>
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>
              {t.backToLogin}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
