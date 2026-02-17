import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast'; // Toaster 已经移到 App.jsx
import FileBrowser from './components/FileBrowser';
// import './index.css'; // 这行不需要，index.css 应该在 main.jsx 中导入

// --- 语言字典 ---
const strings = {
  zh: {
    dashboardTitle: '计算流体力学问答',
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
    downloadError: '下载失败',
    browseFilesButton: '浏览文件',
    hideButton: '隐藏',
    showHiddenButton: '显示隐藏的任务',
    showNormalButton: '显示正常任务',
    restoreButton: '恢复',
    taskHiddenToast: '任务已隐藏',
    taskRestoredToast: '任务已恢复',
    taskQueuedToast: '新任务已排队!',
    taskStatusUpdateToast: '状态更新为',
    modelSettings: '模型设置',
    modelSettingsHint: '（可选）使用自己的 LLM 配置',
    modelProvider: 'LLM 提供商',
    modelVersion: '模型版本',
    apiKey: 'API Key',
    apiKeyHint: '仅用于本次任务，提交后立即从服务器删除',
    useServerDefault: '使用服务器默认配置',
    promptRequired: '请输入仿真需求！',
    apiKeyRequired: '选择了 {provider} 但未填写 API Key，请输入你的 API Key。',
    apiKeyInvalidOpenAI: 'OpenAI API Key 应以 "sk-" 开头，请检查格式。',
    apiKeyInvalidAnthropic: 'Anthropic API Key 应以 "sk-ant-" 开头，请检查格式。',
  },
  en: {
    dashboardTitle: 'CFDQandA',
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
    downloadError: 'Download failed',
    browseFilesButton: 'Browse Files',
    hideButton: 'Hide',
    showHiddenButton: 'Show Hidden Tasks',
    showNormalButton: 'Show Normal Tasks',
    restoreButton: 'Restore',
    taskHiddenToast: 'Task has been hidden',
    taskRestoredToast: 'Task has been restored',
    taskQueuedToast: 'New task has been queued!',
    taskStatusUpdateToast: 'status updated to',
    modelSettings: 'Model Settings',
    modelSettingsHint: '(Optional) Use your own LLM configuration',
    modelProvider: 'LLM Provider',
    modelVersion: 'Model Version',
    apiKey: 'API Key',
    apiKeyHint: 'Used only for this task. Deleted from server immediately after pickup.',
    useServerDefault: 'Use server default',
    promptRequired: 'Please enter your simulation requirements!',
    apiKeyRequired: 'You selected {provider} but did not provide an API Key. Please enter your API Key.',
    apiKeyInvalidOpenAI: 'OpenAI API Key should start with "sk-". Please check the format.',
    apiKeyInvalidAnthropic: 'Anthropic API Key should start with "sk-ant-". Please check the format.',
  }
};

