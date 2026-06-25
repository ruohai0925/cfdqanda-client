import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import AISimulationTab from './AISimulationTab';

const ExpertOrderTab = lazy(() => import('./ExpertOrderTab'));

// --- Language dictionary (shared header + tab labels) ---
const strings = {
  zh: {
    dashboardTitle: 'Foam-Agent',
    welcome: '欢迎',
    signOut: '登出',
    cloudStorage: '云端存储',
    cloudStorageDetail: '{count} 个任务',
    aiTab: 'AI 自动化仿真',
    expertTab: '专家接单系统',
    deleteAccount: '删除账户',
    deleteAccountConfirmTitle: '删除账户',
    deleteAccountWarning: '此操作将永久删除您的账户及所有关联数据（仿真任务、文件、个人信息）。此操作不可撤销。',
    deleteAccountTypeEmail: '请输入您的邮箱以确认：',
    deleteAccountButton: '永久删除',
    deleteAccountCancel: '取消',
    deleteAccountSuccess: '账户已删除。',
    deleteAccountError: '删除失败，请稍后再试或联系支持。',
    deleting: '删除中...',
  },
  en: {
    dashboardTitle: 'Foam-Agent',
    welcome: 'Welcome',
    signOut: 'Sign Out',
    cloudStorage: 'Cloud Storage',
    cloudStorageDetail: '{count} tasks',
    aiTab: 'AI Simulation',
    expertTab: 'Expert Orders',
    deleteAccount: 'Delete Account',
    deleteAccountConfirmTitle: 'Delete Account',
    deleteAccountWarning: 'This will permanently delete your account and all associated data (simulations, files, profile). This action cannot be undone.',
    deleteAccountTypeEmail: 'Type your email to confirm:',
    deleteAccountButton: 'Delete Permanently',
    deleteAccountCancel: 'Cancel',
    deleteAccountSuccess: 'Account deleted.',
    deleteAccountError: 'Deletion failed. Please try again or contact support.',
    deleting: 'Deleting...',
  }
};

export default function MainLayout({ session, language, setLanguage }) {
  const [activeTab, setActiveTab] = useState('ai');
  const [storageUsage, setStorageUsage] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const t = strings[language];
  const API_URL = import.meta.env.VITE_API_SERVER_URL;

  // Fetch user display name from user_profiles; create profile if missing
  useEffect(() => {
    async function fetchOrCreateProfile() {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();
        if (data?.display_name) {
          setDisplayName(data.display_name);
          return;
        }
      } catch {
        // Profile doesn't exist — create from user_metadata (set during signup)
      }

      // Auto-create profile on first login
      const meta = session.user.user_metadata || {};
      const name = meta.display_name || session.user.email.split('@')[0];
      const profileData = {
        id: session.user.id,
        display_name: name,
        organization: meta.organization || null,
        privacy_accepted_at: new Date().toISOString(),
      };

      // Try frontend insert first (works if RLS allows INSERT for auth.uid() = id)
      const { error } = await supabase.from('user_profiles').insert(profileData);
      if (!error) {
        setDisplayName(name);
        return;
      }

      // Fallback: create via API server (uses service_role, bypasses RLS)
      try {
        const resp = await fetch(`${API_URL}/api/v1/users/me/profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ display_name: name, organization: meta.organization || null }),
        });
        if (resp.ok) setDisplayName(name);
      } catch {
        // Silent fail — display email as fallback
      }
    }
    fetchOrCreateProfile();
  }, [session.user.id]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      const storageKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
      localStorage.removeItem(storageKey);
      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailInput !== session.user.email) return;
    setDeletingAccount(true);
    try {
      const resp = await fetch(`${API_URL}/api/v1/users/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${resp.status}`);
      }
      toast.success(t.deleteAccountSuccess);
      // Sign out locally after deletion
      await supabase.auth.signOut({ scope: 'local' });
      window.location.reload();
    } catch (err) {
      toast.error(`${t.deleteAccountError} (${err.message})`);
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
      setDeleteEmailInput('');
    }
  };

  // Fetch cloud storage usage from API
  async function fetchStorageUsage() {
    try {
      const token = session?.access_token;
      if (!token) return;
      const resp = await fetch(`${API_URL}/api/v1/user/storage`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setStorageUsage(data);
      }
    } catch {
      // Silent fail — non-critical UI element
    }
  }

  // Fetch storage usage on mount and every 5 minutes
  useEffect(() => {
    fetchStorageUsage();
    const interval = setInterval(fetchStorageUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className="dashboard-container">
      {/* Shared header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ margin: 0 }}>{t.dashboardTitle}</h2>
          <div>
            <button onClick={() => setLanguage('en')} disabled={language === 'en'}>EN</button>
            <button onClick={() => setLanguage('zh')} disabled={language === 'zh'}>ZH</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.welcome}, {displayName || session.user.email}!</span>
          {storageUsage && (
            <span
              className="storage-indicator"
              title={t.cloudStorageDetail.replace('{count}', storageUsage.task_count)}
              style={{
                color: storageUsage.total_bytes < 500 * 1024 * 1024
                  ? 'var(--success)'
                  : storageUsage.total_bytes < 1024 * 1024 * 1024
                    ? 'var(--warning)'
                    : 'var(--danger)',
              }}
            >
              {t.cloudStorage}: {storageUsage.total_display}
            </span>
          )}
          <button className="button-block button-outline" style={{ width: 'auto', margin: 0 }} onClick={handleSignOut}>
            {t.signOut}
          </button>
          {/* Delete Account button — hidden for now (re-enable when needed)
          <button
            className="button-block"
            style={{ width: 'auto', margin: 0, background: 'var(--danger)', fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            {t.deleteAccount}
          </button>
          */}
        </div>
      </div>

      {/* Tab bar */}
      <div className="main-tabs">
        <button
          className={`main-tab${activeTab === 'ai' ? ' main-tab-active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          {t.aiTab}
        </button>
        {/* Expert Orders tab hidden (not in use) — restore by uncommenting this button:
        <button
          className={`main-tab${activeTab === 'expert' ? ' main-tab-active' : ''}`}
          onClick={() => setActiveTab('expert')}
        >
          {t.expertTab}
        </button>
        */}
      </div>

      {/* Tab content */}
      {activeTab === 'ai' ? (
        <AISimulationTab session={session} language={language} storageUsage={storageUsage} />
      ) : (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>}>
          <ExpertOrderTab session={session} language={language} />
        </Suspense>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => !deletingAccount && setShowDeleteConfirm(false)}>
          <div className="delete-account-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--danger)' }}>{t.deleteAccountConfirmTitle}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>{t.deleteAccountWarning}</p>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>{t.deleteAccountTypeEmail}</label>
            <input
              type="email"
              className="inputField"
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
              placeholder={session.user.email}
              disabled={deletingAccount}
              style={{ marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="button-block button-outline"
                style={{ width: 'auto', margin: 0 }}
                onClick={() => { setShowDeleteConfirm(false); setDeleteEmailInput(''); }}
                disabled={deletingAccount}
              >
                {t.deleteAccountCancel}
              </button>
              <button
                className="button-block"
                style={{ width: 'auto', margin: 0, background: 'var(--danger)' }}
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteEmailInput !== session.user.email}
              >
                {deletingAccount ? t.deleting : t.deleteAccountButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
