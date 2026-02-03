# Deployr Architecture - Visual Guide

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DEVELOPER'S MACHINE                          │
│                                                                       │
│  ┌────────────────┐                                                 │
│  │   Git Repo     │                                                 │
│  │  (Your Code)   │                                                 │
│  └────────────────┘                                                 │
│         │                                                            │
│         │ git push                                                   │
│         ▼                                                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Deployr CLI (Node.js)                          │    │
│  │                                                              │    │
│  │  Commands:                                                   │    │
│  │  • deployr login    - Authenticate                          │    │
│  │  • deployr init     - Create deploy.yaml                    │    │
│  │  • deployr push     - Trigger deployment                    │    │
│  │  • deployr status   - Check deployment status               │    │
│  └────────────────────────────────────────────────────────────┘    │
│         │                                                            │
│         │ HTTPS POST /api/jobs                                      │
│         │ (with API token)                                           │
└─────────┼────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Laravel on cPanel)                       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      API Endpoints                            │  │
│  │                                                                │  │
│  │  Authentication:                                               │  │
│  │  POST /api/auth/github        - GitHub OAuth                  │  │
│  │                                                                │  │
│  │  Projects:                                                     │  │
│  │  POST /api/projects           - Create project                │  │
│  │  GET  /api/projects           - List projects                 │  │
│  │                                                                │  │
│  │  Jobs:                                                         │  │
│  │  POST /api/jobs               - Create deployment job         │  │
│  │  GET  /api/jobs/{id}          - Get job status                │  │
│  │                                                                │  │
│  │  Runner:                                                       │  │
│  │  POST /api/runner/register    - Register new runner           │  │
│  │  GET  /api/runner/jobs        - Poll for jobs (runner)        │  │
│  │  POST /api/runner/jobs/{id}/status - Update job status        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│         │                                                            │
│         │                                                            │
│  ┌──────▼───────────────────────────────────────────────────────┐  │
│  │                    Database (MySQL)                           │  │
│  │                                                                │  │
│  │  Tables:                                                       │  │
│  │  • users            - User accounts                           │  │
│  │  • projects         - Deployment projects                     │  │
│  │  • runners          - Registered runners                      │  │
│  │  • deployment_jobs  - Job queue                               │  │
│  │  • jobs             - Laravel queue jobs                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│         ▲                                                            │
│         │ Polling every 5 seconds                                   │
│         │ GET /api/runner/jobs                                      │
└─────────┼────────────────────────────────────────────────────────────┘
          │
          │
┌─────────┼────────────────────────────────────────────────────────────┐
│         │                  USER'S VPS / SERVER                        │
│         │                                                             │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │              Deployr Runner (Go Binary)                      │   │
│  │                                                               │   │
│  │  Responsibilities:                                            │   │
│  │  1. Poll backend for new jobs                                │   │
│  │  2. Clone repository                                          │   │
│  │  3. Detect framework (Laravel/Next.js)                        │   │
│  │  4. Execute build commands                                    │   │
│  │  5. Deploy artifacts                                          │   │
│  │  6. Report status & logs back to backend                      │   │
│  │                                                                │   │
│  │  Holds:                                                        │   │
│  │  • SSH keys (if needed)                                       │   │
│  │  • Environment variables                                      │   │
│  │  • Server credentials                                         │   │
│  └────────────────────────────────────────────────────────────────┘   │
│         │                                                             │
│         │ Executes commands                                          │
│         ▼                                                             │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Deployed Application                           │    │
│  │                                                              │    │
│  │  /var/www/your-app/                                         │    │
│  │  ├── .env                                                    │    │
│  │  ├── public/                                                 │    │
│  │  └── ...                                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Deployment Flow (Step-by-Step)

### Step 1: Developer Triggers Deployment

```
Developer's Terminal:
$ deployr push

CLI reads deploy.yaml:
┌─────────────────────┐
│ project:            │
│   name: my-app      │
│   framework: laravel│
│   target: vps       │
│ repo:               │
│   branch: main      │
└─────────────────────┘
```

### Step 2: CLI Sends Request to Backend

```
POST https://deployr.example.com/api/jobs
Headers:
  Authorization: Bearer <api_token>
Body:
  {
    "project_id": 123,
    "branch": "main",
    "commit": "abc123"
  }
```

### Step 3: Backend Creates Job

```
Backend (Laravel):
1. Validates request
2. Creates DeploymentJob record:
   ┌────────────────────────────┐
   │ id: 456                    │
   │ project_id: 123            │
   │ status: "pending"          │
   │ runner_id: null            │
   │ created_at: 2026-02-03...  │
   └────────────────────────────┘
3. Returns job ID to CLI
```

### Step 4: Runner Polls for Jobs

```
Runner (Go):
Every 5 seconds:
  GET https://deployr.example.com/api/runner/jobs
  Headers:
    Authorization: Bearer <runner_token>

Backend responds:
  {
    "job_id": 456,
    "project": {
      "repo_url": "https://github.com/user/repo",
      "branch": "main",
      "framework": "laravel",
      "target": "vps"
    }
  }
```

### Step 5: Runner Executes Deployment

