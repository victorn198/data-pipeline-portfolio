[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

& "$PSScriptRoot\setup.ps1" -SkipInstall:$SkipInstall
if ($LASTEXITCODE -ne 0) { throw "Data pipeline failed." }

node "scripts\generate_pbip.mjs"
if ($LASTEXITCODE -ne 0) { throw "PBIP generation failed." }

$reportPath = "powerbi\OpenSourceLandscape\OpenSourceLandscape.Report"
if (Get-Command powerbi-report-author -ErrorAction SilentlyContinue) {
    & powerbi-report-author validate $reportPath
    if ($LASTEXITCODE -ne 0) { throw "PBIR validation failed." }
}

if (-not $NoOpen) {
    $pbipPath = "powerbi\OpenSourceLandscape\OpenSourceLandscape.pbip"
    if (Get-Command powerbi-desktop -ErrorAction SilentlyContinue) {
        & powerbi-desktop open $pbipPath --timeout 120
    }
    else {
        Start-Process $pbipPath
    }
}

Write-Host "`nPortfolio pipeline completed." -ForegroundColor Green
