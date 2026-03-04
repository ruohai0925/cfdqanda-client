import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './supabaseClient';
import AISimulationTab from './AISimulationTab';

const ExpertOrderTab = lazy(() => import('./ExpertOrderTab'));

// --- Language dictionary (shared header + tab labels) ---
const strings = {
  zh: {
    dashboardTitle: '计算流体力学问答',
    welcome: '欢迎',
    signOut: '登出',
    cloudStorage: '云端存储',
    cloudStorageDetail: '{count} 个任务',
    aiTab: 'AI 自动化仿真',
    expertTab: '专家接单系统',
  },
  en: {
    dashboardTitle: 'CFDQandA',
    welcome: 'Welcome',
    signOut: 'Sign Out',
    cloudStorage: 'Cloud Storage',
    cloudStorageDetail: '{count} tasks',
    aiTab: 'AI Simulation',
    expertTab: 'Expert Orders',
  }
};

export default function MainLayout({ session, language, setLanguage }) {
  const [activeTab, setActiveTab] = useState('ai');
  const [storageUsage, setStorageUsage] = useState(null);

  const t = strings[language];
  const API_URL = import.meta.env.VITE_API_SERVER_URL;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      const storageKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
      localStorage.removeItem(storageKey);
      window.location.reload();
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
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.welcome}, {session.user.email}!</span>
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
        <button
          className={`main-tab${activeTab === 'expert' ? ' main-tab-active' : ''}`}
          onClick={() => setActiveTab('expert')}
        >
          {t.expertTab}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'ai' ? (
        <AISimulationTab session={session} language={language} storageUsage={storageUsage} />
      ) : (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>}>
          <ExpertOrderTab session={session} language={language} />
        </Suspense>
      )}
    </div>
  );
}
