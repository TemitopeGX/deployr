package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"golang.org/x/crypto/ssh"
)

// SSHConfig holds SSH connection details
type SSHConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	KeyPath  string
}

// SSHDeployer handles SSH-based deployments
type SSHDeployer struct {
	config SSHConfig
	client *ssh.Client
}

// NewSSHDeployer creates a new SSH deployer
func NewSSHDeployer(config SSHConfig) *SSHDeployer {
	return &SSHDeployer{
		config: config,
	}
}

// Connect establishes SSH connection
func (d *SSHDeployer) Connect() error {
	var authMethods []ssh.AuthMethod

	// Try password authentication
	if d.config.Password != "" {
		authMethods = append(authMethods, ssh.Password(d.config.Password))
	}

	// Try key-based authentication
	if d.config.KeyPath != "" {
		key, err := os.ReadFile(d.config.KeyPath)
		if err != nil {
			log.Printf("⚠️  Could not read SSH key: %v\n", err)
		} else {
			signer, err := ssh.ParsePrivateKey(key)
			if err != nil {
				log.Printf("⚠️  Could not parse SSH key: %v\n", err)
			} else {
				authMethods = append(authMethods, ssh.PublicKeys(signer))
			}
		}
	}

	config := &ssh.ClientConfig{
		User:            d.config.User,
		Auth:            authMethods,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // TODO: Use proper host key verification in production
		Timeout:         30 * time.Second,
	}

	addr := fmt.Sprintf("%s:%s", d.config.Host, d.config.Port)
	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return fmt.Errorf("failed to connect to SSH: %w", err)
	}

	d.client = client
	log.Printf("✅ SSH connected to %s@%s:%s\n", d.config.User, d.config.Host, d.config.Port)
	return nil
}

// Close closes the SSH connection
func (d *SSHDeployer) Close() error {
	if d.client != nil {
		return d.client.Close()
	}
	return nil
}

// ExecuteCommand runs a command via SSH
func (d *SSHDeployer) ExecuteCommand(command string) (string, error) {
	if d.client == nil {
		return "", fmt.Errorf("SSH client not connected")
	}

	session, err := d.client.NewSession()
	if err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}
	defer session.Close()

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	session.Stdout = &stdout
	session.Stderr = &stderr

	err = session.Run(command)
	output := stdout.String()
	if err != nil {
		return output, fmt.Errorf("command failed: %w, stderr: %s", err, stderr.String())
	}

	return output, nil
}

// DeployViaGitPull deploys a project using git pull (clones if missing)
func (d *SSHDeployer) DeployViaGitPull(remotePath, branch, publicPath, repoURL string) error {
	log.Printf("🚀 Starting Git Pull deployment to: %s\n", remotePath)

	// 1. Ensure remote path exists or clone it
	log.Println("📥 Checking remote path...")

	// Create parent directory if it doesn't exist
	mkdirCmd := fmt.Sprintf("mkdir -p $(dirname %s)", remotePath)
	d.ExecuteCommand(mkdirCmd)

	// Check if directory exists and has a .git folder
	checkCmd := fmt.Sprintf("[ -d %s/.git ] && echo 'exists' || echo 'missing'", remotePath)
	output, _ := d.ExecuteCommand(checkCmd)

	var finalCmd string
	if strings.TrimSpace(output) == "missing" {
		log.Println("📂 Target directory missing or not a git repo. Cloning...")
		finalCmd = fmt.Sprintf("rm -rf %[1]s && git clone --branch %[2]s --depth 1 %[3]s %[1]s", remotePath, branch, repoURL)
	} else {
		log.Println("📥 Pulling latest code from Git...")
		finalCmd = fmt.Sprintf("cd %s && git pull origin %s", remotePath, branch)
	}

	output, err := d.ExecuteCommand(finalCmd)
	if err != nil {
		return fmt.Errorf("git operation failed: %w, output: %s", err, output)
	}
	log.Printf("✅ Git operation completed: %s\n", strings.TrimSpace(output))

	// 2. Install composer dependencies
	log.Println("📦 Installing Composer dependencies...")
	composerCmd := fmt.Sprintf("cd %s && /opt/cpanel/composer/bin/composer install --no-dev --optimize-autoloader --no-interaction", remotePath)
	output, err = d.ExecuteCommand(composerCmd)
	if err != nil {
		log.Printf("⚠️  Composer install warning: %v\n", err)
		// Don't fail deployment if composer has warnings
	} else {
		log.Println("✅ Composer dependencies installed")
	}

	// 3. Run database migrations
	log.Println("🗄️  Running database migrations...")
	migrateCmd := fmt.Sprintf("cd %s && php artisan migrate --force", remotePath)
	output, err = d.ExecuteCommand(migrateCmd)
	if err != nil {
		log.Printf("⚠️  Migration warning: %v\n", err)
		// Don't fail if migrations have warnings
	} else {
		log.Println("✅ Migrations completed")
	}

	// 4. Clear and cache config
	log.Println("🔧 Caching configuration...")
	cacheCmd := fmt.Sprintf("cd %s && php artisan config:cache && php artisan route:cache && php artisan view:cache", remotePath)
	output, err = d.ExecuteCommand(cacheCmd)
	if err != nil {
		log.Printf("⚠️  Cache warning: %v\n", err)
	} else {
		log.Println("✅ Configuration cached")
	}

	// 5. Set permissions
	log.Println("🔒 Setting permissions...")
	permCmd := fmt.Sprintf("cd %s && chmod -R 755 storage bootstrap/cache", remotePath)
	output, err = d.ExecuteCommand(permCmd)
	if err != nil {
		log.Printf("⚠️  Permission warning: %v\n", err)
	} else {
		log.Println("✅ Permissions set")
	}

	// 6. Handle Public Path Symlinking
	if publicPath != "" && publicPath != remotePath {
		log.Printf("🔗 Linking public folder to: %s\n", publicPath)

		// If it's a directory (not a link), back it up instead of deleting
		backupCmd := fmt.Sprintf("[ -d %[1]s ] && [ ! -L %[1]s ] && mv %[1]s %[1]s_backup_$(date +%%Y%%m%%d%%H%%M%%S) || rm -rf %[1]s", publicPath)
		d.ExecuteCommand(backupCmd)

		// Create symlink
		linkCmd := fmt.Sprintf("ln -s %[1]s/public %[2]s", remotePath, publicPath)
		output, err = d.ExecuteCommand(linkCmd)
		if err != nil {
			log.Printf("⚠️  Symlink warning: %v\n", err)
		} else {
			log.Println("✅ Public folder linked successfully")
		}
	}

	log.Println("✅ Git Pull deployment completed successfully!")
	return nil
}

// TestConnection tests the SSH connection
func (d *SSHDeployer) TestConnection() error {
	output, err := d.ExecuteCommand("echo 'SSH test successful' && pwd")
	if err != nil {
		return err
	}
	log.Printf("✅ SSH test output: %s\n", strings.TrimSpace(output))
	return nil
}

// WriteFile writes content to a remote file
func (d *SSHDeployer) WriteFile(remotePath, content string) error {
	session, err := d.client.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	defer session.Close()

	stdin, err := session.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdin: %w", err)
	}

	go func() {
		defer stdin.Close()
		io.WriteString(stdin, content)
	}()

	cmd := fmt.Sprintf("cat > %s", remotePath)
	if err := session.Run(cmd); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}
