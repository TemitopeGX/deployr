package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	log.Println("🧪 Testing SSH Deployment to cPanel...")
	log.Println("")

	// Configure SSH connection
	sshConfig := SSHConfig{
		Host:     "198.187.29.126",
		Port:     "21098",
		User:     "bismsjai",
		Password: os.Getenv("CPANEL_PASSWORD"), // Set this via environment variable
		KeyPath:  "",                           // Or use SSH key path
	}

	// Create SSH deployer
	deployer := NewSSHDeployer(sshConfig)

	// Connect
	log.Println("🔌 Connecting to cPanel via SSH...")
	if err := deployer.Connect(); err != nil {
		log.Fatalf("❌ Failed to connect: %v", err)
	}
	defer deployer.Close()

	// Test connection
	log.Println("🧪 Testing connection...")
	if err := deployer.TestConnection(); err != nil {
		log.Fatalf("❌ Connection test failed: %v", err)
	}

	// Deploy via Git Pull
	remotePath := "/home/bismsjai/public_html/deployr-test"
	branch := "master"

	log.Println("")
	log.Printf("🚀 Deploying to: %s\n", remotePath)
	log.Printf("📌 Branch: %s\n", branch)
	log.Println("")

	if err := deployer.DeployViaGitPull(remotePath, branch); err != nil {
		log.Fatalf("❌ Deployment failed: %v", err)
	}

	log.Println("")
	log.Println("🎉 Deployment completed successfully!")
	fmt.Println("")
	fmt.Println("✅ SSH deployment test passed!")
	fmt.Println("✅ The runner can now deploy to cPanel via Git Pull!")
}
