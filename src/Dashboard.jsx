import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast'; // Toaster 已经移到 App.jsx
// import './index.css'; // 这行不需要，index.css 应该在 main.jsx 中导入

// --- 语言字典 ---
const strings = {
  zh: {
    dashboardTitle: '计算流体力学问答', // 修复了重复
    welcome: '欢迎',
    signOut: '登出',
    newSimulationTitle: '创建新的仿真任务',
    promptPlaceholder: '请在这里输入你的仿真需求...',
    submitButton: '提交任务',
    submittingButton: '提交中...',
    historyTitle: '历史记录',
    loadingHistory: '加载历史记录中...',
    noHistory: '你还没有任何仿真记录。',
    case: '任务',
    demand: '需求',
    status: '状态',
    time: '时间',
    downloadButton: '下载结果 (.zip)',
    hideButton: '隐藏',
    showHiddenButton: '显示隐藏的任务',
    showNormalButton: '显示正常任务',
    restoreButton: '恢复',
    taskHiddenToast: '任务已隐藏',
    taskRestoredToast: '任务已恢复',
    taskQueuedToast: '新任务已排队!',
    taskStatusUpdateToast: '状态更新为',
  },
  en: {
    dashboardTitle: 'CFDQandA', // 修复了重复
    welcome: 'Welcome',
    signOut: 'Sign Out',
    newSimulationTitle: 'Create a new simulation task',
    promptPlaceholder: 'Enter your simulation requirements here...',
    submitButton: 'Submit Task',
    submittingButton: 'Submitting...',
    historyTitle: 'History',
    loadingHistory: 'Loading history...',
    noHistory: 'You do not have any simulation records yet.',
    case: 'Case',
    demand: 'Demand',
    status: 'Status',
    time: 'Time',
    downloadButton: 'Download Results (.zip)',
    hideButton: 'Hide',
    showHiddenButton: 'Show Hidden Tasks',
    showNormalButton: 'Show Normal Tasks',
    restoreButton: 'Restore',
    taskHiddenToast: 'Task has been hidden',
    taskRestoredToast: 'Task has been restored',
    taskQueuedToast: 'New task has been queued!',
    taskStatusUpdateToast: 'status updated to',
  }
};

