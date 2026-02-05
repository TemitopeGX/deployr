package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// Config holds the runner configuration
type Config struct {
	BackendURL  string
	RunnerToken string
	WorkDir     string
}

// Job represents a deployment job from the backend
type Job struct {
	ID      int     `json:"id"`
	Status  string  `json:"status"`
	Branch  string  `json:"branch"`
	Project Project `json:"project"`
}

// Project represents a project
type Project struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	RepoURL     string `json:"repo_url"`
	Framework   string `json:"framework"`
	Target      string `json:"target"`
	SSHHost     string `json:"ssh_host"`
	SSHPort     string `json:"ssh_port"`
	SSHUser     string `json:"ssh_user"`
	SSHPassword string `json:"ssh_password"`
	SSHKeyPath  string `json:"ssh_key_path"`
	RemotePath  string `json:"remote_path"`
	PublicPath  string `json:"public_path"`
}

// PollResponse is the response from polling for jobs
type PollResponse struct {
	Job     *Job   `json:"job"`
	Message string `json:"message"`
}

// Runner is the main runner struct
type Runner struct {
	config Config
	client *http.Client
}

// NewRunner creates a new runner instance
func NewRunner(config Config) *Runner {
	return &Runner{
		config: config,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Start begins the polling loop
func (r *Runner) Start() {
	log.Println("🚀 Deployr Runner starting...")
	log.Printf("📡 Backend URL: %s\n", r.config.BackendURL)
	log.Printf("📁 Work directory: %s\n", r.config.WorkDir)

	// Send initial heartbeat
	if err := r.sendHeartbeat(); err != nil {
		log.Printf("⚠️  Failed to send initial heartbeat: %v\n", err)
	}

	// Start polling loop
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	log.Println("👀 Polling for jobs...")

	for range ticker.C {
		log.Printf("🔍 Polling... (Last checked: %s)\n", time.Now().Format("15:04:05"))
		if err := r.poll(); err != nil {
			log.Printf("❌ Error polling: %v\n", err)
		}

		// Send heartbeat every poll
		if err := r.sendHeartbeat(); err != nil {
			log.Printf("⚠️  Failed to send heartbeat: %v\n", err)
		}
	}
}

// poll checks for available jobs
func (r *Runner) poll() error {
	req, err := http.NewRequest("GET", r.config.BackendURL+"/api/runner/jobs", nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+r.config.RunnerToken)

	resp, err := r.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	var pollResp PollResponse
	if err := json.NewDecoder(resp.Body).Decode(&pollResp); err != nil {
		return err
	}

	if pollResp.Job != nil {
		log.Printf("🎯 Job found! ID: %d, Project: %s\n", pollResp.Job.ID, pollResp.Job.Project.Name)
		return r.processJob(pollResp.Job)
	}

	return nil
}

// processJob handles a deployment job
func (r *Runner) processJob(job *Job) error {
	log.Printf("📦 Processing job #%d for project: %s (Target: %s)\n", job.ID, job.Project.Name, job.Project.Target)

	// Claim the job
	if err := r.claimJob(job.ID); err != nil {
		return fmt.Errorf("failed to claim job: %w", err)
	}

	if job.Project.Target == "cpanel" {
		r.appendLogs(job.ID, "[Runner] Starting SSH deployment to cPanel...")

		// Configure SSH
		sshConfig := SSHConfig{
			Host:     job.Project.SSHHost,
			Port:     job.Project.SSHPort,
			User:     job.Project.SSHUser,
			Password: job.Project.SSHPassword,
			KeyPath:  job.Project.SSHKeyPath,
		}

		if sshConfig.Port == "" {
			sshConfig.Port = "22"
		}

		deployer := NewSSHDeployer(sshConfig)

		// Connect
		if err := deployer.Connect(); err != nil {
			msg := fmt.Sprintf("Failed to connect via SSH: %v", err)
			r.updateJobStatus(job.ID, "failed", msg)
			return err
		}
		defer deployer.Close()

		// Deploy
		if err := deployer.DeployViaGitPull(job.Project.RemotePath, job.Branch, job.Project.PublicPath, job.Project.RepoURL, job.Project.Framework); err != nil {
			msg := fmt.Sprintf("SSH Deployment failed: %v", err)
			r.updateJobStatus(job.ID, "failed", msg)
			return err
		}

		// Mark as completed
		r.updateJobStatus(job.ID, "completed", "[Runner] SSH Deployment completed successfully! ✅")
		log.Printf("✅ Job #%d completed successfully via SSH!\n", job.ID)
		return nil
	}

	// Default: local deployment (VPS or simulated)
	// Clone repository
	repoPath, err := r.cloneRepository(job)
	if err != nil {
		r.updateJobStatus(job.ID, "failed", fmt.Sprintf("Failed to clone repository: %v", err))
		return err
	}
	defer os.RemoveAll(repoPath) // Cleanup

	// Detect framework
	framework, err := r.detectFramework(repoPath)
	if err != nil {
		r.updateJobStatus(job.ID, "failed", fmt.Sprintf("Failed to detect framework: %v", err))
		return err
	}

	log.Printf("🔍 Detected framework: %s\n", framework)
	r.appendLogs(job.ID, fmt.Sprintf("[Runner] Detected framework: %s", framework))

	// Execute build commands
	if err := r.executeBuild(job, repoPath, framework); err != nil {
		r.updateJobStatus(job.ID, "failed", fmt.Sprintf("Build failed: %v", err))
		return err
	}

	// Mark as completed
	r.updateJobStatus(job.ID, "completed", "[Runner] Deployment completed successfully! ✅")

	log.Printf("✅ Job #%d completed successfully!\n", job.ID)
	return nil
}

// claimJob claims a job
func (r *Runner) claimJob(jobID int) error {
	url := fmt.Sprintf("%s/api/runner/jobs/%d/claim", r.config.BackendURL, jobID)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+r.config.RunnerToken)

	resp, err := r.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to claim job: %s", string(body))
	}

	log.Printf("✅ Job #%d claimed\n", jobID)
	return nil
}

