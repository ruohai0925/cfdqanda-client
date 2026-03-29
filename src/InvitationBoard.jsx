import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const strings = {
  zh: {
    title: '邀请码',
    subtitle: '选择一个可用的邀请码，复制后返回注册页面使用',
    available: '可用',
    used: '已使用',
    copy: '复制',
    copied: '已复制！',
    remaining: '{n} / {total} 可用',
    allUsed: '全部已使用，正在生成新一批...',
    loading: '加载中...',
    error: '加载失败，请刷新重试',
    back: '← 返回注册',
    refresh: '刷新',
  },
  en: {
    title: 'Invitation Codes',
    subtitle: 'Pick an available code, copy it, then go back to register',
    available: 'Available',
    used: 'Used',
    copy: 'Copy',
    copied: 'Copied!',
    remaining: '{n} / {total} available',
    allUsed: 'All used — generating a new batch...',
    loading: 'Loading...',
    error: 'Failed to load. Please refresh.',
    back: '← Back to Register',
    refresh: 'Refresh',
  },
};

export default function InvitationBoard({ language, onBack }) {
  const t = strings[language] || strings.en;
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: rpcError } = await supabase.rpc(
        'list_invitation_codes_with_replenish',
        { batch_size: 20 }
      );
      if (rpcError) throw rpcError;
      setCodes(data || []);
    } catch (e) {
      console.error('Failed to fetch invitation codes:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${t.copied} ${code}`, { duration: 2000 });
    } catch {
      // Fallback for HTTP contexts
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success(`${t.copied} ${code}`, { duration: 2000 });
    }
  };

  const availableCount = codes.filter(c => !c.is_used).length;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}
        >{t.back}</button>
        <button
          onClick={fetchCodes}
          disabled={loading}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
        >{t.refresh}</button>
      </div>

      <h2 style={{ margin: '0 0 4px', textAlign: 'center' }}>{t.title}</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px' }}>{t.subtitle}</p>

      {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t.loading}</p>}
      {error && <p style={{ textAlign: 'center', color: 'var(--danger)' }}>{t.error}</p>}

      {!loading && !error && (
        <>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: '0 0 16px', fontWeight: 600 }}>
            {t.remaining.replace('{n}', availableCount).replace('{total}', codes.length)}
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {codes.map((c) => (
              <div
                key={c.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: `1px solid ${c.is_used ? 'var(--border)' : 'var(--accent)'}`,
                  background: c.is_used ? 'var(--bg-secondary, #f5f5f5)' : 'transparent',
                  opacity: c.is_used ? 0.5 : 1,
                }}
              >
                <code style={{
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.03em',
                  textDecoration: c.is_used ? 'line-through' : 'none',
                  color: c.is_used ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>
                  {c.code}
                </code>
                {c.is_used ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.used}</span>
                ) : (
                  <button
                    onClick={() => handleCopy(c.code)}
                    style={{
                      background: 'var(--accent)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '3px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >{t.copy}</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
