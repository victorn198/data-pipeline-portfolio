[CmdletBinding()]
param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python is required and must be available as 'python'."
}
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

$config = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        $config[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$postgresPort = $config["POSTGRES_PORT"]
$postgresDatabase = $config["POSTGRES_DB"]
$postgresUser = $config["POSTGRES_USER"]
$postgresPassword = $config["POSTGRES_PASSWORD"]
$postgresBinCandidates = @(
    if (Get-Command pg_ctl -ErrorAction SilentlyContinue) {
        Split-Path -Parent (Get-Command pg_ctl).Source
    }
    "E:\PostgreSQL\bin",
    "D:\PostgreSQL\16\bin"
)
$postgresBin = $postgresBinCandidates |
    Where-Object { Test-Path (Join-Path $_ "pg_ctl.exe") } |
    Select-Object -First 1
if (-not $postgresBin) {
    throw "PostgreSQL binaries were not found. Add its bin directory to PATH."
}

$pythonExe = Join-Path $repoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    python -m venv .venv
}
if (-not $SkipInstall) {
    & $pythonExe -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "Python dependency installation failed." }
}

$dataDir = Join-Path $repoRoot ".postgres-data"
$passwordFile = Join-Path $repoRoot ".postgres-password"
$pgCtl = Join-Path $postgresBin "pg_ctl.exe"
$initDb = Join-Path $postgresBin "initdb.exe"
$psql = Join-Path $postgresBin "psql.exe"
$createdb = Join-Path $postgresBin "createdb.exe"

if (-not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
    Set-Content -Path $passwordFile -Value $postgresPassword -NoNewline
    try {
        & $initDb -D $dataDir -U $postgresUser --pwfile=$passwordFile --auth=scram-sha-256 --encoding=UTF8
        if ($LASTEXITCODE -ne 0) { throw "Local PostgreSQL initialization failed." }
    }
    finally {
        Remove-Item $passwordFile -ErrorAction SilentlyContinue
    }
}

& $pgCtl status -D $dataDir *> $null
if ($LASTEXITCODE -ne 0) {
    & $pgCtl start -D $dataDir -l (Join-Path $repoRoot ".postgres.log") -o "-p $postgresPort"
    if ($LASTEXITCODE -ne 0) { throw "Local PostgreSQL startup failed." }
}

$env:PGPASSWORD = $postgresPassword
& $psql -h localhost -p $postgresPort -U $postgresUser -d postgres -tAc "select 1 from pg_database where datname='$postgresDatabase'" | ForEach-Object {
    $databaseExists = $_.Trim() -eq "1"
}
if (-not $databaseExists) {
    & $createdb -h localhost -p $postgresPort -U $postgresUser $postgresDatabase
    if ($LASTEXITCODE -ne 0) { throw "Database creation failed." }
}

& $psql -h localhost -p $postgresPort -U $postgresUser -d $postgresDatabase -v ON_ERROR_STOP=1 -f "sql\001_schema.sql"
if ($LASTEXITCODE -ne 0) { throw "Schema creation failed." }

& $pythonExe "src\ingest_github.py"
if ($LASTEXITCODE -ne 0) { throw "GitHub API ingestion failed." }

& $psql -h localhost -p $postgresPort -U $postgresUser -d $postgresDatabase -v ON_ERROR_STOP=1 -f "sql\002_powerbi_view.sql"
if ($LASTEXITCODE -ne 0) { throw "Power BI view creation failed." }

& $psql -h localhost -p $postgresPort -U $postgresUser -d $postgresDatabase -f "sql\003_validation_queries.sql"

Write-Host "`nReady. Power BI connection: 127.0.0.1:$postgresPort / $postgresDatabase / mart.vw_powerbi_repositories" -ForegroundColor Green
