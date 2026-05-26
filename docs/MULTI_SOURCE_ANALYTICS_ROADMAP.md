# Multi-Source Analytics Roadmap

This roadmap defines how to evolve the portfolio from a strong ecommerce
analytics case study into a broader, portfolio-grade company analytics platform
without overclaiming that it supports every possible data source.

## Current State Assessment

The repository is already stronger than a standard analyst portfolio:

- `fivetran_simulator/` and `scripts/loadsampledata.py` generate deterministic
  ecommerce data and load it into PostgreSQL `raw` tables.
- `dbtproject/` models the warehouse through `staging`, `intermediate`, and
  `marts`, with tests and a customer snapshot.
- `nextgen_dashboard/` exposes a FastAPI-backed analytics interface with
  governed metrics, drilldowns, customer/product analysis, retention cohorts,
  anomaly detection, and forecast scenarios.
- `nextgen_dashboard/semantic/` keeps metric and page definitions explicit.
- `scripts/export_dashboard_local_data.py` supports a local CSV fallback for
  demo mode.
- `docs/`, tests, and benchmarks make the project defensible in interviews.

The current limitation is source breadth inside the same company analytics
story. Today the warehouse is built around a simulated ecommerce domain:
customers, products, and orders. That is a good base, but the next
employability improvement is to show that the same analytics workflow can
handle the business systems analysts usually combine: CRM, billing, support,
marketing, product events, and operational reference tables.

## Target Positioning

Recommended positioning:

> A portfolio-grade company analytics platform that ingests common operational
> data sources, lands them in a governed raw layer, profiles and cleans them
> with repeatable rules, models them in dbt, and exposes trusted metrics through
> BI dashboards and an exploratory analytics workbench.

This is stronger than saying the project can ingest "all data sources". The
credible claim is that it covers the company data families most analysts and BI
teams actually encounter.

## Source Coverage Target

| Source family | Examples | Portfolio proof to add | Why it matters |
|---|---|---|---|
| Files | CSV, Excel, JSON, Parquet | File ingestion contract and sample loads | Analysts receive exports constantly. |
| Relational tables | PostgreSQL, SQLite, DuckDB-style extracts | Table copy/snapshot pattern into `raw` | Shows SQL and warehouse fluency. |
| REST APIs | CRM, billing, support, or internal service endpoints | Paginated API loader with load metadata | Common automation requirement. |
| SaaS-style extracts | Stripe, Shopify, HubSpot, Google Ads, Zendesk-like data | Simulated SaaS entities with realistic grain | Maps to revenue, marketing, support, and ops roles. |
| Events and logs | Web sessions, product events, application logs | Event model with session/user grain | Shows product analytics readiness. |
| Operational reference tables | Targets, territories, product catalog, SLA rules, account tiers | Governed reference data joined into marts | Adds business context without drifting into unrelated public macro data. |

Do not chase streaming platforms, paid connector APIs, or Spark-scale tooling
until the portfolio has a clear reason to need them.

## Recommended Analytics Workflow

The future workflow should be simple enough to explain in an interview:

```text
source contract
  -> extractor / loader
  -> raw table with batch metadata
  -> profiling and quality checks
  -> dbt staging model
  -> dbt intermediate business logic
  -> marts / facts / dimensions
  -> semantic metrics
  -> dashboard or analytics workbench
  -> tests, benchmark, and documentation
```

Every new source should answer these questions before code is written:

- What business question does this source help answer?
- What is the grain of the data?
- What is the stable business key?
- Is the load append-only, snapshot, or upsert?
- Which fields are allowed to become dashboard dimensions or metrics?
- Which quality checks prove the data is usable?

## Implementation Phases

### Phase 1: Source Contracts and File Ingestion

Goal: add the minimum multi-source foundation without changing the dashboard
story too much.

Status: first slice implemented for CSV, JSON, and local paginated API-style
sources for CRM and billing.

Recommended scope:

- Add a source registry that describes source name, type, entity, grain, primary
  key, load mode, and target raw table.
- Add file loaders for CSV and JSON first. Excel and Parquet can follow once
  the contract is stable.
- Add load metadata columns such as `source_system`, `source_entity`,
  `load_batch_id`, `loaded_at`, and `record_hash`.
- Add a small profiling output: row count, duplicate key count, null rates, and
  freshness.
- Keep the existing ecommerce pipeline intact.

