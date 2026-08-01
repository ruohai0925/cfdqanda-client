import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import FileBrowser from './components/FileBrowser';
import promptExamples from './data/promptExamples';
import { formatFileSize } from './utils/fileUtils';

// --- Language dictionary ---
const strings = {
  zh: {
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
    filterCancelled: '已取消',
    modelSettings: '模型选择',
    modelSettingsHint: '',
    modelProvider: 'LLM 提供商',
    modelVersion: '模型版本',
    apiKey: 'API Key',
    apiKeyHint: '仅用于本次任务，提交后立即从服务器删除',
    modelChoiceDefault: 'Codex (gpt-5.5)',
    modelChoiceDefaultDesc: '平台提供 · 每人每天 {limit} 次',
    dailyUsage: '今日已用 {used}/{limit} 次',
    dailyUsageExhausted: '今日额度已用完，请明天再试或使用 BYOK',
    modelChoiceClaude: 'Claude (Opus)',
    modelChoiceClaudeDesc: '平台提供 · 每人每天 Opus 2 次 / Sonnet 5 次 · 高峰时可能排队',
    modelChoiceBYOK: '自带 API Key (BYOK)',
    modelChoiceBYOKDesc: '使用自己的 API Key，不受平台额度限制',
    promptRequired: '请输入仿真需求！',
    apiKeyRequired: '请输入你的 API Key。',
    apiKeyInvalidOpenAI: 'OpenAI API Key 应以 "sk-" 开头，请检查格式。',
    apiKeyInvalidAnthropic: 'Anthropic API Key 应以 "sk-ant-" 开头，请检查格式。',
    codexTokenLabel: 'Codex 认证 Token（可选）',
    codexTokenPlaceholder: '粘贴 ~/.codex/auth.json 中的 access_token',
    codexTokenHint: '留空则使用平台默认额度。填写自己的 token 则不受平台额度限制。⚠️ Codex token 每 ~10 天就会过期，需要重新登录 ChatGPT 客户端获取，建议长期使用选 BYOK 的常规 API Key。',
    codexTokenRequired: 'BYOK 模式下必须填写你自己的 Codex Token。',
    byokProviderLabel: '提供商',
    builtInSolver: '内置求解器',
    solverOpenFOAM: 'OpenFOAM v10',
    solverAMReX: 'AMReX',
    solverAMReXNote: 'AMReX-Agent 正在开发中，敬请期待。',
    cancelButton: '取消',
    cancellingButton: '取消中...',
    taskCancelledToast: '任务已取消',
    cancelFailedToast: '取消失败',
    examplesTitle: '示例 Prompt（点击填入）',
    examplesHint: '建议从简单算例开始。更多验证过的 Prompt 见',
    examplesLinkText: 'FoamGPT 数据集',
    meshUploadLabel: '上传网格文件（可选）',
    meshUploadHint: '支持 Gmsh .msh 格式，最大 100 MB',
    meshUploadInvalidType: '仅支持 .msh 文件',
    meshUploadTooLarge: '文件不能超过 100 MB',
    meshUploadUploading: '上传网格文件中...',
    meshUploadRemove: '移除',
    meshUploadFailed: '网格文件上传失败',
    preRunSettings: '执行设置',
    preRunHint: '（可选）选择执行模式和 Pre-Run 验证',
    preRunSteps: 'Pre-Run 步数',
    preRunSingleStep: '单步验证（默认）',
    preRun10Steps: '10 步',
    preRun100Steps: '100 步',
    pipelineMode: '执行模式',
    pipelineModeAuto: '端到端模式（End-to-End）',
    pipelineModeControlled: '交互模式（Interactive）',
    pipelineCheckpoints: '暂停检查点',
    pipelineCheckpointFiles: '检查生成文件',
    pipelineCheckpointPreRun: '检查 Pre-Run 结果',
    pipelineStageLabel: '当前阶段',
    pipelineStages: {
      planning: '分析需求中',
      plan_review: '方案待审阅',
      generating: '生成文件中',
      files_review: '文件待检查',
      pre_running: '预运行中',
      pre_run_review: 'Pre-Run 待检查',
      running: '仿真运行中',
      reviewing: '错误修复中',
    },
    checkpointStatus: '待确认',
    checkpointOriginalEndTime: '完整 endTime',
    checkpointPreRunEndTime: 'Pre-Run 步数',
    checkpointConfirmButton: '继续运行',
    checkpointRejectButton: '放弃',
    checkpointConfirmingButton: '确认中...',
    checkpointConfirmedToast: '已确认，完整仿真即将开始',
    checkpointRejectedToast: '已放弃，任务标记为失败',
    checkpointActionFailedToast: '操作失败',
    browsePreRunButton: '查看 Pre-Run 结果',
    browseFilesReviewButton: '查看生成文件',
    browseFilesButton: '浏览文件',
    errorReason: '失败原因',
    errorCodexQuota: '平台 Codex 额度暂时用完，每几小时会自动恢复，请稍等后重试，或使用 BYOK 自带 API Key。',
    errorRateLimit: 'LLM API 速率限制或额度超限，请稍后重试或更换 API Key / 模型。',
    errorAuth: 'LLM API 认证失败，请检查你的 API Key。',
    errorTimeout: '仿真未在限定时间内收敛。建议放宽残差标准、简化模型，或延长超时时间。',
    errorOOM: '网格过大导致内存不足（OOM）。建议简化几何、降低网格密度，或上传更精简的 .msh 文件。',
    errorDiskExceeded: '仿真输出超过磁盘限制。建议减少输出频率（增大 writeInterval）或简化模型。',
    errorConfigError: '仿真配置错误，请查看详细日志。',
    timeoutLabel: '超时时间',
    timeoutDefault: '默认（60 分钟）',
    resourceHint: '提示:多相流、流固耦合、精细网格等复杂算例可能超出时限或内存(单核运行)。建议先用较粗网格/较短物理时长验证设置,再逐步加密;必要时选择更长的超时时间。已经跑失败的算例,可到 cfdqanda.com(同账号登录)提交专业诊断。',
    queuePosition: '排队第 {n} 位',
    queueElapsed: '已等待 {min} 分钟',
    queueElapsedShort: '刚提交',
    cloudStorageDetail: '{count} 个任务',
    expiresInDays: '{days} 天后自动删除',
    expiresToday: '今天将自动删除',
    saveSettings: '保存设置',
    saveModelSettings: '保存模型设置',
    saveExecutionSettings: '保存执行设置',
    settingsSaved: '设置已保存',
    modelSettingsSaved: '模型设置已保存',
    executionSettingsSaved: '执行设置已保存',
    settingsLoaded: '已加载上次保存的设置',
  },
  en: {
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
    filterCancelled: 'Cancelled',
    modelSettings: 'Model Selection',
    modelSettingsHint: '',
    modelProvider: 'LLM Provider',
    modelVersion: 'Model Version',
    apiKey: 'API Key',
    apiKeyHint: 'Used only for this task. Deleted from server immediately after pickup.',
    modelChoiceDefault: 'Codex (gpt-5.5)',
    modelChoiceDefaultDesc: 'Platform-provided · {limit} tasks/day per user',
    dailyUsage: 'Used {used}/{limit} today',
    dailyUsageExhausted: 'Daily quota exhausted. Try again tomorrow or use BYOK.',
    modelChoiceClaude: 'Claude (Opus)',
    modelChoiceClaudeDesc: 'Platform-provided · daily per user: Opus ×2, Sonnet ×5 · may queue at peak',
    modelChoiceBYOK: 'Bring Your Own Key (BYOK)',
    modelChoiceBYOKDesc: 'Use your own API key, no platform quota limits',
    promptRequired: 'Please enter your simulation requirements!',
    apiKeyRequired: 'Please enter your API Key.',
    apiKeyInvalidOpenAI: 'OpenAI API Key should start with "sk-". Please check the format.',
    apiKeyInvalidAnthropic: 'Anthropic API Key should start with "sk-ant-". Please check the format.',
    codexTokenLabel: 'Codex Auth Token (optional)',
    codexTokenPlaceholder: 'Paste access_token from ~/.codex/auth.json',
    codexTokenHint: 'Leave empty to use platform shared quota. Provide your own token for unlimited usage. ⚠️ Codex tokens expire every ~10 days and require re-login through the ChatGPT client; for stable long-term use prefer BYOK with a regular API key.',
    codexTokenRequired: 'BYOK mode requires your own Codex Token.',
    byokProviderLabel: 'Provider',
    builtInSolver: 'Built-in Solver',
    solverOpenFOAM: 'OpenFOAM v10',
    solverAMReX: 'AMReX',
    solverAMReXNote: 'AMReX-Agent is under development. Coming soon.',
    cancelButton: 'Cancel',
    cancellingButton: 'Cancelling...',
    taskCancelledToast: 'Task cancelled',
    cancelFailedToast: 'Cancel failed',
    examplesTitle: 'Example Prompts (click to fill)',
    examplesHint: 'Start with simple cases. More tested prompts at',
    examplesLinkText: 'FoamGPT Dataset',
    meshUploadLabel: 'Upload Mesh File (optional)',
    meshUploadHint: 'Gmsh .msh format, max 100 MB',
    meshUploadInvalidType: 'Only .msh files are supported',
    meshUploadTooLarge: 'File must be less than 100 MB',
    meshUploadUploading: 'Uploading mesh file...',
    meshUploadRemove: 'Remove',
    meshUploadFailed: 'Mesh file upload failed',
    preRunSettings: 'Execution Settings',
    preRunHint: '(Optional) Choose execution mode and Pre-Run validation',
    preRunSteps: 'Pre-Run Steps',
    preRunSingleStep: 'Single step (default)',
    preRun10Steps: '10 steps',
    preRun100Steps: '100 steps',
    pipelineMode: 'Execution Mode',
    pipelineModeAuto: 'End-to-End',
    pipelineModeControlled: 'Interactive (step-by-step)',
    pipelineCheckpoints: 'Review Checkpoints',
    pipelineCheckpointFiles: 'Review generated files',
    pipelineCheckpointPreRun: 'Review Pre-Run results',
    pipelineStageLabel: 'Current Stage',
    pipelineStages: {
      planning: 'Analyzing requirements',
      plan_review: 'Plan awaiting review',
      generating: 'Generating files',
      files_review: 'Files awaiting review',
      pre_running: 'Pre-running',
      pre_run_review: 'Pre-Run awaiting review',
      running: 'Running simulation',
      reviewing: 'Fixing errors',
    },
    checkpointStatus: 'Awaiting Review',
    checkpointOriginalEndTime: 'Full endTime',
    checkpointPreRunEndTime: 'Pre-Run Steps',
    checkpointConfirmButton: 'Continue Run',
    checkpointRejectButton: 'Reject',
    checkpointConfirmingButton: 'Confirming...',
    checkpointConfirmedToast: 'Confirmed. Full simulation will start shortly.',
    checkpointRejectedToast: 'Rejected. Task marked as failed.',
    checkpointActionFailedToast: 'Action failed',
    browsePreRunButton: 'View Pre-Run Results',
    browseFilesReviewButton: 'View Generated Files',
    browseFilesButton: 'Browse Files',
    errorReason: 'Reason',
    errorCodexQuota: 'Platform Codex quota temporarily exhausted. It resets every few hours — please wait and try again, or use BYOK with your own API key.',
    errorRateLimit: 'LLM API rate limit or quota exceeded. Please try again later, or use a different API key / model.',
    errorAuth: 'LLM API authentication failed. Please check your API key.',
    errorTimeout: 'Simulation did not converge within the time limit. Try relaxing residual targets, simplifying the model, or increasing the timeout.',
    errorOOM: 'Out of memory (OOM) — mesh too large. Try simplifying geometry, reducing mesh density, or uploading a lighter .msh file.',
    errorDiskExceeded: 'Simulation output exceeded disk limit. Try reducing output frequency (increase writeInterval) or simplifying the model.',
    errorConfigError: 'Simulation configuration error. Check the log for details.',
    timeoutLabel: 'Timeout',
    timeoutDefault: 'Default (60 min)',
    resourceHint: 'Note: complex cases (multiphase, FSI, fine meshes) may exceed the time limit or memory (single-core execution). Start with a coarser mesh / shorter physical time to validate the setup, then refine; pick a longer timeout if needed. For cases that already failed, submit them for professional diagnosis at cfdqanda.com (same account).',
    queuePosition: '#{n} in queue',
    queueElapsed: 'waiting {min} min',
    queueElapsedShort: 'just submitted',
    cloudStorageDetail: '{count} tasks',
    expiresInDays: 'Auto-deletes in {days}d',
    expiresToday: 'Auto-deletes today',
    saveSettings: 'Save Settings',
    saveModelSettings: 'Save Model Settings',
    saveExecutionSettings: 'Save Execution Settings',
    settingsSaved: 'Settings saved',
    modelSettingsSaved: 'Model settings saved',
    executionSettingsSaved: 'Execution settings saved',
    settingsLoaded: 'Loaded saved settings',
  }
};

