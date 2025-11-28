<#
Synthetic Booking Test (Trip Service) - PowerShell

Usage:
  .\synthetic-booking-test.ps1 -Count 50 -IntervalSeconds 0.1

This script simulates booking requests to the trip-service /trips endpoint.
It measures success rate, latencies (p50, p95, avg), and exports results to CSV.
#>

param(
    [int]$Count = 50,
    [double]$IntervalSeconds = 0.1,
    [string]$Url = 'http://localhost:8082/trips',
    [int]$TimeoutSeconds = 10
)

$headers = @{ 'Content-Type' = 'application/json' }
$results = @()

Write-Host "Running synthetic booking test: Count=$Count, IntervalSeconds=$IntervalSeconds, Url=$Url" -ForegroundColor Cyan

for ($i = 1; $i -le $Count; $i++) {
    $bodyObj = @{
        pickup_lat = 10.7769 + (Get-Random -Minimum -1 -Maximum 1)
        pickup_lng = 106.7009 + (Get-Random -Minimum -1 -Maximum 1)
        dropoff_lat = 10.7769 + (Get-Random -Minimum -1 -Maximum 1)
        dropoff_lng = 106.7009 + (Get-Random -Minimum -1 -Maximum 1)
        userId = Get-Random -Minimum 1 -Maximum 100
    }
    $body = $bodyObj | ConvertTo-Json

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $resp = Invoke-RestMethod -Uri $Url -Method Post -Headers $headers -Body $body -TimeoutSec $TimeoutSeconds
        $sw.Stop()
        $results += [pscustomobject]@{
            Index = $i
            Success = $true
            DurationMs = $sw.ElapsedMilliseconds
            Status = if ($resp -is [string]) { $resp } else { ($resp | ConvertTo-Json -Compress) }
            Error = $null
        }
        Write-Host "[$i] OK ${($sw.ElapsedMilliseconds)}ms" -ForegroundColor Green
    }
    catch {
        $sw.Stop()
        $errText = $_ | Out-String
        $results += [pscustomobject]@{
            Index = $i
            Success = $false
            DurationMs = $sw.ElapsedMilliseconds
            Status = $null
            Error = $errText.Trim()
        }
        Write-Host "[$i] FAIL ${($sw.ElapsedMilliseconds)}ms" -ForegroundColor Red
    }

    if ($i -lt $Count) {
        Start-Sleep -Seconds $IntervalSeconds
    }
}

# Summary
$total = $results.Count
$successCount = ($results | Where-Object { $_.Success }).Count
$failCount = $total - $successCount
$successRate = [math]::Round(($successCount / $total) * 100, 2)

$successDurations = $results | Where-Object { $_.Success } | Select-Object -ExpandProperty DurationMs

if ($successDurations.Count -gt 0) {
    $avg = [math]::Round(($successDurations | Measure-Object -Average).Average, 2)
    $sorted = $successDurations | Sort-Object
    $n = $sorted.Count
    $p50idx = [math]::Max([math]::Ceiling(0.5 * $n) - 1, 0)
    $p95idx = [math]::Max([math]::Ceiling(0.95 * $n) - 1, 0)
    $p50 = $sorted[$p50idx]
    $p95 = $sorted[$p95idx]
} else {
    $avg = $null
    $p50 = $null
    $p95 = $null
}

Write-Host "`n=== Synthetic Booking Test Summary ===" -ForegroundColor Cyan
Write-Host "Total requests: $total"
Write-Host "Success: $successCount, Fail: $failCount, SuccessRate: $successRate%"
if ($avg -ne $null) {
    Write-Host "Avg Duration (ms): $avg"
    Write-Host "p50 Duration (ms): $p50"
    Write-Host "p95 Duration (ms): $p95"
}

# Export results to CSV
$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$csvPath = "synthetic-booking-results-$timestamp.csv"
$results | Export-Csv -Path $csvPath -NoTypeInformation | Out-Null
Write-Host "Detailed results exported to $csvPath"
