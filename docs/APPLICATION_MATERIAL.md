# Portfolio Application Material

Use this file to turn the project into CV, LinkedIn, and interview language.
Keep the claims truthful: the core ecommerce dataset is a governed sample from
the UCI Online Retail dataset, while the auxiliary CRM, billing, support, and
marketing sources are portfolio fixtures aligned to that same customer story.

## Resume Bullets

### Data Analyst / BI Analyst

- Built an end-to-end analytics portfolio platform with Python, PostgreSQL,
  dbt, FastAPI, and a custom desktop-style BI interface.
- Modeled 100K real retail transaction lines across customers, products,
  net sales, retention, marketing, forecasting, and operations views.
- Created advanced business analysis views including Pareto/ABC, RFM customer
  segmentation, retention cohorts, anomaly detection, and forecast scenarios.
- Added certified revenue definitions separating Net Sales, Gross Sales,
  cancelled order value, cancellation rate, and marketing ROAS.
- Developed a multi-source Account Health case connecting CRM, billing,
  support, and ecommerce signals into a governed customer-risk watchlist.
- Added source health monitoring for registered CSV, JSON, and paginated
  API-style sources, including batch metadata, duplicate-key checks, and null
  profiling.
- Built an in-app Data Center so a business user can inspect connected sources,
  choose from a connector library, toggle workspace source selection, draft
  database/API connections, and preview local CSV/JSON files without touching
  scripts.
- Added a no-code local import workflow that profiles uploaded CSV/JSON files,
  classifies the dataset, suggests date/value/entity/category mappings, and
  opens an isolated `Imported Dataset` analysis window before any governed load.

### Analytics Engineer Junior

- Designed a layered warehouse workflow with raw ingestion, dbt staging,
  marts, snapshots, tests, and API-ready analytical outputs.
- Implemented a governed `mart_account_health` model at CRM account grain,
  combining billing exposure, support pressure, lifecycle stage, and ecommerce
  activity.
- Added dbt quality tests for uniqueness, accepted values, score bounds, and
  financial consistency checks.
- Built FastAPI endpoints and automated tests for dashboard payloads, source
  health, and account health routes.
- Maintained dashboard performance with route benchmarks and cache-aware API
  design.

## LinkedIn Featured Project Copy

I built an end-to-end analytics engineering portfolio project around a real
retail transaction dataset, extended with controlled company-source fixtures
from ingestion to BI consumption.

The project includes Python ingestion, PostgreSQL, dbt models and tests,
FastAPI endpoints and a custom desktop-style BI interface.
Beyond standard sales dashboards, it includes RFM segmentation, retention
cohorts, Pareto/ABC analysis, forecast scenarios, source health monitoring, and
an Account Health case that connects CRM, billing, support, and ecommerce data
into an operational watchlist.

The goal was to show not only dashboard building, but the full analytical
workflow: source contracts, data quality, warehouse modeling, API delivery,
semantic thinking, and business interpretation.

## GitHub Repository Description

End-to-end analytics engineering portfolio with Python, PostgreSQL, dbt,
FastAPI, source health monitoring, and a custom desktop BI interface.

## 30-Second Interview Pitch

I built this project to show the full analytics lifecycle, not just a dashboard.
It ingests a real retail transaction sample plus controlled company-source fixtures, models it in PostgreSQL and dbt, validates it
with tests, serves governed payloads through FastAPI, and presents the results
in a custom BI interface. The strongest case is Account Health, where CRM,
billing, support, and ecommerce signals are combined into a tested account
watchlist with score, tier, driver, and operational priority.

## 2-Minute Technical Walkthrough

The project starts with a canonical retail transaction sample and registered
source ingestion. Ecommerce data covers order lines, customers, and products
derived from the same source. Additional company sources provide marketing campaigns, support tickets, CRM accounts, and
billing invoices. Each registered source lands in raw with batch metadata and
profiling output.

dbt handles the warehouse layers: staging cleans and standardizes the raw
sources, intermediate models prepare reusable business logic, and marts expose
BI-ready facts, dimensions, and account-level operations data. Tests validate
keys, accepted values, score ranges, relationships, and financial consistency.

FastAPI serves dashboard payloads to a custom frontend. The BI interface
supports a login-style workspace entry, shared filters, windows, bookmarks,
comparisons, drilldowns, source selection, local import profiling, source
health, and Account Health.
The Account Health case is the main multi-source
proof point because it turns separate company systems into a practical decision
workflow: which accounts need attention, why, and what signal is driving the
priority.

## Roles This Project Supports Best

- Data Analyst
- BI Analyst
- Junior Analytics Engineer
- Revenue Operations Analyst
- Product/Data Operations Analyst
- Reporting Analyst with SQL/Python requirements

## What To Avoid Claiming

- Do not say the project integrates live vendor APIs.
- Do not claim delivery in external BI tools; this repository ships a custom BI interface.
- Do not claim production-scale streaming, Spark, Kafka, or cloud deployment
  unless those are actually added later.
- Do not present the account health score as a universal risk model. It is a
  transparent portfolio scoring rule for operational prioritization.
