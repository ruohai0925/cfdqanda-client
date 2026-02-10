# CFDQandA Client

[中文](README.zh-CN.md)

A React + Vite front-end for managing and submitting computational fluid dynamics (CFD) simulation tasks.

## Overview

This is a single-page application (SPA) that provides user authentication, task management, and history. Users can sign up or log in with email, submit simulation requirements, watch task status, and download results.

## Tech Stack

- **React 19** – UI framework
- **Vite 7** – Build tool and dev server
- **Supabase** – Backend-as-a-Service:
  - Auth (email/password)
  - PostgreSQL database
  - Realtime subscriptions
  - File storage
- **react-hot-toast** – Toast notifications
- **ESLint** – Linting

## Features

### 1. Authentication
- Email sign up / sign in
- Session handling
- Auth state detection

### 2. Task Management
- Create simulation tasks (submit requirement text)
- View task history
- Realtime status updates (Supabase Realtime)
- Hide / restore tasks
- Status labels: queued, running, completed, failed

### 3. Results
- Download result archive (.zip) when a task completes
- Results stored in Supabase Storage

### 4. i18n
- Chinese (Simplified) and English
- Language toggle with immediate UI update
- All UI strings localized

## Project Structure

```
cfdqanda-client/
├── src/
│   ├── App.jsx              # Root (routing, global state)
│   ├── Auth.jsx             # Login / sign up
│   ├── Dashboard.jsx       # Task list and submission
│   ├── supabaseClient.js    # Supabase client config
│   ├── main.jsx             # Entry
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Build output
├── vite.config.js
├── eslint.config.js
├── package.json
└── README.md
```

## Environment

Create a `.env` file in the project root (see `.env.example` if present). Required variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_SERVER_URL=your_api_server_url
```

## Install & Run

### Install dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

App runs at `http://localhost:5173` (use `--host` for LAN access).

### Production build

```bash
npm run build
```

Output is in `dist/`.

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Behaviour

### Auth flow
1. Unauthenticated users see the login/sign-up screen.
2. Users can register or sign in with email.
3. After sign-in, the app shows the dashboard.

### Task flow
1. User enters a simulation requirement on the dashboard.
2. On submit, the task is sent to the API server.
3. Status updates in real time via Supabase.
4. When complete, the user can download the result archive.

### Data
- Tasks live in the Supabase `simulations` table.
- Hidden task IDs are stored in the browser’s localStorage.
- Data is scoped by `user_id`.

## Development

### Components
- **App.jsx**: Global state (session, language), renders Auth or Dashboard.
- **Auth.jsx**: Login and sign up; bilingual UI.
- **Dashboard.jsx**: Submit tasks, view history, manage and hide tasks.

### Styling
Styles are in `index.css` (layout, form inputs, buttons, task cards); some components use inline styles.

## License

See the `LICENSE` file.
