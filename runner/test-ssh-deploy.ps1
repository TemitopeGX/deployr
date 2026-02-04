# Test SSH Deployment to cPanel

Write-Host "🧪 Testing SSH Deployment to cPanel" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Get cPanel password
$password = Read-Host "Enter cPanel password for bismsjai@198.187.29.126" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
$env:CPANEL_PASSWORD = $plainPassword

Write-Host ""
Write-Host "🔨 Building SSH test..." -ForegroundColor Cyan
go build -o test-ssh.exe test_ssh.go ssh_deployer.go

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Running SSH deployment test..." -ForegroundColor Cyan
Write-Host ""

.\test-ssh.exe

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Green
