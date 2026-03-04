# cfdqanda-client

License: PolyForm Strict 1.0.0 — source available for personal and non-commercial use only.

React frontend for CFDQandA (https://cfdqanda.com) — a natural-language-driven CFD simulation platform.

## Tech Stack

- React 19 + Vite 7
- Supabase JS Client (auth, realtime, storage)
- react-hot-toast for notifications
- No CSS framework — custom dark theme

## Project Structure

```
src/
├── App.jsx              # Root — auth session management, language state
├── Auth.jsx             # Email/password login & signup via Supabase Auth
├── Dashboard.jsx        # Main UI — task submission, simulation history, checkpoints
├── supabaseClient.js    # Supabase client initialization
├── index.css            # Global styles — dark engineer theme
├── components/
│   └── FileBrowser.jsx  # Draggable modal — file tree, preview, feedback, ratings
├── utils/
│   └── fileUtils.js     # formatFileSize() helper
└── data/
    └── promptExamples.js # Example CFD prompts for onboarding
```

## Features

- **Task Submission**: Natural language CFD simulation requests with example prompts
- **BYOK**: Bring Your Own Key — choose LLM provider (OpenAI, Anthropic, Codex) and provide API key
- **Real-time Status**: Live updates via Supabase Realtime (queued → running → completed/failed)
- **File Browser**: Browse simulation output files, preview text content, download individual files or ZIP
- **Checkpoint Review**: Controlled pipeline mode with review panels at each stage (plan, files, pre-run)
- **Stage Feedback**: Optional comments at each checkpoint, accumulated and preserved
- **Per-file Feedback**: Rate individual output files with comments
- **Task Rating**: Overall task rating (success/partial/failed) with comments
- **Data Lifecycle**: Expiry badges showing days until auto-deletion, storage usage per task
- **Dark Theme**: Custom dark engineer theme with dot-grid background
- **Bilingual**: Chinese/English UI toggle

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_SERVER_URL=http://localhost:8000
```

## Development

```bash
conda activate cfdqanda-client
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # Output to dist/
npm run lint     # ESLint check
```

## Deployment

Static SPA deployed to Vercel. The `dist/` directory contains the production build.
