# 🚀 Quick Test Guide - Run the Deployr Runner

## ✅ Setup Complete!

The test script has already:
- ✅ Created a user
- ✅ Created a project (Laravel Demo)
- ✅ Registered a runner
- ✅ Created a deployment job
- ✅ Saved all tokens to `test-tokens.ps1`

---

## 🎯 Now Start the Runner

### Option 1: Use the start script (Recommended)

```powershell
cd runner
.\start.ps1
```

The start script will automatically load the tokens and start the runner!

---

### Option 2: Manual start

If you want to start manually:

```powershell
cd runner

# Load the tokens
. ..\test-tokens.ps1

# Start the runner
.\deployr-runner.exe
```

---

## 📊 What Will Happen

Once you start the runner, you'll see:

```
🚀 Deployr Runner starting...
📡 Backend URL: http://localhost:8000
📁 Work directory: ./deployments
👀 Polling for jobs...
🎯 Job found! ID: X, Project: Laravel Demo
📦 Processing job #X for project: Laravel Demo
✅ Job #X claimed
📥 Cloning repository: https://github.com/laravel/laravel (branch: main)
✅ Repository cloned to: ./deployments/job-X
🔍 Detected framework: laravel
🔨 Building project (framework: laravel)
⚙️  Executing: composer install --no-dev --optimize-autoloader
```

---

## ⚠️ Important Notes

### If you don't have Composer installed:

The build commands will fail, but you'll still see:
- ✅ Job polling working
- ✅ Job claiming working
- ✅ Repository cloning working
- ✅ Framework detection working
- ❌ Build commands failing (expected without composer)

This is **totally fine** for testing! The important part is seeing the workflow in action.

---

### If you want to install Composer:

Download from: https://getcomposer.org/download/

Or test with a Next.js project instead (requires Node.js/npm).

---

## 🧪 Testing Without Build Tools

If you don't have composer/npm installed, you can still test by:

1. Watching the runner find and claim the job ✅
2. Seeing it clone the repository ✅
3. Seeing it detect the framework ✅
4. The build will fail (expected) but that's okay!

The core functionality (polling, claiming, cloning, detecting) will work perfectly!

---

## 🎯 Ready to Test!

Just run:

```powershell
cd runner
.\start.ps1
```

And watch the magic happen! 🎉

---

## 📝 View Job Status

While the runner is running, you can check the job status in another terminal:

```powershell
# Load tokens
. .\test-tokens.ps1

# View job details
$headers = @{Authorization="Bearer $env:API_TOKEN"}
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/jobs" -Method GET -Headers $headers
$json = $response.Content | ConvertFrom-Json
$json.jobs | Format-Table id, status, created_at
```

---

**Let's see it run! 🚀**
