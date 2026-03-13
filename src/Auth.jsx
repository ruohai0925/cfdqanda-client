import { useState, useRef } from 'react'
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
    invitationCode: '邀请码',
    invitationCodePlaceholder: '请输入邀请码（如 CFDQ-XXXX-XXXX-XXXX）',
    invitationCodeRequired: '请输入邀请码。',
    invitationCodeInvalid: '邀请码无效或已被使用。',
    emailAlreadyInvited: '该邮箱已使用过邀请码。',
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
    invitationCode: 'Invitation Code',
    invitationCodePlaceholder: 'Enter your invitation code (e.g. CFDQ-XXXX-XXXX-XXXX)',
    invitationCodeRequired: 'Please enter an invitation code.',
    invitationCodeInvalid: 'Invalid or already used invitation code.',
    emailAlreadyInvited: 'This email has already used an invitation code.',
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
  const [invitationCode, setInvitationCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [organization, setOrganization] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef(null);

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
      // Reset Turnstile so a fresh token is generated for the next attempt
      setCaptchaToken('');
      turnstileRef.current?.reset();
    }
  }

  const handleSignUp = async (event) => {
    event.preventDefault()

    if (!invitationCode.trim()) {
      toast.error(t.invitationCodeRequired);
      return;
    }
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

      // Step 1: Claim invitation code (atomic, prevents concurrent use)
      const { data: claimResult, error: claimError } = await supabase
        .rpc('claim_invitation_code', {
          p_code: invitationCode.trim(),
          p_email: email.trim(),
        });

      if (claimError) {
        toast.error(t.invitationCodeInvalid);
        return;
      }
      if (!claimResult?.success) {
        const errKey = claimResult?.error;
        toast.error(errKey === 'email_already_used' ? t.emailAlreadyInvited : t.invitationCodeInvalid);
        return;
      }

      // Step 2: Sign up (invitation code already claimed)
      const signUpOptions = {
        // Store display_name/organization in user_metadata so it survives
        // email verification. Profile row is created on first login (MainLayout).
        data: {
          display_name: displayName.trim(),
          organization: organization.trim() || null,
        },
      };
      if (captchaToken) {
        signUpOptions.captchaToken = captchaToken;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions,
      })

      if (error) {
        // Sign up failed — unclaim the invitation code so it can be reused
        await supabase.rpc('unclaim_invitation_code', {
          p_code: invitationCode.trim(),
          p_email: email.trim(),
        });
        throw error;
      }

      toast.success(t.signupSuccess)
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
      setCaptchaToken('');
      turnstileRef.current?.reset();
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      toast.error(t.captchaRequired);
      return;
    }
    try {
      setLoading(true)
      const options = { redirectTo: `${window.location.origin}` };
      if (captchaToken) {
        options.captchaToken = captchaToken;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, options)
      if (error) throw error
      toast.success(t.resetEmailSent)
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
      setCaptchaToken('');
      turnstileRef.current?.reset();
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
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => { setCaptchaToken(''); turnstileRef.current?.reset(); }}
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
          <label htmlFor="invitation-code">{t.invitationCode}</label>
          <input id="invitation-code" className="inputField" type="text" placeholder={t.invitationCodePlaceholder} value={invitationCode} required onChange={(e) => setInvitationCode(e.target.value.toUpperCase())} style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }} />

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
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => { setCaptchaToken(''); turnstileRef.current?.reset(); }}
                options={{ theme: 'dark', size: 'normal' }}
              />
            </div>
          )}

          <button className="button-block" disabled={loading || !privacyAccepted || !invitationCode.trim()}>
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

          {/* Cloudflare Turnstile CAPTCHA */}
          {TURNSTILE_SITE_KEY && (
            <div style={{ margin: '12px 0' }}>
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => { setCaptchaToken(''); turnstileRef.current?.reset(); }}
                options={{ theme: 'dark', size: 'normal' }}
              />
            </div>
          )}

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
