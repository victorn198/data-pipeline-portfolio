# Open Source Data Engineering Landscape

Portfolio project that turns live GitHub API data into a governed PostgreSQL
dataset and a reproducible Power BI report.

![Power BI report](powerbi/screenshots/landscape-overview-final.png)

## Architecture

```text
GitHub Search API -> Python ingestion -> PostgreSQL -> analytical SQL view -> Power BI
```

The default query collects the 100 most relevant public repositories for
`topic:data-engineering stars:>100`. The report exposes the collected evidence,
not manually entered KPI values.

## What it demonstrates

- REST API ingestion with pagination and optional token authentication;
- idempotent raw-data loading into PostgreSQL;
- a typed analytical view with repository, owner, activity and engagement data;
- reusable DAX measures and a source-controlled PBIP/PBIR report;
- SQL checks that reconcile the report indicators with the database.

## Run everything

Requirements: Python, Node.js, PostgreSQL binaries and Power BI Desktop.

```powershell
cd .\powerbi-api-portfolio
Copy-Item .env.example .env
.\scripts\run-all.ps1
```

The script creates a local Python environment and an isolated PostgreSQL data
directory inside this project, loads the API data, builds the analytical view,
generates and validates the PBIP project, then opens it in Power BI Desktop.

On the first refresh, use the local development credentials from `.env`. The
example defaults are `postgres` / `postgres`. Accept an unencrypted connection
only for this isolated localhost instance.

To rebuild without reinstalling Python packages or opening Desktop:

```powershell
.\scripts\run-all.ps1 -SkipInstall -NoOpen
```

## Project map

```text
_brief/report-spec.md             report scope and design contract
powerbi/OpenSourceLandscape/      source-controlled PBIP project
powerbi/screenshots/              verified report preview
scripts/run-all.ps1               one-command orchestration
scripts/generate_pbip.mjs         deterministic PBIP generator
src/ingest_github.py              GitHub API ingestion
sql/001_schema.sql                database schema
sql/002_powerbi_view.sql          analytical view
sql/003_validation_queries.sql    KPI reconciliation checks
```

## Power BI source

- Server: `127.0.0.1:5434`
- Database: `github_bi`
- View: `mart.vw_powerbi_repositories`

Configure `GITHUB_QUERY` in `.env` to research another public software market.
A `GITHUB_TOKEN` is optional but increases the API rate limit.