// cloneRepository clones the git repository
func (r *Runner) cloneRepository(job *Job) (string, error) {
	log.Printf("📥 Cloning repository: %s (branch: %s)\n", job.Project.RepoURL, job.Branch)
	r.appendLogs(job.ID, fmt.Sprintf("[Runner] Cloning repository: %s", job.Project.RepoURL))

	// Create temporary directory
	repoPath := filepath.Join(r.config.WorkDir, fmt.Sprintf("job-%d", job.ID))

	// Clone repository
	cmd := exec.Command("git", "clone", "--branch", job.Branch, "--depth", "1", job.Project.RepoURL, repoPath)
	output, err := cmd.CombinedOutput()

	if err != nil {
		return "", fmt.Errorf("git clone failed: %w, output: %s", err, string(output))
	}

	r.appendLogs(job.ID, "[Runner] Repository cloned successfully")
	log.Printf("✅ Repository cloned to: %s\n", repoPath)

	return repoPath, nil
}

// detectFramework detects the framework type
func (r *Runner) detectFramework(repoPath string) (string, error) {
	// Check for Laravel
	if _, err := os.Stat(filepath.Join(repoPath, "artisan")); err == nil {
		return "laravel", nil
	}

	// Check for Next.js
	if _, err := os.Stat(filepath.Join(repoPath, "next.config.js")); err == nil {
		return "nextjs", nil
	}

	// Check package.json for Next.js
	packageJSON := filepath.Join(repoPath, "package.json")
	if data, err := os.ReadFile(packageJSON); err == nil {
		if strings.Contains(string(data), "\"next\"") {
			return "nextjs", nil
		}
	}

	return "", fmt.Errorf("unknown framework")
}

// executeBuild runs the build commands
func (r *Runner) executeBuild(job *Job, repoPath, framework string) error {
	log.Printf("🔨 Building project (framework: %s)\n", framework)

	var commands [][]string

	if framework == "laravel" {
		commands = [][]string{
			{"composer", "install", "--no-dev", "--optimize-autoloader"},
			{"php", "artisan", "config:cache"},
			{"php", "artisan", "route:cache"},
			{"php", "artisan", "view:cache"},
		}
	} else if framework == "nextjs" {
		commands = [][]string{
			{"npm", "install"},
			{"npm", "run", "build"},
		}
	}

	for _, cmdArgs := range commands {
		if err := r.executeCommand(job.ID, repoPath, cmdArgs); err != nil {
			return err
		}
	}

	return nil
}

// executeCommand executes a shell command
func (r *Runner) executeCommand(jobID int, workDir string, cmdArgs []string) error {
	cmdStr := strings.Join(cmdArgs, " ")
	log.Printf("⚙️  Executing: %s\n", cmdStr)
	r.appendLogs(jobID, fmt.Sprintf("[Runner] Executing: %s", cmdStr))

	cmd := exec.Command(cmdArgs[0], cmdArgs[1:]...)
	cmd.Dir = workDir

	output, err := cmd.CombinedOutput()

	if err != nil {
		errMsg := fmt.Sprintf("Command failed: %s\nOutput: %s", err.Error(), string(output))
		r.appendLogs(jobID, fmt.Sprintf("[Runner] ❌ %s", errMsg))
		return fmt.Errorf(errMsg)
	}

	// Log output (truncate if too long)
	outputStr := string(output)
	if len(outputStr) > 500 {
		outputStr = outputStr[:500] + "... (truncated)"
	}

	r.appendLogs(jobID, fmt.Sprintf("[Runner] ✅ Command completed\n%s", outputStr))

	return nil
}

// updateJobStatus updates the job status
func (r *Runner) updateJobStatus(jobID int, status, logs string) error {
	url := fmt.Sprintf("%s/api/runner/jobs/%d/status", r.config.BackendURL, jobID)

	data := map[string]string{
		"status": status,
		"logs":   logs,
	}

	jsonData, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+r.config.RunnerToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	log.Printf("📊 Job #%d status updated to: %s\n", jobID, status)
	return nil
}

// appendLogs appends logs to a job
func (r *Runner) appendLogs(jobID int, logs string) error {
	url := fmt.Sprintf("%s/api/runner/jobs/%d/logs", r.config.BackendURL, jobID)

	data := map[string]string{
		"logs": logs,
	}

	jsonData, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+r.config.RunnerToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

// sendHeartbeat sends a heartbeat to the backend
func (r *Runner) sendHeartbeat() error {
	url := fmt.Sprintf("%s/api/runner/heartbeat", r.config.BackendURL)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+r.config.RunnerToken)

	resp, err := r.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func main() {
	// Load configuration from environment variables
	config := Config{
		BackendURL:  getEnv("DEPLOYR_BACKEND_URL", "http://localhost:8000"),
		RunnerToken: getEnv("DEPLOYR_RUNNER_TOKEN", ""),
		WorkDir:     getEnv("DEPLOYR_WORK_DIR", "./deployments"),
	}

	// Validate configuration
	if config.RunnerToken == "" {
		log.Fatal("❌ DEPLOYR_RUNNER_TOKEN environment variable is required")
	}

	// Create work directory
	if err := os.MkdirAll(config.WorkDir, 0755); err != nil {
		log.Fatalf("❌ Failed to create work directory: %v", err)
	}

	// Create and start runner
	runner := NewRunner(config)
	runner.Start()
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