// --- 已修改：现在从 props 接收 language 和 setLanguage ---
export default function Dashboard({ session, language, setLanguage }) {
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [hiddenSimulations, setHiddenSimulations] = useState(new Set());
  const [showHiddenView, setShowHiddenView] = useState(false);
  
  // --- 已修改：不再需要本地的 language state，直接使用 prop ---
  const t = strings[language];

  const API_URL = import.meta.env.VITE_API_SERVER_URL;

  // localStorage 辅助函数
  const getHiddenSimulationsFromStorage = () => {
    try {
      const stored = localStorage.getItem(`hidden_simulations_${session.user.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error('Error loading hidden simulations:', error);
      return new Set();
    }
  };

  const saveHiddenSimulationsToStorage = (hiddenSet) => {
    try {
      localStorage.setItem(`hidden_simulations_${session.user.id}`, JSON.stringify([...hiddenSet]));
    } catch (error) {
      console.error('Error saving hidden simulations:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  const handleHideSimulation = (idToHide) => {
    // 添加到隐藏列表
    const newHiddenSet = new Set(hiddenSimulations);
    newHiddenSet.add(idToHide);
    setHiddenSimulations(newHiddenSet);
    
    // 保存到 localStorage
    saveHiddenSimulationsToStorage(newHiddenSet);
    
    // 从显示列表中移除
    setSimulations((currentSimulations) =>
      currentSimulations.filter((sim) => sim.id !== idToHide)
    );
    toast.success(t.taskHiddenToast);
  };

  const handleRestoreSimulation = async (idToRestore) => {
    // 从隐藏列表中移除
    const newHiddenSet = new Set(hiddenSimulations);
    newHiddenSet.delete(idToRestore);
    setHiddenSimulations(newHiddenSet);
    
    // 保存到 localStorage
    saveHiddenSimulationsToStorage(newHiddenSet);
    
    // 切换回正常视图
    setShowHiddenView(false);
    
    // 重新获取数据以显示恢复的simulation
    await getSimulations(newHiddenSet);
    toast.success(t.taskRestoredToast);
  };

  const toggleView = () => {
    if (showHiddenView) {
      // 切换到正常视图
      setShowHiddenView(false);
      getSimulations(hiddenSimulations);
    } else {
      // 切换到隐藏视图
      setShowHiddenView(true);
      getHiddenSimulations();
    }
  };

  async function getSimulations(hiddenSet = hiddenSimulations) {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('simulations')
        .select(`id, created_at, prompt, status, result_data`)
        .order('created_at', { ascending: false }); 

      if (error && status !== 406) throw error;
      if (data) {
        // 过滤掉隐藏的 simulations
        const filteredData = data.filter(sim => !hiddenSet.has(sim.id));
        setSimulations(filteredData);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getHiddenSimulations() {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('simulations')
        .select(`id, created_at, prompt, status, result_data`)
        .order('created_at', { ascending: false }); 

      if (error && status !== 406) throw error;
      if (data) {
        // 只显示隐藏的 simulations
        const hiddenData = data.filter(sim => hiddenSimulations.has(sim.id));
        setSimulations(hiddenData);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 从 localStorage 加载隐藏的 simulations
    const hiddenFromStorage = getHiddenSimulationsFromStorage();
    setHiddenSimulations(hiddenFromStorage);
    
    getSimulations(hiddenFromStorage);
    const subscription = supabase
      .channel('public:simulations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'simulations', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // 检查新插入的 simulation 是否被隐藏
            if (!hiddenFromStorage.has(payload.new.id)) {
              setSimulations((prev) => [payload.new, ...prev]);
              toast.success(t.taskQueuedToast);
            }
          } else if (payload.eventType === 'UPDATE') {
            // 检查更新的 simulation 是否被隐藏
            if (!hiddenFromStorage.has(payload.new.id)) {
              setSimulations((prev) =>
                prev.map((sim) => sim.id === payload.new.id ? payload.new : sim)
              );
              toast.success(`Task ${payload.new.id.substring(0,4)}... ${t.taskStatusUpdateToast}: ${payload.new.status}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [session, t.taskQueuedToast, t.taskStatusUpdateToast]); 

  const handleSubmit = async (event) => {
    // ... (handleSubmit 函数内容保持不变) ...
    event.preventDefault();
    if (!newPrompt.trim()) {
      toast.error('Please enter your simulation requirements!');
      return;
    }
    setLoading(true);
    try {
      const { user } = session;
      const response = await fetch(`${API_URL}/api/v1/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: newPrompt, user_id: user.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit request');
      }
      setNewPrompt('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Toaster 已经移到 App.jsx */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <h2>{t.dashboardTitle}</h2>
          <div>
            {/* --- 已修改：setLanguage 现在来自 props --- */}
            <button onClick={() => setLanguage('en')} disabled={language==='en'}>EN</button>
            <button onClick={() => setLanguage('zh')} disabled={language==='zh'}>ZH</button>
          </div>
        </div>
        <button className="button-block button-outline" style={{ width: 'auto' }} onClick={handleSignOut}>
          {t.signOut}
        </button>
      </div>
      
      {/* ... (剩下的所有 JSX 保持不变) ... */}
      <p>{t.welcome}, {session.user.email}!</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>{t.newSimulationTitle}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            className="inputField"
            placeholder={t.promptPlaceholder}
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            rows="4"
          />
          <button className="button-block" type="submit" disabled={loading}>
            {loading ? t.submittingButton : t.submitButton}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>{t.historyTitle}</h3>
          {hiddenSimulations.size > 0 && (
            <button 
              onClick={toggleView}
              style={{ 
                padding: '6px 12px', 
                border: '1px solid #6200ea', 
                borderRadius: '4px', 
                background: showHiddenView ? '#6200ea' : 'white', 
                color: showHiddenView ? 'white' : '#6200ea',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {showHiddenView ? t.showNormalButton : t.showHiddenButton}
            </button>
          )}
        </div>
        {loading && simulations.length === 0 ? (
          <p>{t.loadingHistory}</p>
        ) : simulations.length === 0 ? (
          <p>{t.noHistory}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {simulations.map((sim) => {
              let downloadUrl = null;
              if (sim.status === 'completed' && sim.result_data?.storage_path) {
                const { data } = supabase.storage
                  .from('simulation_results')
                  .getPublicUrl(sim.result_data.storage_path);
                downloadUrl = data.publicUrl;
              }
              return (
                <li key={sim.id} className="simulation-card">
                  <div className="card-header">
                    <h4>{t.case} #{sim.id}</h4>
                    {showHiddenView ? (
                      <button 
                        className="hide-button" 
                        onClick={() => handleRestoreSimulation(sim.id)}
                        style={{ background: '#28a745', borderColor: '#28a745', color: 'white' }}
                      >
                        {t.restoreButton}
                      </button>
                    ) : (
                      <button className="hide-button" onClick={() => handleHideSimulation(sim.id)}>
                        {t.hideButton}
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>{t.demand}:</strong> {sim.prompt}
                    </p>
                    <p>
                      <strong>{t.status}:</strong> 
                      <strong style={{
                        color: sim.status === 'completed' ? 'green' : (sim.status === 'failed' ? 'red' : '#e67e22')
                      }}>
                        {sim.status}
                      </strong>
                    </p>
                    <div className="card-time-row">
                      <small>{t.time}: {new Date(sim.created_at).toLocaleString()}</small>
                      {downloadUrl && (
                        <a href={downloadUrl} download className="download-link">
                          {t.downloadButton}
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}