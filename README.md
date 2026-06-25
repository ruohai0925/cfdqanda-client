# cfdqanda-client

> **License:** [PolyForm Strict 1.0.0](https://polyformproject.org/licenses/strict/1.0.0/) — source available for personal and non-commercial use only.

React frontend for [Foam-Agent](https://foam-agent.com) — a natural-language-driven CFD simulation platform.

## Tech Stack

- React 19 + Vite 7
- Supabase JS Client (auth, realtime, storage)
- react-hot-toast for notifications
- No CSS framework — custom dark theme

## Project Structure

```
src/
├── App.jsx              # Root — auth session management, language state, privacy policy
├── Auth.jsx             # Email/password login & signup with Cloudflare Turnstile CAPTCHA
├── MainLayout.jsx       # Shared header — user profile, storage usage, language toggle, account management
├── AISimulationTab.jsx  # AI simulation — task submission, history, checkpoints, file browsing
├── ExpertOrderTab.jsx   # Expert order system — consultation request form
├── PrivacyPolicy.jsx    # Bilingual privacy policy (GDPR-compliant)
├── supabaseClient.js    # Supabase client initialization
├── main.jsx             # App entry point
├── index.css            # Global styles — dark engineer theme
├── components/
│   └── FileBrowser.jsx  # Draggable modal — file tree, preview, download, feedback, ratings
├── utils/
│   └── fileUtils.js     # formatFileSize() helper
└── data/
    └── promptExamples.js # Example CFD prompts for onboarding
```

## Features

- **Task Submission**: Natural language CFD simulation requests with example prompts and solver selection (OpenFOAM v10, AMReX coming soon)
- **BYOK**: Bring Your Own Key — choose LLM provider (OpenAI, Anthropic, Codex) and provide API key
- **Two Execution Modes**: Auto mode (one-shot) and Controlled mode (stage-by-stage with checkpoints)
- **Real-time Status**: Live updates via Supabase Realtime (queued → running → checkpoint → completed/failed/cancelled)
- **File Browser**: Browse simulation output files, preview text content, download individual files or full ZIP archive
- **Checkpoint Review**: Controlled pipeline mode with review panels at each stage (plan, files, pre-run)
- **Stage Feedback & Ratings**: Per-stage comments and ratings (1-3) at each checkpoint
- **Per-file Feedback**: Rate individual output files with comments
- **Task Rating**: Overall task rating (success/partial/failed) with comments
- **Task Cancellation**: Cancel queued, running, or checkpoint tasks
- **Data Lifecycle**: Expiry badges showing days until auto-deletion, per-task and total cloud storage usage display
- **User Accounts**: Email/password registration with Cloudflare Turnstile CAPTCHA, password recovery, auto-created user profiles
- **Account Deletion**: Self-service account deletion with email confirmation (GDPR compliance, UI temporarily hidden)
- **Expert Orders**: Consultation request tab with meeting scheduler
- **Privacy Policy**: Bilingual (zh/en) privacy policy with GDPR rights
- **Dark Theme**: Custom dark engineer theme with dot-grid background
- **Bilingual UI**: Chinese/English toggle affecting all text

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

Static SPA deployed to Vercel from the `development` branch. Auto-deploys on push.
