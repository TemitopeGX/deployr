# Update Project SSH Config
. .\test-tokens.ps1

$password = Read-Host "Enter cPanel password for bismsjai@198.187.29.126" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$headers = @{Authorization = "Bearer $env:API_TOKEN" }
$body = @{
    ssh_host     = '198.187.29.126'
    ssh_port     = '21098'
    ssh_user     = 'bismsjai'
    ssh_password = $plainPassword
    remote_path  = '/home/bismsjai/public_html/deployr-test'
    target       = 'cpanel'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:8000/api/projects/3' -Method PUT -Headers $headers -Body $body -ContentType 'application/json'

Write-Host "✅ Project SSH configuration updated!" -ForegroundColor Green