// --- 已修改：现在从 props 接收 language 和 setLanguage ---
export default function Dashboard({ session, language, setLanguage }) {
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [hiddenSimulations, setHiddenSimulations] = useState(new Set());
  const [showHiddenView, setShowHiddenView] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [showFileBrowser, setShowFileBrowser] = useState(false);

  // --- 模型设置状态 ---
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [modelProvider, setModelProvider] = useState('');
  const [modelVersion, setModelVersion] = useState('');
  const [apiKey, setApiKey] = useState('');
  
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

  // 下载ZIP文件
  const handleDownloadZip = async (simulation) => {
    try {
      const { data, error } = await supabase.storage
        .from('simulation_results')
        .download(simulation.result_data.zip_storage_path);
      
      if (error) throw error;
      
      // 创建下载链接，文件名格式为 results-{task_id}.zip
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-${simulation.id}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ZIP file:', error);
      toast.error(t.downloadError);
    }
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
    event.preventDefault();
    if (!newPrompt.trim()) {
      toast.error(t.promptRequired);
      return;
    }

    // Validate API key when a cloud provider is selected
    if (showModelSettings && (modelProvider === 'openai' || modelProvider === 'anthropic')) {
      if (!apiKey.trim()) {
        toast.error(t.apiKeyRequired.replace('{provider}', modelProvider === 'openai' ? 'OpenAI' : 'Anthropic'));
        return;
      }
      if (modelProvider === 'openai' && !apiKey.startsWith('sk-')) {
        toast.error(t.apiKeyInvalidOpenAI);
        return;
      }
      if (modelProvider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
        toast.error(t.apiKeyInvalidAnthropic);
        return;
      }
    }

    setLoading(true);
    try {
      // Build request body (user_id comes from JWT, not from body)
      const requestBody = { prompt: newPrompt };
      if (showModelSettings && (modelProvider || modelVersion || apiKey)) {
        const llmConfig = {};
        if (modelProvider) llmConfig.model_provider = modelProvider;
        if (modelVersion) llmConfig.model_version = modelVersion;
        if (apiKey) llmConfig.api_key = apiKey;
        requestBody.llm_config = llmConfig;
      }

      const response = await fetch(`${API_URL}/api/v1/simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit request');
      }
      setNewPrompt('');
      setApiKey(''); // 提交后立即清除前端内存中的 API key
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
          {/* --- 模型设置折叠区 --- */}
          <div style={{ margin: '12px 0' }}>
            <button
              type="button"
              onClick={() => setShowModelSettings(!showModelSettings)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6200ea',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.9rem',
              }}
            >
              {showModelSettings ? '▼' : '▶'} {t.modelSettings} {t.modelSettingsHint}
            </button>

            {showModelSettings && (
              <div style={{
                marginTop: '10px',
                padding: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fafafa',
              }}>
                {/* Provider 下拉 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {t.modelProvider}
                  </label>
                  <select
                    value={modelProvider}
                    onChange={(e) => {
                      setModelProvider(e.target.value);
                      setModelVersion('');
                      setApiKey('');
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">{t.useServerDefault}</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="ollama">Ollama (Local)</option>
                  </select>
                </div>

                {/* Model Version 输入框 */}
                {modelProvider && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {t.modelVersion}
                    </label>
                    <input
                      type="text"
                      className="inputField"
                      value={modelVersion}
                      onChange={(e) => setModelVersion(e.target.value)}
                      placeholder={
                        modelProvider === 'openai' ? 'gpt-4o' :
                        modelProvider === 'anthropic' ? 'claude-sonnet-4-5-20250929' :
                        modelProvider === 'ollama' ? 'qwen2.5:32b-instruct' : ''
                      }
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                )}

                {/* API Key 密码输入（仅 openai / anthropic 显示） */}
                {(modelProvider === 'openai' || modelProvider === 'anthropic') && (
                  <div style={{ marginBottom: '4px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {t.apiKey}
                    </label>
                    <input
                      type="password"
                      className="inputField"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={modelProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                      autoComplete="off"
                      style={{ marginBottom: '4px' }}
                    />
                    <small style={{ color: '#888', fontSize: '0.78rem' }}>{t.apiKeyHint}</small>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="button-block" type="submit" disabled={loading || !newPrompt.trim()}>
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
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {sim.status === 'completed' && sim.result_data?.file_tree && (
                          <button
                            className="browse-files-button"
                            onClick={() => {
                              setSelectedSimulation(sim);
                              setShowFileBrowser(true);
                            }}
                          >
                            {t.browseFilesButton}
                          </button>
                        )}
                        {sim.status === 'completed' && sim.result_data?.zip_storage_path && (
                          <button
                            className="download-link"
                            onClick={() => handleDownloadZip(sim)}
                            style={{ cursor: 'pointer', border: 'none' }}
                          >
                            {t.downloadButton}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {/* 文件浏览器 Modal */}
      {showFileBrowser && selectedSimulation && selectedSimulation.result_data?.file_tree && (
        <FileBrowser
          jobId={selectedSimulation.id}
          userId={session.user.id}
          accessToken={session.access_token}
          fileTree={selectedSimulation.result_data.file_tree}
          storageBasePath={selectedSimulation.result_data.storage_base_path}
          language={language}
          apiUrl={API_URL}
          onClose={() => {
            setShowFileBrowser(false);
            setSelectedSimulation(null);
          }}
        />
      )}
    </div>
  );
}