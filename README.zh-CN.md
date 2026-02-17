# CFDQandA Client

[English](README.md)

> **许可证：** [PolyForm Strict 1.0.0](https://polyformproject.org/licenses/strict/1.0.0/) — 源码仅供个人及非商业用途查阅和使用，禁止商业使用。

计算流体力学问答客户端（CFDQandA Client）是一个基于 React + Vite 构建的前端应用，用于管理和提交计算流体力学仿真任务。

## 项目简介

本项目是一个单页应用（SPA），提供用户认证、任务管理、历史记录查看等功能。用户可以通过邮箱注册/登录，提交仿真需求，查看任务状态，并下载仿真结果。

## 技术栈

- **React 19** - 用户界面框架
- **Vite 7** - 构建工具和开发服务器
- **Supabase** - 后端即服务（BaaS），提供：
  - 用户认证（邮箱/密码）
  - 数据库（PostgreSQL）
  - 实时数据订阅
  - 文件存储
- **react-hot-toast** - 通知提示组件
- **ESLint** - 代码质量检查工具

## 主要功能

### 1. 用户认证
- 邮箱注册/登录
- 会话管理
- 自动状态检测

### 2. 任务管理
- 创建新的仿真任务（提交需求描述）
- 查看任务历史记录
- 实时任务状态更新（通过 Supabase 实时订阅）
- 隐藏/恢复任务功能
- 任务状态显示（排队中、处理中、完成、失败）

### 3. 结果下载
- 任务完成后可下载结果文件（.zip 格式）
- 结果存储在 Supabase Storage

### 4. 多语言支持
- 支持中文（简体）和英文
- 界面语言实时切换
- 所有文本内容均已本地化

## 项目结构

```
cfdqanda-client/
├── src/
│   ├── App.jsx              # 主应用组件（路由和状态管理）
│   ├── Auth.jsx             # 认证组件（登录/注册）
│   ├── Dashboard.jsx        # 仪表板组件（任务管理界面）
│   ├── supabaseClient.js    # Supabase 客户端配置
│   ├── main.jsx             # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── dist/                    # 构建输出目录
├── vite.config.js           # Vite 配置
├── eslint.config.js         # ESLint 配置
├── package.json             # 项目依赖和脚本
└── README.md                # 项目文档
```

## 环境配置

在项目根目录创建 `.env` 文件（如有 `.env.example` 可作参考），需配置以下环境变量：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_SERVER_URL=your_api_server_url
```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（或使用 `--host` 参数可访问局域网地址）。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 核心功能说明

### 认证流程
1. 用户访问应用，如果未登录，显示登录/注册界面
2. 用户可以注册新账户或使用已有账户登录
3. 登录成功后，自动跳转到仪表板界面

### 任务提交流程
1. 用户在仪表板输入仿真需求描述
2. 提交后，任务通过 API 发送到后端服务器
3. 任务状态实时更新（通过 Supabase 实时订阅）
4. 完成后，用户可下载结果文件

### 数据持久化
- 任务数据存储在 Supabase 的 `simulations` 表中
- 隐藏的任务 ID 存储在浏览器的 localStorage 中
- 每个用户的任务数据通过 `user_id` 进行隔离

## 开发说明

### 组件说明
- **App.jsx**: 管理全局状态（认证会话、语言设置），根据认证状态渲染不同组件
- **Auth.jsx**: 处理用户登录和注册，支持中英文界面
- **Dashboard.jsx**: 主功能界面，包含任务提交、历史记录查看、任务管理等功能

### 样式说明
项目使用内联样式和 CSS 类相结合的方式。主要样式定义在 `index.css` 中，包括：
- 容器和布局样式
- 表单输入框样式
- 按钮样式
- 任务卡片样式

## 许可证

请查看 `LICENSE` 文件了解详情。
