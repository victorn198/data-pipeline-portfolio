# NextGen Dashboard

Custom analytics web app built on top of the project warehouse and metric layer.

## Why This Module Exists

The repository already includes dbt and a custom analytics backend, but this module pushes the
portfolio further by showing application-oriented analytics delivery:

- backend API design with FastAPI
- frontend state handling without Streamlit
- shared filters across multiple dashboard pages
- period-over-period KPI logic
- drilldown interactions for deeper analysis

## Stack

- `backend/`: FastAPI service layer
- `frontend/`: plain HTML, CSS, and JavaScript
- `repository.py`: filter and date-window orchestration
- `dashboard_service.py`: KPI and trend payload builders
- `data_source.py`: warehouse access and fallback handling

## Available Pages

- `Sales Overview`
- `Revenue Trends`
- `Customer Segmentation`
- `Product Performance`
- `Pipeline Operations`
- `Source Health`
- `Account Health`

## Current UX Features

- lateral navigation inside the app
- global filters for date range, category, city, and comparison granularity
- same-window versus previous-window comparisons
- sales drilldown: click a period to open daily comparison in place
- source health: inspect registered source loads, duplicate keys, null counts,
  and batch metadata
- account health: inspect CRM account ownership, billing risk, support pressure,
  ecommerce activity, health tiers, risk drivers, and operational watchlist
  priority
- no Streamlit dependency

## Run

From repository root:

```bash
uvicorn nextgen_dashboard.backend.main:app --reload --port 8601
```

Open `http://127.0.0.1:8601`

## Test

```bash
pytest tests/test_nextgen_dashboard_api.py
```

## Endpoints

- `GET /api/health`
- `GET /api/meta/filters`
- `GET /api/dashboard?page=sales|revenue|customers|products|operations`
- `GET /api/dashboard?page=sales&granularity=Month&drilldown_period_key=2026-03`
- `GET /api/revenue?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&granularity=Month`
- `GET /api/source-health`
- `GET /api/account-health`

Optional repeated query params:

- `categories=electronics&categories=jewelery`
- `cities=New York`

## What This Adds To The Portfolio

This module shows that the project is not limited to warehouse modeling. It
also demonstrates API design, frontend integration, reusable analytics logic,
and a migration path away from low-code dashboard frameworks.
