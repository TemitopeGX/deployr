# Backend Setup Steps

## ✅ What We're Doing

Setting up the Laravel backend API that will:
- Manage users, projects, runners, and deployment jobs
- Provide API endpoints for CLI and Runner
- Queue deployment jobs
- Store logs

---

## 📋 Setup Checklist

### 1. ✅ Install Laravel
```bash
composer create-project laravel/laravel temp-laravel
# Then move files to backend/ directory
```

### 2. ⏳ Create Database
1. Open XAMPP Control Panel
2. Start Apache and MySQL
3. Open phpMyAdmin: http://localhost/phpmyadmin
4. Click "New" to create database
5. Database name: `deployr`
6. Collation: `utf8mb4_unicode_ci`
7. Click "Create"

**OR** run the SQL script:
```bash
# In phpMyAdmin SQL tab, paste contents of setup-database.sql
```

### 3. ⏳ Configure Environment
Edit `.env` file:
```env
APP_NAME=Deployr
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=deployr
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database
```

### 4. ⏳ Generate Application Key
```bash
php artisan key:generate
```

### 5. ⏳ Run Initial Migration
```bash
php artisan migrate
```

### 6. ⏳ Start Development Server
```bash
php artisan serve
```

Visit: http://localhost:8000

---

## 🗄️ Database Models We'll Create

### 1. User Model
```php
- id
- name
- email
- github_id (nullable)
- api_token (unique)
- timestamps
```

### 2. Project Model
```php
- id
- user_id (foreign key)
- name
- repo_url
- framework (enum: laravel, nextjs)
- target (enum: vps, cpanel)
- timestamps
```

### 3. Runner Model
```php
- id
- user_id (foreign key)
- name
- token (unique)
- status (enum: online, offline)
- last_seen_at
- timestamps
```

### 4. DeploymentJob Model
```php
- id
- project_id (foreign key)
- runner_id (foreign key, nullable)
- status (enum: pending, queued, running, completed, failed)
- branch
- commit_hash
- logs (text)
- started_at (nullable)
- completed_at (nullable)
- timestamps
```

---

## 🛣️ API Routes We'll Build

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/logout       - Logout user
```

### Projects
```
GET    /api/projects          - List user's projects
POST   /api/projects          - Create new project
GET    /api/projects/{id}     - Get project details
PUT    /api/projects/{id}     - Update project
DELETE /api/projects/{id}     - Delete project
```

### Deployment Jobs
```
GET    /api/jobs              - List jobs
POST   /api/jobs              - Create deployment job
GET    /api/jobs/{id}         - Get job details
```

### Runner (Special endpoints for runner authentication)
```
POST   /api/runner/register           - Register new runner
GET    /api/runner/jobs               - Poll for jobs (runner only)
POST   /api/runner/jobs/{id}/claim    - Claim a job
POST   /api/runner/jobs/{id}/status   - Update job status
POST   /api/runner/jobs/{id}/logs     - Append logs
POST   /api/runner/heartbeat          - Update last_seen_at
```

---

## 🔧 Artisan Commands We'll Use

```bash
# Create models with migrations
php artisan make:model User -m
php artisan make:model Project -m
php artisan make:model Runner -m
php artisan make:model DeploymentJob -m

# Create controllers
php artisan make:controller Api/AuthController
php artisan make:controller Api/ProjectController
php artisan make:controller Api/JobController
php artisan make:controller Api/RunnerController

# Run migrations
php artisan migrate

# Rollback migrations (if needed)
php artisan migrate:rollback

# View all routes
php artisan route:list

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## 📦 Additional Packages We Might Need

```bash
# API Resources (for formatting JSON responses)
# Already included in Laravel

# Queue system (database driver)
# Already configured

# Sanctum (for API token authentication)
php artisan install:api
```

---

## 🧪 Testing the API

### Using Postman or Thunder Client

1. **Register User**
   ```
   POST http://localhost:8000/api/auth/register
   Body (JSON):
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Create Project**
   ```
   POST http://localhost:8000/api/projects
   Headers:
     Authorization: Bearer {api_token}
   Body (JSON):
   {
     "name": "My App",
     "repo_url": "https://github.com/user/repo",
     "framework": "laravel",
     "target": "vps"
   }
   ```

3. **Create Deployment Job**
   ```
   POST http://localhost:8000/api/jobs
   Headers:
     Authorization: Bearer {api_token}
   Body (JSON):
   {
     "project_id": 1,
     "branch": "main"
   }
   ```

---

## 🎯 Next Steps After Setup

1. ✅ Laravel installed
2. ✅ Database created
3. ✅ Environment configured
4. ✅ Server running
5. ⏳ Create database models
6. ⏳ Create migrations
7. ⏳ Create controllers
8. ⏳ Define routes
9. ⏳ Test with Postman

---

## 🆘 Common Issues

### "Access denied for user 'root'@'localhost'"
- Make sure XAMPP MySQL is running
- Check password in `.env` (usually empty for XAMPP)

### "Base table or view not found"
- Run `php artisan migrate`

### "Port 8000 already in use"
- Use different port: `php artisan serve --port=8001`

### "Class 'App\Models\User' not found"
- Run `composer dump-autoload`

---

**Ready to build! 🚀**
