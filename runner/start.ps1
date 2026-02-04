# Load tokens from test
if (Test-Path "../test-tokens.ps1") {
    Write-Host "📥 Loading tokens from test-tokens.ps1..." -ForegroundColor Cyan
    . ../test-tokens.ps1
    Write-Host "✅ Tokens loaded!" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "❌ test-tokens.ps1 not found!" -ForegroundColor Red
    Write-Host "Run the test-deployment.ps1 script first:" -ForegroundColor Yellow
    Write-Host "   cd .." -ForegroundColor White
    Write-Host "   .\test-deployment.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Verify token is set
if (-not $env:DEPLOYR_RUNNER_TOKEN) {
    Write-Host "❌ DEPLOYR_RUNNER_TOKEN not set!" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Deployr Runner - Starting..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Backend URL: $env:DEPLOYR_BACKEND_URL" -ForegroundColor White
Write-Host "  Runner Token: $($env:DEPLOYR_RUNNER_TOKEN.Substring(0,20))..." -ForegroundColor White
Write-Host "  Work Dir: $env:DEPLOYR_WORK_DIR" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the runner
.\deployr-runner.exe