```
Runner:
1. Updates job status to "running"
   POST /api/runner/jobs/456/status
   { "status": "running" }

2. Clones repository
   git clone https://github.com/user/repo /tmp/deploy-456
   cd /tmp/deploy-456
   git checkout main

3. Detects framework (Laravel)

4. Executes commands:
   composer install --no-dev
   php artisan migrate --force
   php artisan optimize

5. Deploys:
   rsync -av /tmp/deploy-456/ /var/www/my-app/

6. Post-deploy:
   sudo systemctl restart php-fpm

7. Updates job status to "completed"
   POST /api/runner/jobs/456/status
   { "status": "completed", "logs": "..." }
```

### Step 6: Developer Sees Results

```
CLI (polling job status):
GET /api/jobs/456

Response:
  {
    "status": "completed",
    "logs": "Deployment successful!",
    "deployed_at": "2026-02-03 18:00:00"
  }

Terminal output:
✓ Deployment completed successfully!
  Deployed to: /var/www/my-app
  Time: 45 seconds
```

---

## 🔐 Security Model

### What Each Component Can Access

```
┌──────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
│                                                                │
│  CAN access:                                                   │
│  ✓ User metadata (name, email, GitHub ID)                    │
│  ✓ Project metadata (repo URL, framework)                    │
│  ✓ Job status and logs                                        │
│  ✓ Runner registration info                                   │
│                                                                │
│  CANNOT access:                                                │
│  ✗ Server SSH keys                                            │
│  ✗ Server passwords                                           │
│  ✗ Environment variables                                      │
│  ✗ Direct server access                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         RUNNER                                │
│                                                                │
│  CAN access:                                                   │
│  ✓ Full server access (runs on the server)                   │
│  ✓ SSH keys (stored locally)                                 │
│  ✓ Environment variables                                      │
│  ✓ Execute any command                                        │
│                                                                │
│  Sends to backend:                                             │
│  ✓ Job status updates                                         │
│  ✓ Deployment logs (sanitized, no secrets)                   │
│                                                                │
│  NEVER sends:                                                  │
│  ✗ SSH keys                                                   │
│  ✗ Passwords                                                  │
│  ✗ Environment variables                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                          CLI                                  │
│                                                                │
│  CAN access:                                                   │
│  ✓ Local deploy.yaml                                          │
│  ✓ User's API token                                           │
│  ✓ Backend API                                                │
│                                                                │
│  CANNOT access:                                                │
│  ✗ Server directly                                            │
│  ✗ Other users' projects                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Job Lifecycle

```
1. CREATED
   ├─ CLI creates job via API
   ├─ Backend stores in database
   └─ Status: "pending"

2. QUEUED
   ├─ Job waiting for runner
   └─ Status: "queued"

3. PICKED UP
   ├─ Runner polls and finds job
   ├─ Runner claims job
   └─ Status: "running"

4. EXECUTING
   ├─ Runner clones repo
   ├─ Runner runs build commands
   ├─ Runner deploys files
   └─ Status: "running" (with progress logs)

5. COMPLETED
   ├─ Runner reports success
   ├─ Logs stored in backend
   └─ Status: "completed"

OR

5. FAILED
   ├─ Runner reports failure
   ├─ Error logs stored
   └─ Status: "failed"
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    github_id VARCHAR(255) UNIQUE,
    api_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    name VARCHAR(255),
    repo_url VARCHAR(255),
    framework ENUM('laravel', 'nextjs'),
    target ENUM('vps', 'cpanel'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Runners Table
```sql
CREATE TABLE runners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    name VARCHAR(255),
    token VARCHAR(255) UNIQUE,
    status ENUM('online', 'offline'),
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Deployment Jobs Table
```sql
CREATE TABLE deployment_jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT,
    runner_id BIGINT NULL,
    status ENUM('pending', 'queued', 'running', 'completed', 'failed'),
    branch VARCHAR(255),
    commit_hash VARCHAR(255),
    logs_path VARCHAR(255),
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (runner_id) REFERENCES runners(id)
);
```

---

## 🎯 Component Responsibilities

### Backend (Laravel)
- ✅ User authentication
- ✅ Project management
- ✅ Job queue management
- ✅ Runner registration
- ✅ API endpoints
- ✅ Log storage
- ❌ Never executes deployments
- ❌ Never stores secrets

### Runner (Go)
- ✅ Poll for jobs
- ✅ Clone repositories
- ✅ Detect frameworks
- ✅ Execute build commands
- ✅ Deploy files
- ✅ Report status
- ✅ Store secrets locally
- ❌ Never exposes secrets to backend

### CLI (Node.js)
- ✅ User authentication
- ✅ Project initialization
- ✅ Trigger deployments
- ✅ Display logs
- ✅ Manage configuration
- ❌ Never deploys directly

---

## 🚀 This Architecture Enables

1. **Zero Trust** - Backend never has server access
2. **Flexibility** - Run runner anywhere (VPS, local, etc.)
3. **Scalability** - Multiple runners per user
4. **Simplicity** - Each component has one job
5. **Security** - Secrets stay on runner
6. **Transparency** - All actions logged

---

**This is what makes Deployr special! 🎉**
