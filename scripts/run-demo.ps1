[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8601,
    [switch]$SkipInstall,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Description,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Host "`n==> $Description" -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Description failed with exit code $LASTEXITCODE."
    }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop is required. Install it, start it, then run this script again."
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python 3.10 or newer is required and must be available as 'python'."
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example." -ForegroundColor DarkGray
}

if (-not (Test-Path "dbtproject/profiles.yml")) {
    Copy-Item "dbtproject/profiles.yml.example" "dbtproject/profiles.yml"
    Write-Host "Created dbtproject/profiles.yml from the versioned template." -ForegroundColor DarkGray
}

$pythonExe = Join-Path $repoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Invoke-Checked "Creating local Python environment" { python -m venv .venv }
}

if (-not $SkipInstall) {
    Invoke-Checked "Installing Python dependencies" {
        & $pythonExe -m pip install --upgrade pip setuptools
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        & $pythonExe -m pip install -r requirements.txt -c constraints.txt
    }
}

$dbtExe = Join-Path $repoRoot ".venv\Scripts\dbt.exe"
if (-not (Test-Path $dbtExe)) {
    throw "dbt is missing from .venv. Run without -SkipInstall to install it."
}

$dbtVersionOutput = & $pythonExe -c "from dbt.version import __version__; print(__version__)" 2>$null
$dbtVersion = if ($null -eq $dbtVersionOutput) { "" } else { ([string]$dbtVersionOutput).Trim() }
if ($LASTEXITCODE -ne 0 -or $dbtVersion -ne "1.10.22") {
    throw "dbt-core 1.10.22 is required. Run without -SkipInstall to align the local environment."
}

Invoke-Checked "Starting PostgreSQL" { docker compose up -d }

$databaseReady = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
    & docker compose exec -T postgres pg_isready -U postgres -d analytics *> $null
    if ($LASTEXITCODE -eq 0) {
        $databaseReady = $true
        break
    }
    Start-Sleep -Seconds 2
}
if (-not $databaseReady) {
    throw "PostgreSQL did not become ready. Run 'docker compose logs postgres' for details."
}

Invoke-Checked "Loading the public retail sample" {
    & $pythonExe scripts/loadsampledata.py --mode full_refresh
}
Invoke-Checked "Loading registered CRM, billing, support, and marketing fixtures" {
    & $pythonExe scripts/load_registered_sources.py
}

Push-Location "dbtproject"
try {
    $env:DBT_PROFILES_DIR = (Get-Location).Path
    Invoke-Checked "Installing dbt packages" { & $dbtExe deps }
    Invoke-Checked "Building warehouse models" { & $dbtExe run --full-refresh }
    Invoke-Checked "Refreshing customer snapshot" { & $dbtExe snapshot }
    Invoke-Checked "Running dbt quality tests" { & $dbtExe test }
}
finally {
    Pop-Location
}

$dashboardUrl = "http://127.0.0.1:$Port/?open=account_health&maximize=account_health&theme=desktop&guide=off"
Write-Host "`nDashboard ready at $dashboardUrl" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the local server. PostgreSQL remains available through Docker." -ForegroundColor DarkGray

if (-not $NoBrowser) {
    Start-Process $dashboardUrl
}

& $pythonExe -m uvicorn nextgen_dashboard.backend.main:app --host 127.0.0.1 --port $Port
