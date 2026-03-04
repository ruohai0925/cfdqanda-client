# cfdqanda-client

许可证：PolyForm Strict 1.0.0 — 源码仅供个人及非商业用途，禁止商业使用。

CFDQandA 的 React 前端 — 基于自然语言的 CFD 仿真自动化平台。

## 技术栈

- React 19 + Vite 7
- Supabase JS Client（认证、实时推送、文件存储）
- react-hot-toast 通知提示
- 无 CSS 框架 — 自定义暗色主题

## 项目结构

```
src/
├── App.jsx              # 根组件 — 认证会话管理、语言切换
├── Auth.jsx             # 邮箱/密码登录注册（Supabase Auth）
├── Dashboard.jsx        # 主界面 — 任务提交、仿真历史、检查点
├── supabaseClient.js    # Supabase 客户端初始化
├── index.css            # 全局样式 — 暗色工程师主题
├── components/
│   └── FileBrowser.jsx  # 可拖拽弹窗 — 文件树、预览、反馈、评价
├── utils/
│   └── fileUtils.js     # formatFileSize() 工具函数
└── data/
    └── promptExamples.js # 示例 CFD prompt（引导用户）
```

## 功能特性

- **任务提交**：自然语言描述 CFD 仿真需求，附带示例 prompt
- **BYOK 自带密钥**：选择 LLM 提供商（OpenAI、Anthropic、Codex）并提供 API key
- **实时状态更新**：通过 Supabase Realtime 实时推送（queued → running → completed/failed）
- **文件浏览器**：浏览仿真输出文件、预览文本内容、下载单个文件或 ZIP 包
- **检查点审查**：受控流水线模式，每个阶段（方案、文件、预运行）可暂停审查
- **阶段反馈**：每个检查点可留下可选评论，累积保存不会被覆盖
- **文件级反馈**：对单个输出文件提交评论
- **任务评价**：整体评价（成功/部分成功/失败）+ 一句话评论
- **数据生命周期**：显示距自动删除的天数、每个 case 的云端存储用量
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

静态 SPA 部署到 Vercel。`dist/` 目录包含生产构建。
