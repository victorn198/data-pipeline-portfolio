---
description: Run the data pipeline end-to-end — extract, load, transform, validate
---

# /pipeline — Run Data Pipeline

Runs the full ELT pipeline: Fivetran Simulator → PostgreSQL → dbt transformations.

## Prerequisites

- PostgreSQL running (via Docker or local install)
- `.env` file configured with correct POSTGRES_* values

## 1. Start Database (if needed)

```powershell
docker compose up -d postgres
```

Wait for the healthcheck to pass.

## 2. Extract & Load

Run the Fivetran simulator extractors:

```powershell
venv\Scripts\python.exe -m fivetran_simulator.extract_customers
venv\Scripts\python.exe -m fivetran_simulator.extract_products
venv\Scripts\python.exe -m fivetran_simulator.extract_orders
```

## 3. Transform (dbt)

```powershell
cd dbtproject
venv\Scripts\dbt run
venv\Scripts\dbt snapshot
venv\Scripts\dbt test
cd ..
```

Expected result:
- staging models: stg_orders, stg_customers, stg_products
- intermediate: int_orders_enhanced
- marts: fct_sales, dim_customer, dim_product
- snapshot: customers_snapshot

## 4. Verify

Run dashboard tests to confirm the data is queryable:

```powershell
$env:NEXTGEN_SKIP_PREWARM="1"; venv\Scripts\python.exe -m pytest tests/test_nextgen_dashboard_api.py -v --tb=short
```

## 5. Start Dashboard (optional)

```powershell
venv\Scripts\uvicorn nextgen_dashboard.backend.main:app --host 127.0.0.1 --port 8601
```

Open http://127.0.0.1:8601 in the browser.
