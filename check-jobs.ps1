# Check job status
. .\test-tokens.ps1

Write-Host "🔍 Checking job status..." -ForegroundColor Cyan
Write-Host ""

$headers = @{Authorization = "Bearer $env:API_TOKEN" }

# Get all jobs
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/jobs" -Method GET -Headers $headers
$json = $response.Content | ConvertFrom-Json

Write-Host "📊 Jobs in database:" -ForegroundColor Green
$json.jobs | ForEach-Object {
    Write-Host "  Job #$($_.id):" -ForegroundColor White
    Write-Host "    Status: $($_.status)" -ForegroundColor $(if ($_.status -eq 'queued') { 'Yellow' } elseif ($_.status -eq 'completed') { 'Green' } else { 'Cyan' })
    Write-Host "    Project: $($_.project.name)" -ForegroundColor White
    Write-Host "    Runner: $(if ($_.runner_id) { $_.runner_id } else { 'Not assigned' })" -ForegroundColor White
    Write-Host ""
}

# Check if there are queued jobs
$queuedJobs = $json.jobs | Where-Object { $_.status -eq 'queued' -and $_.runner_id -eq $null }

if ($queuedJobs) {
    Write-Host "✅ Found $($queuedJobs.Count) queued job(s) ready for runner!" -ForegroundColor Green
    Write-Host "   The runner should pick it up within 5 seconds..." -ForegroundColor Yellow
}
else {
    Write-Host "⚠️  No queued jobs found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating a new job..." -ForegroundColor Cyan
    $jobBody = '{"project_id":3,"branch":"main"}'
    $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/jobs' -Method POST -Headers $headers -Body $jobBody -ContentType 'application/json'
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ New job created! Job ID: $($json.job.id)" -ForegroundColor Green
    Write-Host "   Status: $($json.job.status)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The runner should pick it up within 5 seconds!" -ForegroundColor Green
}
