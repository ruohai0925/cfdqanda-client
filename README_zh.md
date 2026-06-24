# cfdqanda-client

> **许可证：** [PolyForm Strict 1.0.0](https://polyformproject.org/licenses/strict/1.0.0/) — 源码仅供个人及非商业用途查阅和使用，禁止商业使用。

[CFDQandA](https://foam-agent.com) 的 React 前端 —— 基于自然语言的 CFD 仿真自动化平台。

## 技术栈

- React 19 + Vite 7
- Supabase JS Client（认证、实时推送、文件存储）
- react-hot-toast 通知提示
- 无 CSS 框架 — 自定义暗色主题

## 项目结构

```
src/
├── App.jsx              # 根组件 — 认证会话管理、语言切换、隐私政策路由
├── Auth.jsx             # 邮箱/密码登录注册（集成 Cloudflare Turnstile 人机验证）
├── MainLayout.jsx       # 共享头部 — 用户 Profile、存储用量、语言切换、账户管理
├── AISimulationTab.jsx  # AI 仿真标签页 — 任务提交、历史记录、检查点、文件浏览
├── ExpertOrderTab.jsx   # 专家接单系统 — 咨询需求表单
├── PrivacyPolicy.jsx    # 中英双语隐私政策（GDPR 合规）
├── supabaseClient.js    # Supabase 客户端初始化
├── main.jsx             # 应用入口
├── index.css            # 全局样式 — 暗色工程师主题
├── components/
│   └── FileBrowser.jsx  # 可拖拽弹窗 — 文件树、预览、下载、反馈、评价
├── utils/
│   └── fileUtils.js     # formatFileSize() 工具函数
└── data/
    └── promptExamples.js # 示例 CFD prompt（引导用户）
```

## 功能特性

- **任务提交**：自然语言描述 CFD 仿真需求，附带示例 prompt，支持求解器选择（OpenFOAM v10，AMReX 即将上线）
- **BYOK 自带密钥**：选择 LLM 提供商（OpenAI、Anthropic、Codex）并提供 API key
- **两种执行模式**：自动模式（一次性执行）和受控模式（分阶段执行，带检查点）
- **实时状态更新**：通过 Supabase Realtime 实时推送（queued → running → checkpoint → completed/failed/cancelled）
- **文件浏览器**：浏览仿真输出文件、预览文本内容、下载单个文件或完整 ZIP 包
- **检查点审查**：受控流水线模式，每个阶段（方案、文件、预运行）可暂停审查
- **阶段反馈与评价**：每个检查点可留下评论和评分（1-3 分）
- **文件级反馈**：对单个输出文件提交评论
- **任务评价**：整体评价（成功/部分成功/失败）+ 一句话评论
- **任务取消**：取消排队中/运行中/检查点中的任务
- **数据生命周期**：显示距自动删除的天数、每个任务和总体的云端存储用量
- **用户账户**：邮箱/密码注册（集成 Cloudflare Turnstile 人机验证）、密码找回、自动创建用户 Profile
- **账户删除**：自助删除账户（需输入邮箱确认，GDPR 合规，UI 暂时隐藏）
- **专家接单系统**：咨询需求表单 + 会议预约
- **隐私政策**：中英双语隐私政策，符合 GDPR 要求
- **暗色主题**：自定义暗色工程师主题，点阵网格背景
- **中英双语**：UI 一键切换中文/英文

## 环境变量

创建 `.env.local`：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_SERVER_URL=http://localhost:8000
```

## 开发

```bash
conda activate cfdqanda-client
npm install
npm run dev      # http://localhost:5173
```

## 构建

```bash
npm run build    # 输出到 dist/
npm run lint     # ESLint 检查
```

## 部署

静态 SPA 部署到 Vercel，从 `development` 分支自动部署。
