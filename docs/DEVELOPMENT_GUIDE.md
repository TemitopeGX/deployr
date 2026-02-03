# Development Guide - Deployr

## 🖥️ Your Development Environment

### What You Have
- ✅ **XAMPP** - MySQL database
- ✅ **PHP** - For Laravel backend
- ✅ **Node.js** - For CLI development
- ✅ **Go** - Installing now (first time!)

### What We'll Use
- **Backend**: `php artisan serve` (Laravel built-in server)
- **Database**: XAMPP MySQL
- **Runner**: `go run main.go` (we'll learn together!)
- **CLI**: `npm link` for local testing

---

## 📚 Go Crash Course (For First-Timers)

### What is Go?
Go (or Golang) is a programming language created by Google. It's perfect for building:
- Command-line tools
- Network services
- System utilities
- **Runners** (like ours!)

### Why Go for the Runner?
1. **Single Binary** - Compiles to one executable file (easy to distribute)
2. **Fast** - Compiled language, runs quickly
3. **Cross-Platform** - Build for Windows, Linux, macOS from one codebase
4. **Great for CLI tools** - Excellent standard library

### Basic Go Commands

```bash
# Check Go version
go version

# Initialize a new Go module
go mod init github.com/yourusername/deployr-runner

# Download dependencies
go mod download

# Run the program
go run main.go

# Build an executable
go build -o deployr-runner.exe

# Install dependencies
go get package-name
```

### Go Project Structure

```
runner/
├── main.go              # Entry point
├── go.mod               # Dependencies (like package.json)
├── go.sum               # Dependency lock file
├── internal/            # Private application code
│   ├── poller/         # Polls backend for jobs
│   ├── executor/       # Executes deployment commands
│   └── logger/         # Handles logging
└── cmd/                # Command-line interface
```

### Simple Go Example

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Deployr Runner!")
}
```

---

## 🔧 Setting Up Each Component

### 1. Backend (Laravel)

#### First Time Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=deployr
# DB_USERNAME=root
# DB_PASSWORD=

# Create database in XAMPP
# Open http://localhost/phpmyadmin
# Create new database: deployr

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

Backend runs on: `http://localhost:8000`

#### Daily Development

```bash
cd backend
php artisan serve
```

---

### 2. Runner (Go)

#### First Time Setup

```bash
cd runner

# Initialize Go module
go mod init github.com/yourusername/deployr-runner

# Create main.go (we'll do this together)

# Run the runner
go run main.go
```

#### Daily Development

```bash
cd runner
go run main.go
```

#### Building Executable

```bash
# For Windows
go build -o deployr-runner.exe

# For Linux (if deploying to VPS)
GOOS=linux GOARCH=amd64 go build -o deployr-runner
```

---

### 3. CLI (Node.js)

#### First Time Setup

```bash
cd cli

# Initialize npm project
npm init -y

# Install dependencies (we'll add as needed)
npm install axios commander chalk ora

# Link for local testing
npm link
```

Now you can run `deployr` from anywhere!

#### Daily Development

```bash
cd cli
node index.js  # or just 'deployr' if linked
```

---

## 🔄 Development Workflow

### Typical Development Session

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache and MySQL

2. **Start Backend**
   ```bash
   cd backend
   php artisan serve
   ```
   Leave this terminal running.

3. **Start Runner** (in new terminal)
   ```bash
   cd runner
   go run main.go
   ```
   Leave this terminal running.

4. **Test CLI** (in new terminal)
   ```bash
   cd cli
   deployr push
   ```

---

## 🐛 Debugging Tips

### Laravel (Backend)

```bash
# View logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear

# Run migrations fresh
php artisan migrate:fresh

# Tinker (Laravel REPL)
php artisan tinker
```

### Go (Runner)

```go
// Add debug prints
fmt.Println("Debug:", variable)

// Or use log package
import "log"
log.Printf("Job received: %+v", job)
```

### Node.js (CLI)

```javascript
// Add debug logs
console.log('Debug:', variable);

// Or use debug package
const debug = require('debug')('deployr:cli');
debug('Sending request to:', url);
```

---

## 📦 Useful Tools

### For Laravel
- **Postman** - Test API endpoints
- **TablePlus** - Database GUI (alternative to phpMyAdmin)
- **Laravel Debugbar** - `composer require barryvdh/laravel-debugbar --dev`

### For Go
- **VS Code** with Go extension
- **Postman** - Test runner API calls

### For Node.js
- **VS Code** with Node.js debugging
- **npm-check-updates** - Keep dependencies updated

---

## 🎯 Next Steps

1. ✅ Install Go
2. ✅ Create project structure
3. 🔄 Set up Laravel backend
4. ⏳ Build basic runner
5. ⏳ Create CLI
6. ⏳ Connect everything together

---

## 🆘 Common Issues

### "composer: command not found"
Install Composer from https://getcomposer.org/

### "go: command not found" (after installation)
Restart your terminal or run:
```bash
refreshenv  # On Windows with Chocolatey
# Or close and reopen terminal
```

### "Access denied for user 'root'@'localhost'"
Check XAMPP MySQL is running and password in `.env` matches.

### Port 8000 already in use
```bash
php artisan serve --port=8001
```

---

## 📖 Learning Resources

### Go
- [Go Tour](https://go.dev/tour/) - Interactive tutorial
- [Go by Example](https://gobyexample.com/) - Practical examples
- [Effective Go](https://go.dev/doc/effective_go) - Best practices

### Laravel
- [Laravel Docs](https://laravel.com/docs)
- [Laracasts](https://laracasts.com/) - Video tutorials

### Node.js CLI
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts

---

**Let's build something awesome! 🚀**