const PROMPT_TRUNCATE_LENGTH = 120;
const UNDO_TOAST_DURATION = 8000; // 8 seconds to click undo

// TTL constants (must match worker.py)
const TTL_FAILED_DAYS = 7;
const TTL_COMPLETED_DAYS = 14;

// Returns days remaining before auto-deletion, or null if no TTL applies
function getDaysUntilExpiry(sim) {
  const ttl = (sim.status === 'failed' || sim.status === 'cancelled')
    ? TTL_FAILED_DAYS
    : sim.status === 'completed'
      ? TTL_COMPLETED_DAYS
      : null;
  if (ttl === null) return null;
  const created = new Date(sim.created_at);
  const expiresAt = new Date(created.getTime() + ttl * 24 * 60 * 60 * 1000);
  const remaining = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return remaining;
}

// Known model versions per provider (updated 2026-03)
// Users can also type any custom model ID not in this list
const MODEL_VERSIONS = {
  'openai': [
    { value: 'gpt-5.5', label: 'gpt-5.5 (flagship, recommended)', isDefault: true },
    { value: 'gpt-5.4', label: 'gpt-5.4' },
    { value: 'gpt-5.4-mini', label: 'gpt-5.4-mini (fast)' },
    { value: 'gpt-5.3-codex', label: 'gpt-5.3-codex (legacy coding)' },
    { value: 'gpt-5-mini', label: 'gpt-5-mini (cheapest)' },
    { value: 'gpt-5-nano', label: 'gpt-5-nano' },
    { value: 'gpt-4.1', label: 'gpt-4.1' },
    { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
    { value: 'gpt-4o', label: 'gpt-4o' },
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'o3', label: 'o3 (reasoning)' },
    { value: 'o3-pro', label: 'o3-pro (strongest reasoning)' },
    { value: 'o4-mini', label: 'o4-mini (fast reasoning)' },
  ],
  'anthropic': [
    { value: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6 (recommended)', isDefault: true },
    { value: 'claude-opus-4-6', label: 'claude-opus-4-6 (most capable)' },
    { value: 'claude-haiku-4-5-20251001', label: 'claude-haiku-4-5 (fastest/cheapest)' },
    { value: 'claude-sonnet-4-5-20250929', label: 'claude-sonnet-4-5' },
  ],
  // DeepSeek V4 family (v4-pro / v4-flash) defaults to thinking mode, which
  // rejects tool_choice — incompatible with Foam-Agent's structured-output
  // planner. The legacy `deepseek-chat` / `deepseek-reasoner` aliases were
  // also removed from DeepSeek's API. Tested 2026-05-23, all DeepSeek models
  // currently fail at the planner stage with HTTP 400 "Thinking mode does
  // not support this tool_choice". Tracked in docs/active/Foam-Agent-Comments.md
  // (section 7) — fix needs upstream Foam-Agent extra_body passthrough.
  'deepseek': [
    { value: 'deepseek-v4-pro', label: 'deepseek-v4-pro (currently unavailable)', isDefault: true },
    { value: 'deepseek-v4-flash', label: 'deepseek-v4-flash (currently unavailable)' },
  ],
  'qwen': [
    { value: 'qwen-plus', label: 'qwen-plus (recommended)', isDefault: true },
    { value: 'qwen-turbo', label: 'qwen-turbo (fast)' },
    { value: 'qwen-max', label: 'qwen-max (strongest)' },
    { value: 'qwen3.5-plus', label: 'qwen3.5-plus (latest)' },
  ],
};

// OpenAI-compatible providers: use OPENAI_API_BASE to redirect API calls
const OPENAI_COMPATIBLE_PROVIDERS = {
  'deepseek': 'https://api.deepseek.com',
  'qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
};

export default function AISimulationTab({ session, language, storageUsage }) {
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedPrompts, setExpandedPrompts] = useState(new Set());

  // Solver backend state
  const [solverBackend, setSolverBackend] = useState('openfoam-v10');

  // Model settings state
  // modelChoice: 'default' (openai-codex/gpt-5.5), 'byok' (bring your own key)
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [modelChoice, setModelChoice] = useState('default');
  const [modelProvider, setModelProvider] = useState('openai');
  const [modelVersion, setModelVersion] = useState('');
  const [codexModel, setCodexModel] = useState('');  // '' = default (gpt-5.5)
  const [claudeModel, setClaudeModel] = useState('');  // '' = default (opus), via claude-bridge
  const [apiKey, setApiKey] = useState('');
  const [codexToken, setCodexToken] = useState('');
  const [meshFile, setMeshFile] = useState(null); // File object or null

  // Pre-run settings state
  const [showPreRunSettings, setShowPreRunSettings] = useState(false);
  const [preRunEndTime, setPreRunEndTime] = useState('1');  // '1' = single step (default), '10', '100'
  const [pipelineMode, setPipelineMode] = useState('auto');  // 'auto' or 'controlled'
  const [selectedCheckpoints, setSelectedCheckpoints] = useState(['files_review', 'pre_run_review']);
  const [timeoutMinutes, setTimeoutMinutes] = useState('');  // '' = default (60 min)

  // Checkpoint action state (track which jobs are being confirmed/rejected)
  const [checkpointActionJobs, setCheckpointActionJobs] = useState(new Set());

  const [cancellingJobs, setCancellingJobs] = useState(new Set());

  // Daily usage state (used/limit/remaining)
  const [dailyUsage, setDailyUsage] = useState(null);

  // Queue info state (for showing position + elapsed time on queued tasks)
  const [queueInfo, setQueueInfo] = useState(null);
  const [now, setNow] = useState(Date.now());

  const t = strings[language];
  const API_URL = import.meta.env.VITE_API_SERVER_URL;

  // --- Persistent settings (localStorage) ---
  const SETTINGS_KEY = `cfdqanda_settings_${session?.user?.id || 'anon'}`;

  const saveUserSettings = () => {
    const settings = {
      modelChoice, codexModel, claudeModel, modelProvider, modelVersion, solverBackend,
      pipelineMode, selectedCheckpoints, preRunEndTime, timeoutMinutes,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    toast.success(t.settingsSaved);
  };

  const saveModelSettings = () => {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    Object.assign(saved, { modelChoice, codexModel, claudeModel, modelProvider, modelVersion, solverBackend });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
    toast.success(t.modelSettingsSaved);
  };

  const saveExecutionSettings = () => {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    Object.assign(saved, { pipelineMode, selectedCheckpoints, preRunEndTime, timeoutMinutes });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
    toast.success(t.executionSettingsSaved);
  };

  // Load saved settings on mount (once)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (!saved) return;
      const s = JSON.parse(saved);
      if (s.modelChoice) setModelChoice(s.modelChoice);
      if (s.modelProvider) setModelProvider(s.modelProvider);
      if (s.codexModel !== undefined) setCodexModel(s.codexModel);
      if (s.claudeModel !== undefined) setClaudeModel(s.claudeModel === 'haiku' ? '' : s.claudeModel);
      if (s.modelVersion !== undefined) setModelVersion(s.modelVersion);
      if (s.solverBackend) setSolverBackend(s.solverBackend);
      if (s.pipelineMode) setPipelineMode(s.pipelineMode);
      if (s.selectedCheckpoints) setSelectedCheckpoints(s.selectedCheckpoints);
      if (s.preRunEndTime !== undefined) setPreRunEndTime(s.preRunEndTime);
      if (s.timeoutMinutes !== undefined) setTimeoutMinutes(s.timeoutMinutes);
    } catch { /* ignore corrupted localStorage */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch daily usage on mount and after each submission
  const fetchDailyUsage = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/user/daily-usage`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (res.ok) setDailyUsage(await res.json());
    } catch { /* ignore network errors */ }
  };
  useEffect(() => {
    fetchDailyUsage();
  }, [simulations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Queue status polling — only active when there are queued tasks
  useEffect(() => {
    const hasQueued = simulations.some((s) => s.status === 'queued');
    if (!hasQueued) { setQueueInfo(null); return; }

    const fetchQueue = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/queue-status`);
        if (res.ok) setQueueInfo(await res.json());
      } catch { /* ignore network errors */ }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [simulations, API_URL]);

  // Tick `now` every 60s so elapsed time updates for queued tasks
  useEffect(() => {
    const hasQueued = simulations.some((s) => s.status === 'queued');
    if (!hasQueued) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [simulations]);

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

  // Soft delete: update Supabase directly (no API server dependency)
  const handleDelete = async (sim) => {
    const jobId = sim.id;
    // Optimistically remove from UI
    setSimulations((prev) => prev.filter((s) => s.id !== jobId));

    // Update deleted_at directly via Supabase client
    try {
      const { error } = await supabase
        .from('simulations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', jobId)
        .eq('user_id', session.user.id);
      if (error) throw error;
    } catch (err) {
      // Failed → restore card immediately
      setSimulations((prev) => [sim, ...prev].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ));
      toast.error(err.message);
      return;
    }

    // Success → show toast with undo button
    toast((toastObj) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {t.taskDeletedToast}
        <button
          onClick={() => {
            handleRestore(sim);
            toast.dismiss(toastObj.id);
          }}
          style={{
            background: 'var(--accent)',
            color: '#ffffff',
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

  // Restore a soft-deleted simulation via Supabase directly
  const handleRestore = async (sim) => {
    try {
      const { error } = await supabase
        .from('simulations')
        .update({ deleted_at: null })
        .eq('id', sim.id)
        .eq('user_id', session.user.id);
      if (error) throw error;
      // Success → add card back to UI
      setSimulations((prev) => [sim, ...prev].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ));
      toast.success(t.taskRestoredToast);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (sim) => {
    const jobId = sim.id;
    setCancellingJobs((prev) => new Set(prev).add(jobId));
    try {
      const response = await fetch(`${API_URL}/api/v1/simulations/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Cancel failed');
      }
      toast.success(t.taskCancelledToast);
    } catch (err) {
      toast.error(`${t.cancelFailedToast}: ${err.message}`);
    } finally {
      setCancellingJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  // Checkpoint confirm
  const handleCheckpointConfirm = async (sim) => {
    const jobId = sim.id;
    setCheckpointActionJobs((prev) => new Set(prev).add(jobId));
    try {
      const response = await fetch(`${API_URL}/api/v1/simulations/${jobId}/stage/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Confirm failed');
      }
      toast.success(t.checkpointConfirmedToast);
    } catch (err) {
      toast.error(`${t.checkpointActionFailedToast}: ${err.message}`);
    } finally {
      setCheckpointActionJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  // Checkpoint reject
  const handleCheckpointReject = async (sim) => {
    const jobId = sim.id;
    setCheckpointActionJobs((prev) => new Set(prev).add(jobId));
    try {
      const response = await fetch(`${API_URL}/api/v1/simulations/${jobId}/stage/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Reject failed');
      }
      toast.success(t.checkpointRejectedToast);
    } catch (err) {
      toast.error(`${t.checkpointActionFailedToast}: ${err.message}`);
    } finally {
      setCheckpointActionJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
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
        .select('id, created_at, prompt, status, result_data, deleted_at, user_rating, user_comment, stage_ratings, pipeline_mode, pipeline_stage, pipeline_state')
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
              prev.map((sim) => sim.id === payload.new.id ? { ...sim, ...payload.new } : sim)
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

    // Pre-check daily quota for platform-provided models (default + codex)
    if (modelChoice !== 'byok' && dailyUsage && dailyUsage.remaining <= 0) {
      toast.error(t.dailyUsageExhausted);
      return;
    }

    // Validate credentials for BYOK mode
    if (modelChoice === 'byok') {
      if (!apiKey.trim()) {
        toast.error(t.apiKeyRequired);
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
      // DeepSeek and Qwen keys have no universal prefix — just check non-empty (already done above)
    }

    const effectiveVersion = (modelVersion && modelVersion !== '__custom__') ? modelVersion : '';

    setLoading(true);
    try {
      // Upload mesh file to Supabase Storage first (if provided)
      let meshFileInfo = null;
      if (meshFile) {
        toast.loading(t.meshUploadUploading, { id: 'mesh-upload' });
        const meshStoragePath = `mesh_uploads/${session.user.id}/${Date.now()}_${meshFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('simulation_results')
          .upload(meshStoragePath, meshFile, { contentType: 'application/octet-stream', upsert: false });
        toast.dismiss('mesh-upload');
        if (uploadError) throw new Error(t.meshUploadFailed + ': ' + uploadError.message);
        toast.success(`${meshFile.name} (${(meshFile.size / 1024 / 1024).toFixed(1)} MB)`, { icon: '✓' });
        meshFileInfo = {
          storage_path: meshStoragePath,
          original_name: meshFile.name,
          size_bytes: meshFile.size,
        };
      }

      const requestBody = { prompt: newPrompt };
      if (solverBackend !== 'openfoam-v10') {
        requestBody.solver_backend = solverBackend;
      }
      // Build llm_config based on model choice
      if (modelChoice === 'default' && (codexToken || codexModel)) {
        // User selected non-default Codex model or provided own token
        const llmConfig = { model_provider: 'openai-codex' };
        if (codexModel) llmConfig.model_version = codexModel;
        if (codexToken) llmConfig.codex_token = codexToken;
        requestBody.llm_config = llmConfig;
      } else if (modelChoice === 'claude') {
        // Platform Claude subscription via claude-bridge (bridge-equipped workers only)
        requestBody.llm_config = {
          model_provider: 'claude-bridge',
          model_version: claudeModel || 'opus',
        };
      } else if (modelChoice === 'byok') {
        // BYOK: send user's provider + model + API key
        const llmConfig = {};
        if (modelProvider) llmConfig.model_provider = modelProvider;
        if (effectiveVersion) llmConfig.model_version = effectiveVersion;
        if (apiKey) llmConfig.api_key = apiKey;
        // OpenAI-compatible providers (DeepSeek, Qwen): include base_url for worker
        const baseUrl = OPENAI_COMPATIBLE_PROVIDERS[modelProvider];
        if (baseUrl) llmConfig.base_url = baseUrl;
        requestBody.llm_config = llmConfig;
      }
      // modelChoice === 'default': send NO llm_config → worker uses openai-codex/gpt-5.5
      // Pre-run end time
      if (showPreRunSettings && preRunEndTime !== '') {
        requestBody.pre_run_end_time = parseInt(preRunEndTime, 10);
      }
      // Pipeline mode
      if (showPreRunSettings && pipelineMode === 'controlled') {
        requestBody.pipeline_mode = 'controlled';
        if (selectedCheckpoints.length > 0) {
          requestBody.checkpoints = selectedCheckpoints;
        }
      }
      // Custom mesh file
      if (meshFileInfo) {
        requestBody.mesh_file = meshFileInfo;
      }
      // Custom timeout
      if (timeoutMinutes) {
        requestBody.timeout_minutes = parseInt(timeoutMinutes, 10);
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
      setMeshFile(null);
      fetchDailyUsage();  // refresh remaining count
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter simulations by status
  const filteredSimulations = simulations.filter((sim) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return sim.status === 'queued' || sim.status === 'running' || sim.status === 'checkpoint';
    if (statusFilter === 'checkpoint') return sim.status === 'checkpoint';
    return sim.status === statusFilter;
  });

  // Count by status for filter tab badges
  const counts = {
    all: simulations.length,
    active: simulations.filter((s) => s.status === 'queued' || s.status === 'running' || s.status === 'checkpoint').length,
    completed: simulations.filter((s) => s.status === 'completed').length,
    failed: simulations.filter((s) => s.status === 'failed').length,
    checkpoint: simulations.filter((s) => s.status === 'checkpoint').length,
  };

  const filterTabs = [
    { key: 'all', label: t.filterAll },
    { key: 'active', label: t.filterActive },
    { key: 'completed', label: t.filterCompleted },
    { key: 'cancelled', label: t.filterCancelled },
    { key: 'failed', label: t.filterFailed },
  ];

  return (
    <>
      {/* Two-column layout */}
      <div className="dashboard-layout">
        {/* Left panel: task submission form */}
        <div className="dashboard-left">
          <h3>{t.newSimulationTitle}</h3>
          <form onSubmit={handleSubmit}>

          {/* Solver selector */}
          <div style={{ margin: '12px 0' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              {t.builtInSolver}
            </label>
            <select
              value={solverBackend}
              onChange={(e) => setSolverBackend(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              <option value="openfoam-v10">{t.solverOpenFOAM}</option>
              <option value="amrex">{t.solverAMReX}</option>
            </select>
            {solverBackend === 'amrex' && (
              <small style={{ display: 'block', marginTop: '4px', color: 'var(--purple)', fontSize: '0.78rem' }}>
                {t.solverAMReXNote}
              </small>
            )}
          </div>

          {/* Model selection */}
          <div style={{ margin: '12px 0' }}>
            <button
              type="button"
              onClick={() => setShowModelSettings(!showModelSettings)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.9rem',
              }}
            >
              {showModelSettings ? '▼' : '▶'} {t.modelSettings}
            </button>

            {showModelSettings && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Option 1: Codex (platform default) */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px',
                  border: `1.5px solid ${modelChoice === 'default' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px', cursor: 'pointer',
                  background: modelChoice === 'default' ? 'var(--bg-tertiary)' : 'transparent',
                }}>
                  <input type="radio" name="modelChoice" value="default" checked={modelChoice === 'default'}
                    onChange={() => { setModelChoice('default'); setApiKey(''); }}
                    style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.modelChoiceDefault}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {dailyUsage?.exempt
                        ? (language === 'zh' ? '平台提供 · 管理员无限额' : 'Platform-provided · Admin unlimited')
                        : t.modelChoiceDefaultDesc.replace('{limit}', dailyUsage ? String(dailyUsage.limit) : '5')}
                    </div>
                  </div>
                </label>

                {/* Codex: model selector + optional own token */}
                {modelChoice === 'default' && (
                  <div style={{ marginLeft: '28px', marginBottom: '2px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Codex model selector */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                        {language === 'zh' ? '模型版本' : 'Model Version'}
                      </label>
                      <select value={codexModel} onChange={(e) => setCodexModel(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                        <option value="">gpt-5.5 ({language === 'zh' ? '默认，推荐' : 'default, recommended'})</option>
                        <option value="gpt-5.4">gpt-5.4</option>
                        <option value="gpt-5.4-mini">gpt-5.4-mini ({language === 'zh' ? '快速' : 'fast'})</option>
                        <option value="gpt-5.3-codex">gpt-5.3-codex ({language === 'zh' ? '旧版' : 'legacy'})</option>
                        <option value="gpt-5.2">gpt-5.2</option>
                      </select>
                    </div>
                    {/* Optional Codex token */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                        {t.codexTokenLabel}
                      </label>
                      <input type="password" className="inputField" value={codexToken}
                        onChange={(e) => setCodexToken(e.target.value)}
                        placeholder={t.codexTokenPlaceholder}
                        name="codex-oauth-token" autoComplete="one-time-code" data-1p-ignore data-lpignore="true"
                        style={{ marginBottom: '4px' }} />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.codexTokenHint}</small>
                    </div>
                  </div>
                )}

                {/* Option 2: Claude via platform subscription (claude-bridge) */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px',
                  border: `1.5px solid ${modelChoice === 'claude' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px', cursor: 'pointer',
                  background: modelChoice === 'claude' ? 'var(--bg-tertiary)' : 'transparent',
                }}>
                  <input type="radio" name="modelChoice" value="claude" checked={modelChoice === 'claude'}
                    onChange={() => { setModelChoice('claude'); setApiKey(''); setCodexToken(''); }}
                    style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.modelChoiceClaude}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.modelChoiceClaudeDesc}</div>
                  </div>
                </label>

                {/* Claude: model selector */}
                {modelChoice === 'claude' && (
                  <div style={{ marginLeft: '28px', marginBottom: '2px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {language === 'zh' ? '模型版本' : 'Model Version'}
                    </label>
                    <select value={claudeModel} onChange={(e) => setClaudeModel(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                      {/* haiku removed 2026-08-01: fails even the simplest cavity case
                          (stuck in reviewer rewrite loop until timeout, task #628) */}
                      <option value="">Opus ({language === 'zh' ? '默认，最强' : 'default, most capable'})</option>
                      <option value="sonnet">Sonnet ({language === 'zh' ? '均衡' : 'balanced'})</option>
                    </select>
                  </div>
                )}

                {/* Option 3: BYOK */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px',
                  border: `1.5px solid ${modelChoice === 'byok' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px', cursor: 'pointer',
                  background: modelChoice === 'byok' ? 'var(--bg-tertiary)' : 'transparent',
                }}>
                  <input type="radio" name="modelChoice" value="byok" checked={modelChoice === 'byok'}
                    onChange={() => { setModelChoice('byok'); setModelProvider('openai'); setModelVersion(''); setApiKey(''); setCodexToken(''); }}
                    style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.modelChoiceBYOK}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.modelChoiceBYOKDesc}</div>
                  </div>
                </label>

                {/* BYOK expanded: provider + model + key */}
                {modelChoice === 'byok' && (
                  <div style={{
                    marginLeft: '28px', padding: '10px 12px',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                  }}>
                    {/* Provider */}
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                        {t.byokProviderLabel}
                      </label>
                      <select value={modelProvider}
                        onChange={(e) => {
                          const newProvider = e.target.value;
                          setModelProvider(newProvider);
                          // Auto-fill the provider's default model so users don't carry
                          // over a stale custom-typed model name (2026-05-21 incident:
                          // a user submitted provider=openai with model=qwen-plus from a
                          // previous attempt, which triggered confusing 401 responses).
                          const defaultModel = (MODEL_VERSIONS[newProvider] || []).find(m => m.isDefault);
                          setModelVersion(defaultModel ? defaultModel.value : '');
                          setApiKey('');
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="qwen">Qwen (通义千问)</option>
                      </select>
                    </div>

                    {/* Model version */}
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                        {t.modelVersion}
                      </label>
                      {(() => {
                        const knownModels = MODEL_VERSIONS[modelProvider] || [];
                        const defaultModel = knownModels.find(m => m.isDefault);
                        const isCustom = modelVersion && !knownModels.some(m => m.value === modelVersion) && modelVersion !== '__custom__';
                        const selectStyle = { width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' };
                        return isCustom || modelVersion === '__custom__' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input className="inputField" value={modelVersion === '__custom__' ? '' : modelVersion}
                              onChange={(e) => setModelVersion(e.target.value)}
                              placeholder={language === 'zh' ? '输入模型 ID，如 gpt-5.4' : 'Enter model ID, e.g. gpt-5.4'}
                              name="llm-model-version" autoComplete="one-time-code" data-1p-ignore data-lpignore="true"
                              style={{ flex: 1 }} />
                            <button type="button" onClick={() => setModelVersion('')}
                              style={{ padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              ← {language === 'zh' ? '列表' : 'List'}
                            </button>
                          </div>
                        ) : (
                          <select value={modelVersion} onChange={(e) => setModelVersion(e.target.value)} style={selectStyle}>
                            <option value="">{defaultModel ? `${defaultModel.value} (${language === 'zh' ? '默认' : 'default'})` : ''}</option>
                            {knownModels.filter(m => !m.isDefault).map(m => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                            <option value="__custom__">{language === 'zh' ? '— 自定义模型 —' : '— Custom model —'}</option>
                          </select>
                        );
                      })()}
                    </div>

                    {/* API Key (required for BYOK) */}
                    <div style={{ marginBottom: '4px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                        {t.apiKey}
                      </label>
                      <input type="password" className="inputField" value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={
                          modelProvider === 'openai' ? 'sk-...' :
                          modelProvider === 'anthropic' ? 'sk-ant-...' :
                          modelProvider === 'deepseek' ? 'sk-...' :
                          'sk-...'
                        }
                        name="llm-api-key" autoComplete="one-time-code" data-1p-ignore data-lpignore="true"
                        style={{ marginBottom: '4px' }} />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.apiKeyHint}</small>
                    </div>
                    {modelProvider === 'deepseek' && (
                      <div style={{
                        marginTop: '8px', padding: '8px 10px',
                        borderRadius: '4px',
                        background: 'var(--bg-warning, #fff3cd)',
                        color: 'var(--text-warning, #856404)',
                        fontSize: '0.78rem', lineHeight: '1.4',
                        border: '1px solid var(--border-warning, #ffeaa7)',
                      }}>
                        {language === 'zh'
                          ? '⚠️ DeepSeek V4 模型默认开启 thinking mode，与本平台所需的结构化输出 (tool_choice) 不兼容。提交会在 planner 阶段立即失败。建议改用 OpenAI 或 Anthropic。'
                          : '⚠️ DeepSeek V4 models default to thinking mode, which is incompatible with the structured output (tool_choice) this platform requires. Submissions will fail immediately at the planner stage. Please use OpenAI or Anthropic instead.'}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <button type="button" onClick={saveModelSettings}
                    style={{
                      padding: '4px 14px', fontSize: '0.78rem',
                      background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}>
                    {t.saveModelSettings}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pre-run settings collapsible */}
          <div style={{ margin: '12px 0' }}>
            <button
              type="button"
              onClick={() => setShowPreRunSettings(!showPreRunSettings)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.9rem',
              }}
            >
              {showPreRunSettings ? '▼' : '▶'} {t.preRunSettings} {t.preRunHint}
            </button>

            {showPreRunSettings && (
              <div style={{
                marginTop: '10px',
                padding: '14px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
              }}>
                {/* Pipeline mode selector */}
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {t.pipelineMode}
                </label>
                <select
                  value={pipelineMode}
                  onChange={(e) => setPipelineMode(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '12px' }}
                >
                  <option value="auto">{t.pipelineModeAuto}</option>
                  <option value="controlled">{t.pipelineModeControlled}</option>
                </select>

                {/* Checkpoint selectors (only for controlled mode) */}
                {pipelineMode === 'controlled' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {t.pipelineCheckpoints}
                    </label>
                    {[
                      { value: 'files_review', label: t.pipelineCheckpointFiles },
                      { value: 'pre_run_review', label: t.pipelineCheckpointPreRun },
                    ].map(({ value, label }) => (
                      <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedCheckpoints.includes(value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCheckpoints((prev) => [...prev, value]);
                            } else {
                              setSelectedCheckpoints((prev) => prev.filter((c) => c !== value));
                            }
                          }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                {/* Pre-run steps (only for controlled mode — auto mode doesn't use pre-run) */}
                {pipelineMode === 'controlled' && (
                  <>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {t.preRunSteps}
                    </label>
                    <select
                      value={preRunEndTime}
                      onChange={(e) => setPreRunEndTime(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    >
                      <option value="1">{t.preRunSingleStep}</option>
                      <option value="10">{t.preRun10Steps}</option>
                      <option value="100">{t.preRun100Steps}</option>
                    </select>
                  </>
                )}

                {/* Timeout selector */}
                <label style={{ fontSize: '0.82rem', fontWeight: 500, marginTop: '8px' }}>{t.timeoutLabel}</label>
                <select
                  value={timeoutMinutes}
                  onChange={(e) => setTimeoutMinutes(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="">{t.timeoutDefault}</option>
                  <option value="20">20 min</option>
                  <option value="40">40 min</option>
                  <option value="60">60 min</option>
                  <option value="120">120 min</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.5 }}>
                  {t.resourceHint}
                </p>

                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <button type="button" onClick={saveExecutionSettings}
                    style={{
                      padding: '4px 14px', fontSize: '0.78rem',
                      background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}>
                    {t.saveExecutionSettings}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mesh file upload — styled like model settings toggle */}
          <div style={{ margin: '8px 0' }}>
            <button
              type="button"
              onClick={() => !meshFile && document.getElementById('mesh-file-input')?.click()}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.9rem',
              }}
            >
              {meshFile ? '▼' : '▶'} {t.meshUploadLabel}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                {t.meshUploadHint}
              </span>
            </button>
            <input
              id="mesh-file-input"
              type="file"
              accept=".msh"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.name.toLowerCase().endsWith('.msh')) {
                  toast.error(t.meshUploadInvalidType);
                  e.target.value = '';
                  return;
                }
                if (file.size > 100 * 1024 * 1024) {
                  toast.error(t.meshUploadTooLarge);
                  e.target.value = '';
                  return;
                }
                setMeshFile(file);
                e.target.value = '';
              }}
            />
            {meshFile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '6px', fontSize: '0.85rem',
                padding: '6px 10px', background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)',
              }}>
                <span style={{ color: 'var(--success, #22c55e)' }}>&#10003;</span>
                <span>{meshFile.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ({(meshFile.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
                <button type="button" onClick={() => setMeshFile(null)}
                  style={{
                    marginLeft: 'auto', fontSize: '0.78rem',
                    padding: '2px 10px', cursor: 'pointer',
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
                  }}
                >{t.meshUploadRemove}</button>
              </div>
            )}
          </div>

          <textarea
            className="inputField prompt-textarea"
            placeholder={t.promptPlaceholder}
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            rows="8"
          />

          {/* Prompt examples */}
          <div className="prompt-examples">
            <small className="prompt-examples-title">
              {t.examplesTitle}
              <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>
                {t.examplesHint}{' '}
                <a href="https://huggingface.co/datasets/LeoYML/FoamGPT"
                   target="_blank" rel="noopener noreferrer"
                   style={{ color: 'var(--accent)' }}>
                  {t.examplesLinkText}
                </a>
              </span>
            </small>
            <div className="prompt-examples-list">
              {promptExamples.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  className="prompt-example-chip"
                  title={ex.description[language]}
                  onClick={() => setNewPrompt(ex.prompt)}
                >
                  <span className="chip-tag">{ex.tag[language]}</span>
                  <span className="chip-label">{ex.label[language]}</span>
                  <span className="chip-solver">{ex.solver}</span>
                </button>
              ))}
            </div>
          </div>

          {dailyUsage && modelChoice !== 'byok' && !dailyUsage.exempt && (
            <div style={{
              fontSize: '0.78rem', textAlign: 'center', marginBottom: '6px',
              color: dailyUsage.remaining <= 0 ? 'var(--danger)' : dailyUsage.remaining <= 2 ? 'var(--warning)' : 'var(--text-secondary)',
            }}>
              {t.dailyUsage.replace('{used}', String(dailyUsage.used)).replace('{limit}', String(dailyUsage.limit))}
            </div>
          )}
          <button className="button-block" type="submit" disabled={loading || !newPrompt.trim() || (modelChoice !== 'byok' && dailyUsage && dailyUsage.remaining <= 0)}>
            {loading ? t.submittingButton : t.submitButton}
          </button>
          </form>
        </div>

        {/* Right panel: history */}
        <div className="dashboard-right">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
                      <h4>{t.case} #{String(sim.id).substring(0, 8)}</h4>
                      <span className={`status-badge status-${sim.status}`}>
                        {sim.status}
                      </span>
                      {sim.status === 'queued' && (() => {
                        const elapsed = Math.floor((now - new Date(sim.created_at).getTime()) / 60000);
                        const pos = queueInfo?.queued_ids?.indexOf(String(sim.id));
                        const posNum = pos !== undefined && pos >= 0 ? pos + 1 : null;
                        return (
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}>
                            {posNum ? t.queuePosition.replace('{n}', posNum) : ''}
                            {posNum ? ' · ' : ''}
                            {elapsed >= 1
                              ? t.queueElapsed.replace('{min}', elapsed)
                              : t.queueElapsedShort}
                          </span>
                        );
                      })()}
                      {sim.pipeline_mode === 'controlled' && sim.pipeline_stage && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-tertiary)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}>
                          {t.pipelineStages[sim.pipeline_stage] || sim.pipeline_stage}
                        </span>
                      )}
                      {storageUsage?.per_task?.[String(sim.id)] && (
                        <span className="case-storage-badge">
                          {formatFileSize(storageUsage.per_task[String(sim.id)])}
                        </span>
                      )}
                    </div>
                    {(sim.status === 'queued' || sim.status === 'running') && (
                      <button
                        className="cancel-button"
                        onClick={() => handleCancel(sim)}
                        disabled={cancellingJobs.has(sim.id)}
                      >
                        {cancellingJobs.has(sim.id) ? t.cancellingButton : t.cancelButton}
                      </button>
                    )}
                    {sim.status !== 'running' && sim.status !== 'queued' && sim.status !== 'checkpoint' && (
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
                      <small>
                        {t.time}: {new Date(sim.created_at).toLocaleString()}
                        {(() => {
                          const days = getDaysUntilExpiry(sim);
                          if (days === null) return null;
                          return (
                            <span className={`expiry-badge${days <= 3 ? ' expiry-urgent' : ''}`}>
                              {days <= 0
                                ? t.expiresToday
                                : t.expiresInDays.replace('{days}', days)}
                            </span>
                          );
                        })()}
                      </small>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {(sim.status === 'completed' || sim.status === 'failed' || sim.status === 'cancelled') && sim.result_data?.file_tree && (
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
                        {sim.result_data?.zip_storage_path && (
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

                    {/* Error reason — shown for failed/cancelled tasks */}
                    {(sim.status === 'failed' || sim.status === 'cancelled') && sim.result_data?.error && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(220, 53, 69, 0.3)',
                        background: 'rgba(220, 53, 69, 0.06)',
                        color: 'var(--danger, #dc3545)',
                      }}>
                        <strong>{t.errorReason}:</strong>{' '}
                        {/* Show localized message for known error categories */}
                        {sim.result_data.error_category === 'codex_quota_exceeded' ? t.errorCodexQuota
                          : sim.result_data.error_category === 'rate_limit' ? t.errorRateLimit
                          : sim.result_data.error_category === 'auth_error' ? t.errorAuth
                          : sim.result_data.error_category === 'timeout' ? t.errorTimeout
                          : sim.result_data.error_category === 'oom' ? t.errorOOM
                          : sim.result_data.error_category === 'disk_exceeded' ? t.errorDiskExceeded
                          : sim.result_data.error_category === 'config_error' ? t.errorConfigError
                          : sim.result_data.error}
                        {/* 失败后案例体检提示(worker case_lint):死因附近的可行动线索 */}
                        {Array.isArray(sim.result_data.lint_hints) && sim.result_data.lint_hints.length > 0 && (
                          <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {sim.result_data.lint_hints.map((h, i) => <li key={i} style={{ marginBottom: 4 }}>{h}</li>)}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Checkpoint panel — controlled pipeline mode */}
                    {sim.status === 'checkpoint' && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        border: '1px solid rgba(210, 153, 34, 0.4)',
                        borderRadius: '6px',
                        background: 'var(--warning-subtle)',
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--warning)' }}>
                          {t.pipelineStages[sim.pipeline_stage] || sim.pipeline_stage}
                        </div>
                        {sim.result_data?.checkpoint_data && (
                          <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                            <div>
                              <strong>{t.checkpointOriginalEndTime}:</strong>{' '}
                              {sim.result_data.checkpoint_data.original_end_time}
                            </div>
                            <div>
                              <strong>{t.checkpointPreRunEndTime}:</strong>{' '}
                              {sim.result_data.checkpoint_data.pre_run_end_time}
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {sim.result_data?.file_tree && (
                            <button
                              className="checkpoint-btn checkpoint-btn--browse"
                              onClick={() => {
                                setSelectedSimulation(sim);
                                setShowFileBrowser(true);
                              }}
                            >
                              {sim.pipeline_stage === 'files_review' ? t.browseFilesReviewButton
                                : sim.pipeline_stage === 'pre_run_review' ? t.browsePreRunButton
                                : t.browseFilesButton}
                            </button>
                          )}
                          <button
                            className="checkpoint-btn checkpoint-btn--confirm"
                            onClick={() => handleCheckpointConfirm(sim)}
                            disabled={checkpointActionJobs.has(sim.id)}
                          >
                            {checkpointActionJobs.has(sim.id) ? t.checkpointConfirmingButton : t.checkpointConfirmButton}
                          </button>
                          <button
                            className="checkpoint-btn checkpoint-btn--reject"
                            onClick={() => handleCheckpointReject(sim)}
                            disabled={checkpointActionJobs.has(sim.id)}
                          >
                            {t.checkpointRejectButton}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      </div>

      {/* File browser modal (works for completed and checkpoint status) */}
      {showFileBrowser && selectedSimulation && selectedSimulation.result_data?.file_tree && (
        <FileBrowser
          jobId={selectedSimulation.id}
          accessToken={session.access_token}
          fileTree={selectedSimulation.result_data.file_tree}
          storageBasePath={selectedSimulation.result_data.storage_base_path}
          language={language}
          apiUrl={API_URL}
          userRating={selectedSimulation.user_rating}
          userComment={selectedSimulation.user_comment}
          stageRatings={selectedSimulation.stage_ratings}
          pipelineStage={selectedSimulation.pipeline_stage || (selectedSimulation.status === 'completed' ? 'completed' : null)}
          pipelineMode={selectedSimulation.pipeline_mode}
          onClose={() => {
            setShowFileBrowser(false);
            setSelectedSimulation(null);
          }}
        />
      )}
    </>
  );
}
