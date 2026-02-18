import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import FileBrowser from './components/FileBrowser';

// --- Language dictionary ---
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
    noMatchingHistory: '当前筛选条件下没有任务。',
    case: '任务',
    demand: '需求',
    status: '状态',
    time: '时间',
    downloadButton: '下载结果 (.zip)',
    downloadError: '下载失败',
    browseFilesButton: '浏览文件',
    deleteButton: '删除',
    undoButton: '撤销',
    taskDeletedToast: '任务已删除',
    taskRestoredToast: '任务已恢复',
    taskQueuedToast: '新任务已排队!',
    taskStatusUpdateToast: '状态更新为',
    showMore: '展开',
    showLess: '收起',
    filterAll: '全部',
    filterActive: '进行中',
    filterCompleted: '已完成',
    filterFailed: '失败',
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
    noMatchingHistory: 'No tasks match the current filter.',
    case: 'Case',
    demand: 'Demand',
    status: 'Status',
    time: 'Time',
    downloadButton: 'Download Results (.zip)',
    downloadError: 'Download failed',
    browseFilesButton: 'Browse Files',
    deleteButton: 'Delete',
    undoButton: 'Undo',
    taskDeletedToast: 'Task deleted',
    taskRestoredToast: 'Task restored',
    taskQueuedToast: 'New task has been queued!',
    taskStatusUpdateToast: 'status updated to',
    showMore: 'more',
    showLess: 'less',
    filterAll: 'All',
    filterActive: 'Active',
    filterCompleted: 'Completed',
    filterFailed: 'Failed',
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

const PROMPT_TRUNCATE_LENGTH = 120;
const UNDO_TOAST_DURATION = 8000; // 8 seconds to click undo

export default function Dashboard({ session, language, setLanguage }) {
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedPrompts, setExpandedPrompts] = useState(new Set());

  // Model settings state
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [modelProvider, setModelProvider] = useState('');
  const [modelVersion, setModelVersion] = useState('');
  const [apiKey, setApiKey] = useState('');

  const t = strings[language];
  const API_URL = import.meta.env.VITE_API_SERVER_URL;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Download ZIP
  const handleDownloadZip = async (simulation) => {
    try {
      const { data, error } = await supabase.storage
        .from('simulation_results')
        .download(simulation.result_data.zip_storage_path);
      if (error) throw error;

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

  // Soft delete: call API immediately, show undo toast on success
  const handleDelete = async (sim) => {
    const jobId = sim.id;
    // Optimistically remove from UI
    setSimulations((prev) => prev.filter((s) => s.id !== jobId));

    // Immediately call DELETE API
    try {
      const resp = await fetch(`${API_URL}/api/v1/simulations/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.detail || 'Delete failed');
      }
    } catch (err) {
      // API failed → restore card immediately so user sees it didn't work
      setSimulations((prev) => [sim, ...prev].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ));
      toast.error(err.message);
      return;
    }

    // API succeeded → show toast with undo button
    toast((toastObj) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {t.taskDeletedToast}
        <button
          onClick={() => {
            handleRestore(sim);
            toast.dismiss(toastObj.id);
          }}
          style={{
            background: '#6200ea',
            color: 'white',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.85rem',
          }}
        >
          {t.undoButton}
        </button>
      </span>
    ), { duration: UNDO_TOAST_DURATION });
  };

  // Restore a soft-deleted simulation via API
  const handleRestore = async (sim) => {
    try {
      const resp = await fetch(`${API_URL}/api/v1/simulations/${sim.id}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.detail || 'Restore failed');
      }
      // Success → add card back to UI
      setSimulations((prev) => [sim, ...prev].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ));
      toast.success(t.taskRestoredToast);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Toggle prompt expansion
  const togglePromptExpand = (simId) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(simId)) {
        next.delete(simId);
      } else {
        next.add(simId);
      }
      return next;
    });
  };

  // Fetch simulations from Supabase (only non-deleted)
  async function getSimulations() {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('simulations')
        .select('id, created_at, prompt, status, result_data, deleted_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error && status !== 406) throw error;
      if (data) {
        setSimulations(data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSimulations();
    const subscription = supabase
      .channel('public:simulations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'simulations', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          // Ignore events for deleted simulations
          if (payload.new?.deleted_at) return;

          if (payload.eventType === 'INSERT') {
            setSimulations((prev) => [payload.new, ...prev]);
            toast.success(t.taskQueuedToast);
          } else if (payload.eventType === 'UPDATE') {
            setSimulations((prev) =>
              prev.map((sim) => sim.id === payload.new.id ? payload.new : sim)
            );
            toast.success(`${String(payload.new.id).substring(0,8)}... ${t.taskStatusUpdateToast}: ${payload.new.status}`);
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
      setApiKey('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter simulations by status
  const filteredSimulations = simulations.filter((sim) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return sim.status === 'queued' || sim.status === 'running';
    return sim.status === statusFilter;
  });

  // Count by status for filter tab badges
  const counts = {
    all: simulations.length,
    active: simulations.filter((s) => s.status === 'queued' || s.status === 'running').length,
    completed: simulations.filter((s) => s.status === 'completed').length,
    failed: simulations.filter((s) => s.status === 'failed').length,
  };

  const filterTabs = [
    { key: 'all', label: t.filterAll },
    { key: 'active', label: t.filterActive },
    { key: 'completed', label: t.filterCompleted },
    { key: 'failed', label: t.filterFailed },
  ];

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2>{t.dashboardTitle}</h2>
          <div>
            <button onClick={() => setLanguage('en')} disabled={language === 'en'}>EN</button>
            <button onClick={() => setLanguage('zh')} disabled={language === 'zh'}>ZH</button>
          </div>
        </div>
        <button className="button-block button-outline" style={{ width: 'auto' }} onClick={handleSignOut}>
          {t.signOut}
        </button>
      </div>

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
          {/* Model settings collapsible */}
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

      {/* History section */}
      <div style={{ marginTop: '2rem' }}>
        <h3>{t.historyTitle}</h3>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab ${statusFilter === tab.key ? 'filter-tab-active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="filter-count">{counts[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        {loading && simulations.length === 0 ? (
          <p>{t.loadingHistory}</p>
        ) : simulations.length === 0 ? (
          <p>{t.noHistory}</p>
        ) : filteredSimulations.length === 0 ? (
          <p>{t.noMatchingHistory}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredSimulations.map((sim) => {
              const isExpanded = expandedPrompts.has(sim.id);
              const promptText = sim.prompt || '';
              const needsTruncation = promptText.length > PROMPT_TRUNCATE_LENGTH;
              const displayPrompt = needsTruncation && !isExpanded
                ? promptText.substring(0, PROMPT_TRUNCATE_LENGTH) + '...'
                : promptText;

              return (
                <li key={sim.id} className="simulation-card">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4>{t.case} #{String(sim.id).substring(0, 8)}</h4>
                      <span className={`status-badge status-${sim.status}`}>
                        {sim.status}
                      </span>
                    </div>
                    {sim.status !== 'running' && sim.status !== 'queued' && (
                      <button className="delete-button" onClick={() => handleDelete(sim)}>
                        {t.deleteButton}
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    <p className="card-prompt">
                      <strong>{t.demand}:</strong>{' '}
                      {displayPrompt}
                      {needsTruncation && (
                        <button className="expand-button" onClick={() => togglePromptExpand(sim.id)}>
                          {isExpanded ? t.showLess : t.showMore}
                        </button>
                      )}
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

      {/* File browser modal */}
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
