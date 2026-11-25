import { useEffect, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

// Cloudflare Turnstile with a visible state. The bare widget leaves an empty
// box when challenges.cloudflare.com is slow or unreachable (seen on networks
// that reset the connection), and react-turnstile never re-injects a script
// tag that failed. Here the user sees "loading", then after LOAD_TIMEOUT_MS a
// message and a reload button that drops the failed script and remounts.

const LOAD_TIMEOUT_MS = 8000
const SCRIPT_ID = 'cf-turnstile-script'

const strings = {
  zh: {
    loading: '人机验证加载中…',
    failed: '人机验证没有加载出来，可能是当前网络访问 Cloudflare 不稳定。',
    reload: '重新加载',
  },
  en: {
    loading: 'Loading the CAPTCHA…',
    failed: "The CAPTCHA didn't load; your network may be having trouble reaching Cloudflare.",
    reload: 'Reload',
  },
}

export default function CaptchaBox({ siteKey, language, turnstileRef, onToken }) {
  const t = strings[language] || strings.en
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState('loading')   // loading | ready | failed

  useEffect(() => {
    setState('loading')
    const id = setTimeout(() => setState((s) => (s === 'ready' ? s : 'failed')), LOAD_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [attempt])

  const reload = () => {
    if (!window.turnstile) document.getElementById(SCRIPT_ID)?.remove()
    onToken('')
    setAttempt((n) => n + 1)
  }

  return (
    <div style={{ margin: '12px 0', minHeight: 65 }}>
      <Turnstile
        key={`${attempt}-${language}`}
        ref={turnstileRef}
        siteKey={siteKey}
        onWidgetLoad={() => setState('ready')}
        onSuccess={(token) => { setState('ready'); onToken(token) }}
        onError={() => setState('failed')}
        onUnsupported={() => setState('failed')}
        onExpire={() => { onToken(''); turnstileRef.current?.reset() }}
        onTimeout={() => { onToken(''); turnstileRef.current?.reset() }}
        options={{ theme: 'dark', size: 'normal', language: language === 'zh' ? 'zh-cn' : 'en' }}
      />
      {state === 'loading' && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.loading}</div>
      )}
      {state === 'failed' && (
        <div role="alert" style={{ fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{t.failed}</span>
          <button type="button" onClick={reload}
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--accent)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>
            {t.reload}
          </button>
        </div>
      )}
    </div>
  )
}
