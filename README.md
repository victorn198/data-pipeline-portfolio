# Data Pipeline Portfolio

![Social preview](./assets/social-preview.png)

Desktop-first analytics engineering portfolio built with `Python`,
`PostgreSQL`, `dbt`, `FastAPI`, `Power BI`, and a custom BI product layer.

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
  - `Spotlight`
  - `Compare`
  - `Bookmarks`
  - `Recent`
  - `Action Board`

## What This Repository Demonstrates

- ingestion into a `raw` layer
- warehouse modeling with `dbt`
- data quality testing and monitoring objects
- semantic KPI definitions for BI
- API-first analytics delivery
- a desktop-first analytics UX instead of a static dashboard

## Gallery

<img src="./assets/gallery/desktop-home.png" alt="NextGen desktop analytics shell" width="900">

<img src="./assets/gallery/desktop-sales-predictive.png" alt="Sales Overview and Predictive Outlook inside the desktop analytics shell" width="900">

<img src="./assets/gallery/desktop-products-retention.png" alt="Product Performance and Retention Cohorts inside the desktop analytics shell" width="900">

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
- `Spotlight` windows with local filters and frozen context
- `Compare` windows for side-by-side investigation
- `Bookmarks` to restore saved workspaces
- `Recent` activity and `Action Board`
- CSV export from detail and comparison views
- window design themes inside the desktop shell

## Quick Start

### Prerequisites

- Python `3.10+`
- Docker Desktop or local PostgreSQL
- Power BI Desktop (optional)

### Run locally

```bash
docker compose up -d
cp .env.example .env
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/loadsampledata.py --mode full_refresh
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
- `dbtproject/models/`: warehouse transformations
- `dbtproject/tests/`: SQL quality checks
- `nextgen_dashboard/`: FastAPI backend and desktop-first frontend
- `scripts/setup_*.sql`: monitoring and operational SQL objects
- `scripts/benchmark_dashboard.py`: dashboard performance regression check
- `assets/gallery/`: real project screenshots
- `assets/diagrams/`: architecture and warehouse visuals

## Useful Docs

- [GitHub Repository Setup](./docs/GITHUB_REPOSITORY_SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Data Lineage](./docs/DATA_LINEAGE.md)
- [dbt Models](./docs/DBT_MODELS.md)
- [Measure Dictionary](./docs/MEASURE_DICTIONARY.md)
- [Predictive Outlook Method](./docs/PREDICTIVE_OUTLOOK_METHOD.md)
- [Statistical Analytics Stack](./docs/STATISTICAL_ANALYTICS_STACK.md)
- [Project Interview Narrative](./docs/PROJECT_INTERVIEW_NARRATIVE.md)
- [Recruiter Review](./docs/RECRUITER_REVIEW.md)
- [LinkedIn and GitHub Copy](./docs/LINKEDIN_PROJECT_COPY.md)
