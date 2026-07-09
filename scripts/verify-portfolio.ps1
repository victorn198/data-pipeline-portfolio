[CmdletBinding()]
param(
    [switch]$IncludeWarehouse
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$pythonExe = Join-Path $repoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

function Invoke-QualityCheck {
    param([string]$Description, [scriptblock]$Command)

    Write-Host "`n==> $Description" -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Description failed with exit code $LASTEXITCODE."
    }
}

Invoke-QualityCheck "Running Python tests" { & $pythonExe -m pytest tests }
Invoke-QualityCheck "Checking dashboard JavaScript" { node --check nextgen_dashboard/frontend/app.js }
Invoke-QualityCheck "Auditing dashboard metrics" { & $pythonExe scripts/audit_dashboard_metrics.py --summary-only }
Invoke-QualityCheck "Benchmarking dashboard routes" { & $pythonExe scripts/benchmark_dashboard.py --threshold-seconds 1.50 }

if ($IncludeWarehouse) {
    if (-not (Test-Path "dbtproject/profiles.yml")) {
        throw "dbtproject/profiles.yml is missing. Run scripts/run-demo.ps1 first."
    }
    $dbtExe = Join-Path $repoRoot ".venv\Scripts\dbt.exe"
    if (-not (Test-Path $dbtExe)) {
        throw ".venv is missing dbt. Run scripts/run-demo.ps1 first."
    }
    Push-Location "dbtproject"
    try {
        $env:DBT_PROFILES_DIR = (Get-Location).Path
        Invoke-QualityCheck "Running dbt tests" { & $dbtExe test }
    }
    finally {
        Pop-Location
    }
}

Write-Host "`nPortfolio verification passed." -ForegroundColor Green
