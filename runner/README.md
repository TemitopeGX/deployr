# Deployr Runner

A self-hosted deployment runner written in Go that executes deployment jobs from the Deployr backend.

## 🎯 What It Does

The runner:
1. **Polls** the backend API for deployment jobs (every 5 seconds)
2. **Claims** available jobs
3. **Clones** the git repository
4. **Detects** the framework (Laravel or Next.js)
5. **Executes** build commands
6. **Reports** status and logs back to the backend
7. **Sends** heartbeat to show it's online

## 🚀 Quick Start

### 1. Get Your Runner Token

First, register a runner using the backend API:

```bash
curl -X POST http://localhost:8000/api/runners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_API_TOKEN" \
  -d '{"name":"My Runner"}'
```

**Save the runner token!** It's only shown once.

### 2. Set Environment Variables

```bash
# Windows (PowerShell)
$env:DEPLOYR_BACKEND_URL = "http://localhost:8000"
$env:DEPLOYR_RUNNER_TOKEN = "your-runner-token-here"

# Linux/Mac
export DEPLOYR_BACKEND_URL="http://localhost:8000"
export DEPLOYR_RUNNER_TOKEN="your-runner-token-here"
```

### 3. Run the Runner

```bash
go run main.go
```

Or build and run:

```bash
go build -o deployr-runner
./deployr-runner  # Linux/Mac
.\deployr-runner.exe  # Windows
```

## 📋 Configuration

The runner is configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DEPLOYR_BACKEND_URL` | Backend API URL | `http://localhost:8000` |
| `DEPLOYR_RUNNER_TOKEN` | Runner authentication token | **Required** |
| `DEPLOYR_WORK_DIR` | Working directory for deployments | `./deployments` |

## 🏗️ How It Works

### Polling Loop

```
Every 5 seconds:
  ├── Send heartbeat
  ├── Poll for jobs
  └── If job found:
      ├── Claim job
      ├── Clone repository
      ├── Detect framework
      ├── Execute build
      └── Report completion
```

### Framework Detection

**Laravel:**
- Looks for `artisan` file
- Runs: `composer install`, `php artisan config:cache`, etc.

**Next.js:**
- Looks for `next.config.js` or `"next"` in `package.json`
- Runs: `npm install`, `npm run build`

### Build Commands

**Laravel:**
```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Next.js:**
```bash
npm install
npm run build
```

## 📊 Status Reporting

The runner reports job status to the backend:

- `queued` → `running` (when claimed)
- `running` → `completed` (on success)
- `running` → `failed` (on error)

Logs are streamed in real-time to the backend.

## 🔒 Security

- **Zero-Trust:** The runner holds all secrets (SSH keys, env vars)
- **Token-Based:** Uses runner token for authentication
- **Isolated:** Each job runs in a separate directory
- **Cleanup:** Temporary files are deleted after deployment

## 🛠️ Requirements

- Go 1.16+ (you have 1.25.6 ✅)
- Git installed
- Composer (for Laravel projects)
- Node.js & npm (for Next.js projects)

## 📝 Example Output

```
🚀 Deployr Runner starting...
📡 Backend URL: http://localhost:8000
📁 Work directory: ./deployments
👀 Polling for jobs...
🎯 Job found! ID: 1, Project: My Laravel App
📦 Processing job #1 for project: My Laravel App
✅ Job #1 claimed
📥 Cloning repository: https://github.com/laravel/laravel (branch: main)
✅ Repository cloned to: ./deployments/job-1
🔍 Detected framework: laravel
🔨 Building project (framework: laravel)
⚙️  Executing: composer install --no-dev --optimize-autoloader
✅ Command completed
⚙️  Executing: php artisan config:cache
✅ Command completed
📊 Job #1 status updated to: completed
✅ Job #1 completed successfully!
```

## 🧪 Testing

### Test with a Real Job

1. **Start the runner:**
   ```bash
   go run main.go
   ```

2. **Create a deployment job** (from another terminal):
   ```bash
   curl -X POST http://localhost:8000/api/jobs \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_USER_TOKEN" \
     -d '{"project_id":1,"branch":"main"}'
   ```

3. **Watch the runner** execute the deployment!

## 🐛 Troubleshooting

### "DEPLOYR_RUNNER_TOKEN environment variable is required"
- Make sure you've set the `DEPLOYR_RUNNER_TOKEN` environment variable
- Get a token by registering a runner via the API

### "git clone failed"
- Ensure git is installed: `git --version`
- Check if the repository URL is accessible
- Verify you have network connectivity

### "composer: command not found"
- Install Composer for Laravel projects
- Or skip Laravel projects for now

### "npm: command not found"
- Install Node.js and npm for Next.js projects
- Or skip Next.js projects for now

## 📦 Building for Production

### Build for your platform:
```bash
go build -o deployr-runner
```

### Cross-compile for Linux:
```bash
GOOS=linux GOARCH=amd64 go build -o deployr-runner-linux
```

### Cross-compile for Windows:
```bash
GOOS=windows GOARCH=amd64 go build -o deployr-runner.exe
```

## 🚀 Deployment

### Run as a Service (Linux)

Create `/etc/systemd/system/deployr-runner.service`:

```ini
[Unit]
Description=Deployr Runner
After=network.target

[Service]
Type=simple
User=deployr
WorkingDirectory=/opt/deployr-runner
Environment="DEPLOYR_BACKEND_URL=https://your-backend.com"
Environment="DEPLOYR_RUNNER_TOKEN=your-token"
ExecStart=/opt/deployr-runner/deployr-runner
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable deployr-runner
sudo systemctl start deployr-runner
sudo systemctl status deployr-runner
```

## 📚 Code Structure

```
main.go
├── Config - Configuration struct
├── Job - Job data structure
├── Project - Project data structure
├── Runner - Main runner struct
│   ├── Start() - Start polling loop
│   ├── poll() - Poll for jobs
│   ├── processJob() - Process a job
│   ├── claimJob() - Claim a job
│   ├── cloneRepository() - Clone git repo
│   ├── detectFramework() - Detect framework
│   ├── executeBuild() - Run build commands
│   ├── executeCommand() - Execute shell command
│   ├── updateJobStatus() - Update job status
│   ├── appendLogs() - Append logs
│   └── sendHeartbeat() - Send heartbeat
└── main() - Entry point
```

## 🎓 Learning Go

This runner is a great way to learn Go! It demonstrates:
- ✅ Structs and methods
- ✅ HTTP requests
- ✅ JSON parsing
- ✅ Error handling
- ✅ File operations
- ✅ Command execution
- ✅ Goroutines (implicit in ticker)
- ✅ Environment variables

## 🔥 Next Steps

1. **Test the runner** with real deployments
2. **Add more frameworks** (Vue, React, etc.)
3. **Add deployment strategies** (SSH, FTP, rsync)
4. **Add environment variable injection**
5. **Add rollback support**

## 📖 API Endpoints Used

- `GET /api/runner/jobs` - Poll for jobs
- `POST /api/runner/jobs/{id}/claim` - Claim a job
- `POST /api/runner/jobs/{id}/status` - Update status
- `POST /api/runner/jobs/{id}/logs` - Append logs
- `POST /api/runner/heartbeat` - Send heartbeat

---

**The runner is ready to deploy! 🚀**
