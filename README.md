# Deployr - GitHub Actions-Style Deployment Platform

> Make any server feel like Vercel — without locking users in.

## 🎯 What is Deployr?

Deployr is a deployment automation platform that enables developers to deploy applications to VPS and shared hosting (cPanel) using self-hosted runners. Think GitHub Actions, but for deployments with a zero-trust architecture.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer's Machine                       │
│  ┌──────────────┐         ┌─────────────────────────────┐  │
│  │  CLI (Node)  │────────▶│  deployr push               │  │
│  └──────────────┘         └─────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS API Call
                         ▼
         ┌───────────────────────────────────┐
         │   Backend (Laravel on cPanel)     │
         │  - Manages jobs queue             │
         │  - Stores metadata                │
         │  - Serves API endpoints           │
         │  - Never touches servers          │
         └───────────────┬───────────────────┘
                         │
                         │ Polling (GET /api/runner/jobs)
                         ▼
         ┌───────────────────────────────────┐
         │   Runner (Go binary on VPS)       │
         │  - Polls for jobs                 │
         │  - Executes deployments           │
         │  - Holds all secrets              │
         │  - Reports back logs              │
         └───────────────────────────────────┘
```

## 🔐 Trust Model

| Component | Responsibility | Access |
|-----------|---------------|--------|
| **Backend** | Orchestration | Metadata only |
| **CLI** | Trigger | API token |
| **Runner** | Execution | Full local access |
| **Server** | Hosting | Never accessed by backend |

**Golden Rule:** The backend can NEVER deploy an app by itself.

## 📁 Project Structure

```
deployer/
├── backend/        # Laravel API (PHP)
├── runner/         # Self-hosted runner (Go)
├── cli/            # Developer CLI (Node.js)
├── docs/           # Documentation
└── plan.md         # Full project specification
```

## 🚀 Development Setup

### Prerequisites

- **PHP** 8.1+ (for Laravel backend)
- **Composer** (PHP package manager)
- **MySQL** (via XAMPP or standalone)
- **Node.js** 18+ (for CLI)
- **Go** 1.21+ (for runner)

### Local Development

#### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend will run on `http://localhost:8000`

#### 2. Runner (Go)

```bash
cd runner
go mod download
go run main.go
```

#### 3. CLI (Node.js)

```bash
cd cli
npm install
npm link  # Makes 'deployr' command available globally
```

## 🎯 Supported Frameworks (v1)

- **Laravel** (VPS & cPanel)
- **Next.js** (VPS & cPanel)

## 📝 Configuration Example

Every project needs a `deploy.yaml`:

```yaml
project:
  name: example-app
  framework: laravel
  target: vps

repo:
  branch: main

server:
  path: /var/www/example-app
```

## 🛠️ CLI Commands (Planned)

```bash
deployr login          # Authenticate with backend
deployr init           # Initialize project (creates deploy.yaml)
deployr push           # Trigger deployment
deployr status         # Check deployment status
```

## 🔄 Deployment Workflow

1. Developer runs `deployr push`
2. CLI sends request to Backend API
3. Backend queues deployment job
4. Runner polls backend and picks up job
5. Runner clones repository
6. Runner detects framework
7. Runner executes build commands
8. Runner deploys artifacts
9. Runner reports status & logs
10. Developer sees real-time feedback

## 🎨 Core Principles

- ✅ Self-hosted execution first
- ✅ Opinionated, boring workflows
- ✅ Least-privilege security
- ✅ CLI-first developer experience
- ✅ Free-first adoption model

## 🚫 Non-Goals (v1)

- Docker/Kubernetes orchestration
- Auto-scaling
- Blue-green deployments
- Multi-server deployments
- Billing or subscriptions

## 📊 Database Models

### User
- `id`, `name`, `github_id`, `api_token`

### Project
- `id`, `user_id`, `repo_url`, `framework`, `target`

### Runner
- `id`, `user_id`, `token`, `status`, `last_seen_at`

### DeploymentJob
- `id`, `project_id`, `runner_id`, `status`, `logs_path`

## 🔗 API Endpoints (Planned)

### Authentication
- `POST /api/auth/github`

### Projects
- `POST /api/projects`

### Jobs
- `POST /api/jobs`
- `GET /api/jobs/{id}`

### Runner
- `POST /api/runner/register`
- `GET /api/runner/jobs`
- `POST /api/runner/jobs/{id}/status`

## 📈 Success Metrics

- Active runners
- Weekly deployments
- Community adoption

## 🗓️ Build Order

1. ✅ Project structure
2. 🔄 Laravel backend
3. ⏳ Runner (Go)
4. ⏳ CLI (Node.js)
5. ⏳ First real deployment

## 📖 Documentation

See the [plan.md](./plan.md) for the complete project specification.

## 🤝 Contributing

This is currently in active development. Stay tuned for contribution guidelines!

## 📄 License

TBD

---

**Built with ❤️ for developers who want control over their deployments**
