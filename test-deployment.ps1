# Deployr Runner - Complete Test Script
# This script tests the entire deployment workflow

Write-Host "🚀 Deployr Runner - Complete Test" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Step 1: Register user (or use existing)
Write-Host "Step 1: Setting up user..." -ForegroundColor Cyan
$body = '{"name":"Test User","email":"testuser@example.com","password":"password123"}'
try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/auth/register' -Method POST -Body $body -ContentType 'application/json' -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    $env:API_TOKEN = $json.api_token
    Write-Host "✅ User registered successfully!" -ForegroundColor Green
}
catch {
    # User might already exist, try login
    Write-Host "⚠️  User exists, trying login..." -ForegroundColor Yellow
    $loginBody = '{"email":"testuser@example.com","password":"password123"}'
    $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json'
    $json = $response.Content | ConvertFrom-Json
    $env:API_TOKEN = $json.api_token
    Write-Host "✅ Logged in successfully!" -ForegroundColor Green
}

Write-Host "   Token: $($env:API_TOKEN.Substring(0,20))..." -ForegroundColor White
Write-Host ""

# Step 2: Create project
Write-Host "Step 2: Creating project..." -ForegroundColor Cyan
$headers = @{Authorization = "Bearer $env:API_TOKEN" }
$projectBody = '{"name":"Laravel Demo","repo_url":"https://github.com/laravel/laravel","framework":"laravel","target":"vps"}'
$response = Invoke-WebRequest -Uri 'http://localhost:8000/api/projects' -Method POST -Headers $headers -Body $projectBody -ContentType 'application/json'
$json = $response.Content | ConvertFrom-Json
$projectId = $json.project.id
Write-Host "✅ Project created: $($json.project.name) (ID: $projectId)" -ForegroundColor Green
Write-Host ""

# Step 3: Register runner
Write-Host "Step 3: Registering runner..." -ForegroundColor Cyan
$runnerBody = '{"name":"Test Runner"}'
$response = Invoke-WebRequest -Uri 'http://localhost:8000/api/runners' -Method POST -Headers $headers -Body $runnerBody -ContentType 'application/json'
$json = $response.Content | ConvertFrom-Json
$env:DEPLOYR_RUNNER_TOKEN = $json.token
Write-Host "✅ Runner registered: $($json.runner.name)" -ForegroundColor Green
Write-Host "   Token: $($env:DEPLOYR_RUNNER_TOKEN.Substring(0,20))..." -ForegroundColor White
Write-Host ""

# Step 4: Set runner environment variables
Write-Host "Step 4: Configuring runner..." -ForegroundColor Cyan
$env:DEPLOYR_BACKEND_URL = "http://localhost:8000"
$env:DEPLOYR_WORK_DIR = "./deployments"
Write-Host "✅ Runner configured" -ForegroundColor Green
Write-Host "   Backend URL: $env:DEPLOYR_BACKEND_URL" -ForegroundColor White
Write-Host "   Work Dir: $env:DEPLOYR_WORK_DIR" -ForegroundColor White
Write-Host ""

# Step 5: Create deployment job
Write-Host "Step 5: Creating deployment job..." -ForegroundColor Cyan
$jobBody = "{`"project_id`":$projectId,`"branch`":`"main`"}"
$response = Invoke-WebRequest -Uri 'http://localhost:8000/api/jobs' -Method POST -Headers $headers -Body $jobBody -ContentType 'application/json'
$json = $response.Content | ConvertFrom-Json
$jobId = $json.job.id
Write-Host "✅ Deployment job created!" -ForegroundColor Green
Write-Host "   Job ID: $jobId" -ForegroundColor White
Write-Host "   Status: $($json.job.status)" -ForegroundColor White
Write-Host ""

# Step 6: Instructions to start runner
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Now start the runner in a NEW terminal:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   cd runner" -ForegroundColor White
Write-Host "   .\deployr-runner.exe" -ForegroundColor White
Write-Host ""
Write-Host "Or use the start script:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   cd runner" -ForegroundColor White
Write-Host "   .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "The runner will:" -ForegroundColor Yellow
Write-Host "  1. Find the job (ID: $jobId)" -ForegroundColor White
Write-Host "  2. Clone the Laravel repository" -ForegroundColor White
Write-Host "  3. Detect it's a Laravel project" -ForegroundColor White
Write-Host "  4. Run composer install (if composer is available)" -ForegroundColor White
Write-Host "  5. Report completion" -ForegroundColor White
Write-Host ""
Write-Host "Watch the runner output for real-time progress!" -ForegroundColor Green
Write-Host ""

# Save tokens to file for easy access
$tokens = @"
# Deployr Test Tokens
# Generated: $(Get-Date)

`$env:API_TOKEN = "$env:API_TOKEN"
`$env:DEPLOYR_RUNNER_TOKEN = "$env:DEPLOYR_RUNNER_TOKEN"
`$env:DEPLOYR_BACKEND_URL = "$env:DEPLOYR_BACKEND_URL"
`$env:DEPLOYR_WORK_DIR = "$env:DEPLOYR_WORK_DIR"

# Project ID: $projectId
# Job ID: $jobId
"@

$tokens | Out-File -FilePath "test-tokens.ps1" -Encoding UTF8
Write-Host "💾 Tokens saved to: test-tokens.ps1" -ForegroundColor Cyan
Write-Host ""
