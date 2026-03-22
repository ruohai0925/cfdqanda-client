# CFDQandA User Guide

> CFDQandA is an LLM-powered CFD simulation automation platform. Simply describe your simulation requirements in natural language, and the platform will automatically handle OpenFOAM meshing, boundary condition setup, solver execution, and post-processing.

---

## Table of Contents

1. [Registration & Login](#1-registration--login)
2. [Interface Overview](#2-interface-overview)
3. [Creating a Simulation Task](#3-creating-a-simulation-task)
4. [Model Selection](#4-model-selection)
5. [Execution Modes](#5-execution-modes)
6. [Task Status Reference](#6-task-status-reference)
7. [Viewing Simulation Results](#7-viewing-simulation-results)
8. [Providing Feedback](#8-providing-feedback)
9. [Downloading Data](#9-downloading-data)
10. [Usage Limits & Quotas](#10-usage-limits--quotas)
11. [FAQ](#11-faq)
12. [Privacy Policy](#12-privacy-policy)

---

## 1. Registration & Login

### 1.1 Creating an Account

Registration requires the following information:

| Field | Required | Description |
|-------|----------|-------------|
| Email | Yes | Used for login and receiving verification emails |
| Password | Yes | Set your own password |
| Display Name | Yes | Your username shown in the system |
| Organization | No | Your university or company |
| Invitation Code | Yes | Format: `CFDQ-XXXX-XXXX-XXXX`, obtained from an administrator |

Registration steps:

1. On the login page, click "Sign Up" to switch to the registration form
2. Fill in your email, password, display name, and organization
3. Enter the invitation code provided by the administrator (automatically converted to uppercase)
4. Check the privacy policy agreement checkbox
5. Click the "Sign Up" button
6. Check your email and click the verification link to complete registration

> **Note**: After registration, a verification email will be sent to the email address you provided. You must click the link in the email to verify your account before you can log in. If you don't receive the email, please check your spam/junk folder or contact the administrator.

> **Note**: Each invitation code can only be used once and is bound to a single email address. If you encounter issues during registration, contact the administrator to reset the invitation code.

### 1.2 Logging In

Log in using the email and password you registered with.

---

## 2. Interface Overview

After logging in, the main interface contains the following areas:

- **Top bar**: Language toggle (Chinese/English), user info, logout button
- **Upper section**: Task creation area (prompt input box, model selection, execution settings)
- **Lower section**: Task history list (sorted by newest first)

---

## 3. Creating a Simulation Task

### 3.1 Writing a Prompt

Describe your simulation requirements in natural language in the input box. A good prompt should include:

- **Fluid type**: Incompressible/compressible, Newtonian/non-Newtonian
- **Geometry**: Dimensions and shape of the computational domain
- **Boundary conditions**: Inlet velocity, outlet pressure, wall conditions, etc.
- **Solver preference**: If you have a specific requirement (icoFoam, simpleFoam, etc.)
- **Turbulence model**: Laminar / k-epsilon / k-omega SST / Spalart-Allmaras, etc.

### 3.2 Uploading a Mesh File (Optional)

If your simulation uses a custom mesh (e.g., complex airfoil, external geometry), you can upload a Gmsh `.msh` file:

- Click "▶ Upload Mesh File (optional)" above the prompt input
- Select a `.msh` file (max 100 MB)
- A green checkmark and file info will appear when selected
- The file is uploaded to cloud storage on submission, and Foam-Agent will use it instead of auto-generated blockMesh

> **Note**: Only Gmsh ASCII 2.2 format (`.msh`) is currently supported. If your geometry can be described using blockMesh or snappyHexMesh built-in searchable geometries (box, cylinder, sphere), no mesh upload is needed.

### 3.3 Example Prompts

The platform provides preset examples — click any to auto-fill. Start with simple cases. More tested prompts are available at the [FoamGPT Dataset](https://huggingface.co/datasets/LeoYML/FoamGPT).

| Example | Type | Solver | Tag |
|---------|------|--------|-----|
| **Lid-Driven Cavity** | Incompressible laminar | icoFoam | Beginner |
| **Porous Blockage** | Incompressible laminar + Darcy | pisoFoam | Porous |
| **Elbow Channel** | Incompressible laminar, 2 inlets | icoFoam | Pipe |
| **Natural Convection** | Heat transfer + buoyancy | buoyantFoam | Heat |
| **Tandem Wing** | Incompressible turbulent (.msh required) | simpleFoam | Custom Mesh |

### 3.4 Submitting

After writing your prompt, click "Submit Task". If a .msh file is attached, the system will upload the mesh first, then submit the task. The task will enter the queue immediately.

---

## 4. Model Selection

Click "Model Selection" to expand the settings panel. The platform offers two modes:

### 4.1 Codex (Default, Platform-Provided)

- **Cost**: Free, covered by the platform
- **Limit**: 10 tasks per user per day (resets at UTC midnight)
- **Available models**: gpt-5.3-codex (default, recommended), gpt-5.2-codex, gpt-5.2
- **Codex Token** (optional): If you have your own ChatGPT Codex Token, enter it to bypass the platform quota
- **Best for**: Most users, no extra configuration needed

### 4.2 Bring Your Own Key (BYOK)

Use your own API key with no platform quota restrictions. The following LLM providers are supported:

| Provider | Available Models | API Key Format |
|----------|-----------------|----------------|
| **OpenAI** | gpt-5.4, gpt-5-mini, gpt-4o, gpt-4o-mini, gpt-4.1, o3, o4-mini, etc. | Starts with `sk-` |
| **Anthropic** | claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5 | Starts with `sk-ant-` |
| **DeepSeek** | deepseek-chat (V3.2), deepseek-reasoner (R1) | Any format |
| **Qwen (Tongyi)** | qwen-plus, qwen-turbo, qwen-max, qwen3.5-plus | Any format |

You can also enter a custom model ID not in the list.

> **Privacy**: Your API key is used only for the current task. The worker **immediately deletes it from the database** after reading it. It is never stored or shared with third parties.

---

## 5. Execution Modes

Click "Execution Settings" to expand the advanced options.

### 5.1 End-to-End Mode — Default

Fully automated: Submit prompt -> system completes all steps -> returns final results.

Best for:
- When you trust the LLM generation quality
- Batch testing
- No need for intermediate checks

### 5.2 Interactive Mode

Step-by-step execution with pauses at key checkpoints, waiting for your confirmation before proceeding.

**Available checkpoints:**

| Checkpoint | Description | When it pauses |
|------------|-------------|----------------|
| **Review Generated Files** | Inspect LLM-generated OpenFOAM configuration files (controlDict, fvSchemes, boundaries, etc.) | After file generation, before running |
| **Review Pre-Run Results** | Check residual trends and initial fields from a short simulation | After Pre-Run, before the full simulation |

**Pre-Run step count** (Interactive mode only):

| Option | Description |
|--------|-------------|
| Single Step (Default) | Run 1 time step to quickly verify the configuration |
| 10 Steps | Run 10 time steps to check initial residual trends |
| 100 Steps | Run 100 time steps for more thorough convergence validation |

**Interactive workflow:**

```
Submit task -> System generates files -> [Checkpoint 1: Review files]
    -> Click "Continue" -> System Pre-Run -> [Checkpoint 2: Review Pre-Run results]
    -> Click "Continue" -> Full simulation -> Done
```

At each checkpoint, you can:
- **Continue**: Confirm the current stage looks good and proceed to the next step
- **Abort**: Terminate the task (marked as failed)

---

## 6. Task Status Reference

After submission, a task goes through the following status transitions:

| Status | Meaning | What you need to do |
|--------|---------|---------------------|
| **queued** | Waiting in queue | Just wait. The UI shows your queue position (e.g., "Position #2") and elapsed wait time |
| **running** | Simulation in progress | Just wait |
| **checkpoint** | Paused for your confirmation (Interactive mode only) | Review intermediate results, click "Continue" or "Abort" |
| **completed** | Simulation finished | View results, download files, provide feedback |
| **failed** | Simulation failed | Check the error reason displayed on the task card |
| **cancelled** | Manually cancelled by you | You can still view any partially generated files |

### Status Filters

Filter tabs above the history list: **All** | **Active** | **Completed** | **Cancelled** | **Failed**

### Common Error Reasons

When a task fails, the system displays the specific reason on the task card:

| Error Type | Message | Suggestion |
|------------|---------|------------|
| Codex quota exhausted | "Platform Codex shared quota exceeded" | Try again later or switch models |
| API rate limit | "LLM API rate limit or quota exceeded" | Try again later or use a different API key |
| Authentication failure | "LLM API authentication failed" | Check that your API key is correct |
| Timeout | "Simulation did not converge within the time limit" | Relax residual targets, simplify the model, or increase timeout in execution settings |
| Out of Memory (OOM) | "Mesh too large, out of memory" | Simplify geometry, reduce mesh density, or upload a lighter .msh file |
| Disk exceeded | "Output exceeded disk limit" | Reduce output frequency (increase writeInterval) or simplify the model |

### Cancelling a Task

Tasks that are queued or running can be terminated by clicking the "Cancel" button.

---

## 7. Viewing Simulation Results

After a task completes (including failed and cancelled tasks, if partial results exist), you can:

### 7.1 Browse Files

Click the "Browse Files" button to open the file browser:

- **Directory navigation**: Expand/collapse folders to view the full file tree
- **Text preview**: Click a file name to view its contents in the browser (e.g., controlDict, fvSchemes, log files)
- **Copy content**: One-click copy file contents to clipboard
- **Single file download**: Download individual files

> **Note**: Generated OpenFOAM files are based on **OpenFOAM v10 (Foundation version)**. If you use the ESI version of OpenFOAM, some syntax may need adjustment.

### 7.2 Download ZIP

Click "Download Results (.zip)" to download all simulation files as a single compressed archive.

---

## 8. Providing Feedback

Your feedback is very important for improving the platform!

### 8.1 Per-File Feedback

In the file browser, each file has a feedback button next to it:

1. Click the feedback button
2. Enter your comments about the file (e.g., "boundary conditions are incorrect", "mesh density is insufficient")
3. Submit to save

Each feedback entry is limited to 5 KB. Submitted feedback is marked with a checkmark.

### 8.2 Overall Rating

At the bottom of the file browser, you can rate the entire task:

| Rating | Meaning |
|--------|---------|
| **Success** | Simulation results are correct and meet requirements |
| **Partial Success** | Partially correct, but with areas for improvement |
| **Failed** | Results are unusable |

You can also attach a text comment (up to 500 characters).

### 8.3 Per-Stage Ratings (Interactive Mode)

When using Interactive mode, you can rate each checkpoint separately:
- File generation stage rating
- Pre-Run stage rating
- Final result rating

---

## 9. Downloading Data

| Method | Description |
|--------|-------------|
| **ZIP archive** | Click "Download Results (.zip)" to get all output files in one package |
| **Individual files** | In the file browser, click the download button for any single file |

---

## 10. Usage Limits & Quotas

### 10.1 Task Limits

| Item | Limit | Notes |
|------|-------|-------|
| Daily tasks (free models) | **10 per day** | Resets at UTC midnight. BYOK mode is unlimited |
| Simulation timeout | **60 minutes** (configurable) | Choose 20/40/60/120 min in execution settings |
| Per-task disk limit | **400 MB** | Task auto-terminated if exceeded |
| Mesh file size | **100 MB** | Max upload size for .msh files |
| Submission rate | **5 per minute** | Per IP address |

### 10.2 Storage Limits

| Item | Limit |
|------|-------|
| Total storage per user | **2 GB** |
| Completed task retention | **14 days** before automatic deletion |
| Failed/cancelled task retention | **7 days** before automatic deletion |

> **Tip**: Your current cloud storage usage is displayed in the top-right corner of the page. If you run low on storage, you can manually delete old tasks to free up space. Each task card has a "Delete" button in the upper-right corner. You have an 8-second undo window after deletion.

### 10.3 Free Models

| Model | Cost | Limit |
|-------|------|-------|
| gpt-5.3-codex (default, recommended) | Free | 10 per user per day |
| gpt-5.2-codex | Free | 10 per user per day |
| gpt-5.2 | Free | 10 per user per day |

All models above are provided via ChatGPT Plus subscription. Model costs under BYOK mode are borne by the user.

---

## 11. FAQ

### Q: My task has been showing "queued" for a long time. What should I do?

The system displays your queue position and elapsed wait time. Worker capacity is limited, so please be patient. If the wait exceeds 30 minutes and your position hasn't changed, the worker may be offline — please contact the administrator.

### Q: Is my API key safe?

Yes. Your API key is used only for the current task. The worker **immediately deletes it from the database** after reading it. Log files are also automatically sanitized before upload (API keys are replaced with `[REDACTED]`).

### Q: Can I submit multiple tasks at the same time?

Yes. Multiple tasks will be queued and processed in submission order. You can check the current queue status before submitting.

### Q: Can I still see files if a simulation fails?

Yes. Failed and cancelled tasks also upload any partially generated files (if available). You can use "Browse Files" to view logs and intermediate outputs.

### Q: OpenFOAM version compatibility?

The platform uses **OpenFOAM v10 (Foundation version)**. If you use the ESI version (e.g., OpenFOAM v2312), some keywords and syntax may differ — please adjust accordingly.

### Q: How do I get an invitation code?

Please contact the platform administrator. The platform is currently in closed beta, and invitation codes are limited.

### Q: Are my settings saved?

Yes. Your model selection, execution mode, checkpoint preferences, and other settings are automatically saved to your browser's local storage and restored on your next visit.

---

## 12. Privacy Policy

By using the CFDQandA platform, you agree to our Privacy Policy. You are required to accept the Privacy Policy checkbox during registration.

Regarding your data, we commit to the following:

- **API Keys**: Used only for the current task; immediately deleted from the database after the worker reads them
- **Mesh files**: Uploaded .msh files are stored on Supabase cloud and deleted together with the associated task
- **Simulation data**: Stored on Supabase cloud; completed tasks are retained for 14 days, failed/cancelled tasks for 7 days, and soft-deleted tasks are permanently purged after 3 days
- **Log sanitization**: API keys in log files are automatically replaced with `[REDACTED]` before upload
- **Third-party services**: The platform uses Supabase (database/auth/storage), Vercel (frontend hosting), and LLM APIs (OpenAI/Anthropic, etc.). Your prompts are sent to the LLM provider to generate simulation configurations

The full Privacy Policy can be accessed via the "Privacy Policy" link at the bottom of the page. If you have questions or wish to exercise your data rights (account deletion, data export, consent withdrawal, etc.), please contact the administrator.

---

## Contact

If you have questions or suggestions, please reach out through:

- **Platform feedback**: Click the feedback button at the bottom of the page after logging in
- **GitHub Issues**: Submit an issue in the project repository

---

*This guide was last updated on March 21, 2026. Platform features may be updated over time — refer to the actual interface for the latest information.*
