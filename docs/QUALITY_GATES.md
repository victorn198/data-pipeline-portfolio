# Quality Gates

These gates keep the dashboard explainable, fast, and safe enough to present as
portfolio work.

## 1. API and Semantic Validation

Run:

```powershell
python -m pytest tests/test_nextgen_dashboard_api.py
```

This covers:

- root and health endpoints
- filter metadata
- semantic layer exposure
- all dashboard pages
- proposal workflow
- governed drilldowns

## 2. Frontend Syntax

Run:

```powershell
node --check nextgen_dashboard/frontend/app.js
```

This is the minimum guard for JS changes.

## 3. Dashboard Metric Audit

Run:

```powershell
python scripts/audit_dashboard_metrics.py --summary-only
```

This audit cross-checks KPI math and payload consistency across:

- default monthly and quarterly contexts
- recent 90-day daily context
- top category, city, and combined slices
- predictive scenario ordering and forecast bands
- retention cohort invariants

It exits non-zero when any contract breaks, so it is safe to use in CI.

## 4. Dashboard Benchmark

Run:

```powershell
python scripts/benchmark_dashboard.py --threshold-seconds 1.50
```

The benchmark uses FastAPI `TestClient`, a realistic default date window, and a
warm-cache median to catch regressions in interactive routes.

By default it measures:

- `sales`
- `revenue` at daily granularity
- `predictive`
- `customers`
- `retention`
- `products`
- `operations`

## 5. dbt / Warehouse Gate

When changing pipeline logic or marts:

```powershell
cd dbtproject
dbt run
dbt snapshot
dbt test
```

## 6. Manual Smoke

Before calling a UI change complete:

1. open `http://127.0.0.1:8601`
2. switch across all pages
3. test at least one drilldown
4. test one filter combination
5. confirm no charts overlap or stall

## Demo Safety Gate

Before exposing the app beyond localhost:

- confirm `NEXTGEN_ALLOWED_ORIGINS` is explicit
- keep `NEXTGEN_ENABLE_AGENT_MUTATIONS=0` unless mutation workflows are
  intentionally under review
- if mutations are enabled, require `NEXTGEN_AGENT_TOKEN` and verify the UI
  actually sends `X-NextGen-Agent-Token`
- confirm `/static/desktop_lab.js.served.bak` and other backup artifacts return `404`

## Merge Standard

A meaningful change should not be merged unless:

- tests pass
- syntax checks pass
- benchmark stays within threshold
- the change remains explainable in business terms

This project is not optimized for novelty alone. It is optimized for
defensible analytics work.
