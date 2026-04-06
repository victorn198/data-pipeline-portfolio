# Setup Guide (PostgreSQL)

## 1. Requirements

- Docker Desktop (optional)
- Python 3.10+
- Git
- PostgreSQL client (`psql`)

## 2. Clone and install

```bash
git clone <your-repo-url>
cd data-pipeline-portfolio
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
python -m pip install --upgrade pip setuptools
pip install -r requirements.txt -c constraints.txt
```

## 3. Environment variables

Create `.env` from template:

```bash
cp .env.example .env
```

## 4. Start PostgreSQL

Docker option:

```bash
docker compose up -d
```

Native PostgreSQL option:
- skip Docker and set `.env` with your local connection (example port `5433`).

## 5. Validate DB connection

```bash
python test_postgres.py
```

## 6. Load raw data

```bash
python scripts/loadsampledata.py --mode full_refresh
```

## 7. Run dbt models, snapshots, tests

```bash
cd dbtproject
dbt deps
dbt run --full-refresh
dbt snapshot
dbt test
```

## 8. Setup monitoring and quality SQL objects

```bash
cd ..
psql "postgresql://postgres:postgres@localhost:5432/analytics" -f scripts/setup_data_quality_audit.sql
psql "postgresql://postgres:postgres@localhost:5432/analytics" -f scripts/setup_data_quality_alerting.sql
psql "postgresql://postgres:postgres@localhost:5432/analytics" -f scripts/setup_operational_monitoring_views.sql
```

If your local PostgreSQL runs on `5433`, replace `5432` with `5433`.
