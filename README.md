# Data Pipeline Portfolio

![Social preview](./assets/social-preview.png)

Desktop-first analytics engineering portfolio built with `Python`,
`PostgreSQL`, `dbt`, `FastAPI`, and a custom BI product layer.

This repository is meant to be read like a case study. It shows the full
analytics lifecycle: ingestion, warehouse modeling, tests, monitoring,
semantic definitions, API delivery, and an interactive analytics interface.

## TL;DR

- `100,000+` simulated order lines across `10,000` customers and `2,000` products
- `dbt` warehouse with marts, tests, and snapshot modeling
- FastAPI analytics backend plus a desktop-style BI interface
- business analysis methods beyond topline dashboards:
  - Pareto / `ABC`
  - `RFM`
  - retention cohorts
  - anomaly and structural shift detection
  - forecast scenarios
- product-style investigation features:
  - `Data Center`
  - `Spotlight`
  - `Compare`
  - `Bookmarks`
  - `Recent`
  - `Action Board`
- source reliability view:
  - in-app source selection and local CSV/JSON preview
  - automatic file profiling, dataset classification, mapping suggestions, and an isolated `Imported Dataset` preview window
  - latest registered source loads
  - duplicate-key and null profiling
  - batch metadata surfaced in the analytics desktop
- account health view:
  - CRM, billing, support, and ecommerce signals joined into one mart
  - governed watchlist for risk tier, open tickets, and outstanding balance

## What This Repository Demonstrates

- ingestion into a `raw` layer
- registered CSV/JSON/API-style source ingestion with load metadata and profiling
- no-code local file intake in the app: CSV/JSON parsing, column profiling, suggested mappings, and preview analysis before governed promotion
- warehouse modeling with `dbt`
- data quality testing and monitoring objects
- semantic KPI definitions for BI
- API-first analytics delivery
- a desktop-first analytics UX instead of a static dashboard

## Gallery

<img src="./assets/gallery/nextgen-demo.gif" alt="Short NextGen analytics desktop demo" width="900">

Interactive recording file: [nextgen-demo.webm](./assets/gallery/nextgen-demo.webm)

<img src="./assets/gallery/desktop-home-compact.png" alt="NextGen desktop analytics shell in a compact browser viewport" width="900">

<img src="./assets/gallery/desktop-workflow.png" alt="Layered investigation workflow with Sales Overview, Predictive Outlook, and Account Health" width="900">

<img src="./assets/gallery/desktop-source-health.png" alt="Source Health registered-source quality and load monitoring view" width="900">

<img src="./assets/gallery/desktop-account-health.png" alt="Account Health multi-source operations view inside the desktop analytics shell" width="900">

Account Health case:

- [Account Health Case Study](./docs/ACCOUNT_HEALTH_CASE_STUDY.md)
- [Portfolio Application Material](./docs/APPLICATION_MATERIAL.md)
- [Demo Script](./docs/DEMO_SCRIPT.md)
- dbt mart: `dbtproject/models/marts/mart_account_health.sql`
- API endpoint: `GET /api/account-health`

## Architecture

<img src="./assets/diagrams/architecture-overview.png" alt="NextGen analytics architecture overview" width="900">

## Warehouse View

<img src="./assets/diagrams/warehouse-model.png" alt="Warehouse model and database layers derived from the repository structure" width="900">

The warehouse visual above is repository-derived, not a live PostgreSQL GUI
capture. That choice keeps the structure visible even when the local database
is offline.

## Analytics Methods Included

- aligned period-over-period comparisons
- Pareto and `ABC` concentration analysis
- `RFM` customer segmentation
- retention cohort analysis
- anomaly and structural shift detection
- predictive scenarios: `Base`, `Conservative`, `Upside`
- drilldowns from business slice to underlying members

## Product Features Included

- desktop-style navigation with windows and taskbar
- `Data Center` window with a connector library, source toggles, connection drafts, and no-code local CSV/JSON import analysis
- `Imported Dataset` preview window with quality cards, suggested mapping, auto view, column profile, and sample rows isolated from official KPIs
- `Spotlight` windows with local filters and frozen context
- `Compare` windows for side-by-side investigation
- `Bookmarks` to restore saved workspaces
- `Recent` activity and `Action Board`
- CSV export from detail and comparison views
- window design themes inside the desktop shell
- `Source Health` window for registered-source audit and profiling results
- `Account Health` window for company operations and customer risk follow-up

## Quick Start

### Prerequisites

- Python `3.10+`
- Docker Desktop or local PostgreSQL

### Run locally

```bash
docker compose up -d
cp .env.example .env
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
python -m pip install --upgrade pip setuptools
pip install -r requirements.txt -c constraints.txt
python scripts/loadsampledata.py --mode full_refresh
python scripts/load_registered_sources.py
cd dbtproject
dbt deps
dbt run --full-refresh
dbt snapshot
dbt test
cd ..
uvicorn nextgen_dashboard.backend.main:app --reload --port 8601
```

Open `http://127.0.0.1:8601`

## Quality and Security

```bash
python -m pip install --upgrade pip setuptools
pip install -r requirements.txt -c constraints.txt
pytest tests/test_nextgen_dashboard_api.py
python scripts/benchmark_dashboard.py --threshold-seconds 1.50
```

Current hardening in the repo:

- explicit CORS origins
- agent mutations disabled by default
- token-gated mutations when enabled
- static asset allowlist
- atomic local writes for governed state

See:

- [AI Agent Security](./docs/AI_AGENT_SECURITY.md)
- [Quality Gates](./docs/QUALITY_GATES.md)
- [SECURITY.md](./SECURITY.md)

## AI Collaboration

I used AI during implementation and review, and I keep that explicit.

AI helped with:

- repetitive implementation work
- UI iteration
- refactoring and cleanup
- test expansion
- documentation drafting
- security review support

AI did not own product direction, business framing, acceptance criteria, or
final review. Those decisions remained manual.

More detail: [AI Collaboration Disclosure](./docs/AI_COLLABORATION_DISCLOSURE.md)

## Repository Guide

- `fivetran_simulator/`: ingestion simulators and scaled sample generation
- `fivetran_simulator/source_registry.yml`: governed file-source contracts
- `dbtproject/models/`: warehouse transformations
- `dbtproject/tests/`: SQL quality checks
- `nextgen_dashboard/`: FastAPI backend and desktop-first frontend
- `scripts/setup_*.sql`: monitoring and operational SQL objects
- `scripts/benchmark_dashboard.py`: dashboard performance regression check
- `assets/gallery/`: real project screenshots and demo captures
- `assets/diagrams/`: architecture and warehouse visuals

## Useful Docs

- [GitHub Repository Setup](./docs/GITHUB_REPOSITORY_SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Data Lineage](./docs/DATA_LINEAGE.md)
- [Multi-Source Analytics Roadmap](./docs/MULTI_SOURCE_ANALYTICS_ROADMAP.md)
- [Business Source Decision](./docs/BUSINESS_SOURCE_DECISION.md)
- [dbt Models](./docs/DBT_MODELS.md)
- [Measure Dictionary](./docs/MEASURE_DICTIONARY.md)
- [Predictive Outlook Method](./docs/PREDICTIVE_OUTLOOK_METHOD.md)
- [Statistical Analytics Stack](./docs/STATISTICAL_ANALYTICS_STACK.md)
- [Project Interview Narrative](./docs/PROJECT_INTERVIEW_NARRATIVE.md)
- [Recruiter Review](./docs/RECRUITER_REVIEW.md)
- [LinkedIn and GitHub Copy](./docs/LINKEDIN_PROJECT_COPY.md)
