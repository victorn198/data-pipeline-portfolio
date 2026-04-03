# RUNBOOK.md

Operational runbook for the PostgreSQL-based pipeline.

## 1) Start database

Docker option:

```bash
docker compose up -d
```

Native PostgreSQL option:
- keep `.env` aligned to local connection (example `POSTGRES_PORT=5433`).

## 2) Validate connection

```bash
python test_postgres.py
```

## 3) Load RAW data

Default mode (`incremental`):

```bash
python scripts/loadsampledata.py
```

Full refresh:

```bash
python scripts/loadsampledata.py --mode full_refresh
```

Expected volume targets:
- Customers: 10000
- Products: 2000
- Orders: 100000

## 4) Run dbt

Inside `dbtproject`:

```bash
dbt deps
dbt run --full-refresh --no-partial-parse
dbt snapshot --no-partial-parse
dbt test --no-partial-parse
```

## 5) Setup operational SQL objects

```bash
psql "postgresql://postgres:postgres@localhost:5432/analytics" -f scripts/setup_data_quality_audit.sql
psql "postgresql://postgres:postgres@localhost:5432/analytics" -f scripts/setup_data_quality_alerting.sql
psql "postgresql://postgres:postgres@localhost:5432/analytics" -f scripts/setup_operational_monitoring_views.sql
```

Use `5433` instead of `5432` when your local PostgreSQL is on port 5433.

## 6) Execute one DQ cycle manually

```sql
select data_quality.sp_run_data_quality_audit();
select data_quality.sp_process_data_quality_alerts();
```

## 7) Useful queries

```sql
select * from monitoring.vw_pipeline_operational_kpis;
select * from monitoring.vw_raw_table_counts order by table_name;
select * from monitoring.vw_data_quality_latest order by rule_name;
select * from monitoring.vw_open_data_quality_alerts order by alert_created_at desc;
```

## 8) Scheduling recommendation

Use cron/Task Scheduler to run:
1. `python scripts/loadsampledata.py`
2. `dbt run`
3. `dbt snapshot`
4. `dbt test`
5. `select data_quality.sp_run_data_quality_audit();`
6. `select data_quality.sp_process_data_quality_alerts();`