Portfolio value:

- Shows practical ingestion breadth.
- Keeps the project explainable.
- Creates a foundation for the next sources without adding a heavy orchestrator.

### Phase 2: API and SaaS-Style Company Sources

Goal: show automation beyond flat files.

Status: first paginated API-style sources implemented with local deterministic
pages for CRM accounts and billing invoices. The first cross-source company
operations mart, `mart_account_health`, now joins CRM, billing, support, and
ecommerce signals into a governed account watchlist.

Recommended scope:

- Add one paginated REST API loader.
- Add one SaaS-style simulated source, such as subscriptions, payments, support
  tickets, campaign performance, product events, or account ownership.
- Land these in `raw` and model them with dbt into clean staging models.
- Join at least one new source into an existing business mart.

Portfolio value:

- Makes the project look closer to real company data work.
- Supports stronger interview examples around data integration and business
  tradeoffs.

### Phase 3: Data Quality and Observability Layer

Goal: make reliability visible, not just implied.

Status: first product-facing Source Health view implemented for registered
source loads and profiling results.

Recommended scope:

- Standardize raw load audit tables.
- Track source freshness, row counts, failed records, and duplicate keys.
- Expose a small dashboard page or API payload for source health.
- Connect dbt tests and profiling output into a single quality narrative.

Portfolio value:

- Recruiters and hiring managers can see that the project is not only visual.
- Supports a strong story about dependable reporting.

### Phase 4: Governed Analytics Workbench

Goal: add governed BI exploration inside the custom desktop interface.

Status: first no-code preview slice implemented in the `Data Center`. Local
CSV/JSON uploads are parsed in the browser, profiled, classified by likely
business domain, mapped to date/value/entity/category/status roles, and opened
in an isolated `Imported Dataset` window. This is intentionally a preview layer:
it does not alter official KPI definitions or warehouse marts until a governed
promotion flow exists.

Recommended scope:

- Let users select a governed dataset.
- Let users choose allowed dimensions, metrics, date fields, and filters.
- Suggest chart types based on field types.
- Keep calculations tied to the semantic layer or approved model metadata.
- Show data quality/freshness context next to the selected dataset.

Important boundary:

- The workbench should not allow arbitrary metric definitions in the frontend.
- The frontend can compose views, but metric meaning must stay governed.

Portfolio value:

- Shows BI product thinking.
- Demonstrates why semantic layers matter.
- Avoids the trap of building a weak clone of existing BI tools.

### Phase 5: Public Case Study Packaging

Goal: make the project easier to sell during applications.

Recommended scope:

- Update the README with a concise multi-source architecture section once the
  first sources are implemented.
- Add one end-to-end case study: source intake, cleaning rule, dbt model, metric,
  dashboard insight, and quality check.
- Keep screenshots focused on one investigation path.

Portfolio value:

- Converts technical work into a recruiter-readable story.
- Makes the project easier to defend in interviews.

## First Technical Slice

The best next implementation slice is:

1. Add a small source registry. Done.
2. Add CSV and JSON file ingestion into `raw`. Done.
3. Add load metadata and profiling output. Done.
4. Add one dbt staging model for a new source. Done for campaigns, tickets,
   CRM accounts, and billing invoices.
5. Add tests for source validity and dashboard non-regression. Source tests are
   in place; dashboard non-regression remains part of the normal full
   validation gate.

This slice is narrow enough to finish, but meaningful enough to change the
portfolio story from "single ecommerce simulator" to "governed multi-source
analytics foundation".

## What Not To Build Next

- Do not build a universal connector framework.
- Do not add Airflow, Spark, Kafka, or a cloud warehouse just for tool coverage.
- Do not let the dashboard calculate ungoverned metrics from arbitrary columns.
- Do not present simulated connectors as live vendor integrations.
- Do not make AI chat the center of the project.

The strongest employment signal is reliable analytics delivery: SQL, Python,
dbt, data quality, BI semantics, and clear business interpretation.

## Interview Narrative

Use this framing:

> I started with a realistic ecommerce analytics platform, then designed a
> governed path to expand it across the company systems analysts commonly
> combine: files, relational tables, CRM, billing, support, marketing, product
> events, and operational reference data. The important part is not claiming
> universal ingestion. It is showing that every source follows the same
> disciplined workflow: raw landing, profiling, dbt cleaning, semantic metrics,
> BI consumption, and validation.
