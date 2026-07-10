[CmdletBinding()]
param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop is required and must be running."
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python is required and must be available as 'python'."
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env. Review GITHUB_OWNER before continuing." -ForegroundColor Yellow
}

$pythonExe = Join-Path $repoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    python -m venv .venv
}
if (-not $SkipInstall) {
    & $pythonExe -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "Python dependency installation failed." }
}

docker compose up -d
if ($LASTEXITCODE -ne 0) { throw "PostgreSQL could not be started." }

Get-Content "sql\001_schema.sql" | docker compose exec -T postgres psql -U postgres -d github_bi
if ($LASTEXITCODE -ne 0) { throw "Schema creation failed." }

& $pythonExe "src\ingest_github.py"
if ($LASTEXITCODE -ne 0) { throw "GitHub API ingestion failed." }

Get-Content "sql\002_powerbi_view.sql" | docker compose exec -T postgres psql -U postgres -d github_bi
if ($LASTEXITCODE -ne 0) { throw "Power BI view creation failed." }

Write-Host "`nReady. Connect Power BI to localhost:5434, database github_bi, view mart.vw_powerbi_repositories." -ForegroundColor Green
