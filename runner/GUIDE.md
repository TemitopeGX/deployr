# Go Runner - Development Guide

## 🎯 What We're Building

A self-hosted runner that:
1. Polls the backend for deployment jobs
2. Clones repositories
3. Detects framework (Laravel/Next.js)
4. Executes build commands
5. Deploys files
6. Reports status and logs back to the backend

---

## 📚 Go Basics You'll Learn

### 1. **Variables**
```go
var name string = "deployr"
age := 25  // Short declaration
```

### 2. **Functions**
```go
func greet(name string) string {
    return "Hello, " + name
}
```

### 3. **Structs** (like classes)
```go
type Runner struct {
    Name  string
    Token string
}
```

### 4. **Methods**
```go
func (r *Runner) Start() {
    fmt.Println("Starting runner:", r.Name)
}
```

### 5. **Error Handling**
```go
result, err := doSomething()
if err != nil {
    log.Fatal(err)
}
```

### 6. **HTTP Requests**
```go
resp, err := http.Get("https://api.example.com")
if err != nil {
    return err
}
defer resp.Body.Close()
```

---

## 🏗️ Runner Architecture

```
main.go
├── Initialize runner
├── Load configuration
└── Start polling loop
    ├── Poll for jobs
    ├── If job found:
    │   ├── Claim job
    │   ├── Clone repository
    │   ├── Detect framework
    │   ├── Execute build
    │   ├── Deploy files
    │   └── Report completion
    └── Sleep 5 seconds
```

---

## 📦 Dependencies We'll Use

```go
// Standard library (built-in)
import (
    "fmt"        // Printing
    "log"        // Logging
    "time"       // Time/sleep
    "os"         // OS operations
    "os/exec"    // Execute commands
    "encoding/json" // JSON parsing
    "net/http"   // HTTP requests
    "io"         // Input/output
)
```

---

## 🔧 Configuration

The runner needs:
- Backend API URL
- Runner token
- Working directory

We'll use environment variables or a config file.

---

## 🎯 Step-by-Step Build Plan

### Step 1: Basic Structure (15 min)
- Create main.go
- Set up configuration
- Test basic HTTP request

### Step 2: Polling Loop (15 min)
- Implement poll for jobs
- Parse JSON response
- Test with backend

### Step 3: Job Claiming (15 min)
- Claim job endpoint
- Update job status
- Error handling

### Step 4: Repository Cloning (20 min)
- Execute git clone
- Handle errors
- Clean up

### Step 5: Framework Detection (15 min)
- Check for Laravel files
- Check for Next.js files
- Return framework type

### Step 6: Command Execution (20 min)
- Execute build commands
- Capture output
- Stream logs to backend

### Step 7: Status Reporting (15 min)
- Update job status
- Append logs
- Handle completion

### Step 8: Integration & Testing (20 min)
- Test full workflow
- Error handling
- Cleanup

**Total Time: ~2.5 hours**

---

## 🚀 Let's Start Building!

Ready to write your first Go code? 🎉
