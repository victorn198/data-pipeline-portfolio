# Project Interview Narrative

## One-Line Positioning
This project is an end-to-end ecommerce analytics platform that goes beyond a static dashboard. It covers ingestion, warehouse modeling, testing, monitoring, API delivery, and an interactive web BI application focused on decision-making.

## 30-Second Version
I built an analytics portfolio project that simulates an ecommerce business end to end. It ingests data with Python, models it in PostgreSQL and dbt, runs data quality checks, and serves a custom FastAPI dashboard with business analysis such as Pareto, RFM, retention cohorts, anomaly detection, and predictive outlook. The main goal was to show that I can think like both a data analyst and an analytics engineer.

## 60-Second Version
The project started as a reporting portfolio, but I deliberately pushed it toward a more realistic analytics product. Instead of stopping at KPI cards, I added drilldowns, storytelling, customer segmentation, product concentration analysis, retention cohorts, and a predictive view for next-step planning. I also moved away from a simple app framework into a custom API-first architecture, because I wanted to show stronger engineering ownership. As the dashboard became more analytical, I also optimized performance by caching payloads, vectorizing expensive calculations, and reducing heavy front-end re-renders so the app stayed usable.

## 3-Minute Walkthrough
1. Data comes from Python extractors and simulated ecommerce generation.
2. PostgreSQL acts as the warehouse landing and reporting store.
3. dbt builds staging, marts, snapshots, and tests.
4. FastAPI exposes governed dashboard payloads.
5. The frontend consumes those payloads and supports navigation, filtering, drilldown, source selection, and interactive analysis.
6. The Executive Scorecard starts from certified KPIs: Net Sales, Gross Sales,
   active customers, cancellation rate, new customers, and revenue at risk.
7. The Data Center window makes source connection choices visible to the user
   before analysis starts, and local CSV/JSON files can be profiled and mapped
   inside the product without scripts.
8. The Source Health window exposes registered source loads, duplicate-key
   checks, null profiling, and batch metadata so data quality is visible in the
   product.
9. The Account Health view combines CRM, billing, support, and ecommerce into a
   governed operational watchlist for account risk and follow-up priority.
10. The business layer is not just descriptive. It includes:
   - Net sales, gross sales, and cancellation-aware revenue comparisons.
   - Marketing spend, attributed revenue, and ROAS.
   - Sales and revenue comparisons against aligned previous periods.
   - Pareto and ABC analysis to reveal concentration risk.
   - RFM and retention cohort analysis to separate acquisition from quality.
   - Predictive outlook with base, conservative, and upside scenarios.
11. I also added guided dashboard changes and a semantic layer to show how BI can become more configurable and governed.

## Why The Main Features Exist

## How To Describe The Multi-Source Roadmap
The project currently proves the full analytics lifecycle through a simulated
ecommerce domain. The planned expansion is to make the ingestion layer broader
inside the same company analytics story, without turning the project into an
unfinished universal connector framework.

The right way to explain it:

> The next version extends the same governed workflow across common company data
> patterns: files, relational tables, CRM, billing, support, marketing, product
> events, and operational reference tables. Each source still lands in raw, is
> profiled, cleaned through dbt, exposed through semantic metrics, and validated
> before dashboard consumption.

The important interview point is disciplined business analysis, not source
count.

### Sales Overview
Reason: topline numbers alone are weak. I needed to show if the result came from order volume, ticket size, or concentration in a few categories.

### Revenue Trends
Reason: business users often ask whether a spike is real or just volatility. I added anomaly and structural-shift logic to separate noise from a meaningful level change, and I separated Net Sales from Gross Sales so cancelled order value does not inflate revenue.

### Marketing Efficiency
Reason: once marketing is a source, it needs to become a business analysis layer, not just a loaded table. The page shows spend, attributed revenue, ROAS, budget utilization, and channel mix using a clear city/date-window attribution proxy.

### Customer Segmentation
Reason: revenue does not tell whether the base is healthy. RFM and repeat metrics help explain retention, risk, and customer quality.

### Retention Cohorts
Reason: aggregate customer KPIs can hide quality issues. Cohorts show whether newly acquired customers are actually coming back over time.

### Product Performance
Reason: leadership usually wants to know whether growth is broad-based or concentrated. Pareto and ABC analysis expose mix concentration and priority products.

### Predictive Outlook
Reason: BI should not only explain the past. This page gives a simple next-step view with forecast, scenario ranges, driver mix, and a watchlist.

### Account Health
Reason: company analytics usually needs to connect systems, not just report one
table. This view joins CRM accounts, billing invoices, support tickets, and
ecommerce activity into one operational watchlist with health score, risk tier,
outstanding balance, and follow-up driver.

Interview framing:

> I added Account Health as the multi-source proof point. CRM gives ownership
> and lifecycle, billing shows blocked revenue, support shows customer pressure,
> and ecommerce gives activity context. The mart is tested in dbt, served by
> FastAPI, and shown as a visual watchlist so the analysis ends in a decision,
> not just another table.

## How To Explain The Harder Decisions Simply
### Why add Pareto and ABC?
Because total sales can look healthy while actually depending on a very small number of categories or products. Pareto shows concentration, and ABC turns that into a prioritization framework.

### Why add RFM?
Because revenue alone does not tell me who is loyal, who is at risk, and where retention work should focus.

### Why add prediction and scenarios instead of one forecast?
A single forecast can imply false precision. The scenario view makes the output more useful for business planning by showing a base case, downside, and upside.

### Why optimize performance?
A dashboard that takes seconds to move between tabs loses value quickly. If navigation feels slow, people stop using it, so performance is part of the product quality.

### Why use a custom frontend instead of a simpler dashboard framework?
Because I wanted to show stronger product and engineering control, including API design, state management, and interactive analysis behavior.

## Truthful AI Usage Narrative
Use this if asked how AI was involved:

I used AI as an implementation accelerator and review partner, not as a substitute for thinking. The important part was defining what the dashboard should answer, identifying weak analysis patterns, and iterating until the result was analytically defensible and usable.

## Resume / LinkedIn Bullets
- Built an end-to-end ecommerce analytics platform using Python, PostgreSQL, dbt, FastAPI, and a custom BI web app.
- Implemented advanced business analysis including Pareto/ABC, RFM segmentation, retention cohorts, anomaly detection, and predictive scenario planning.
- Improved dashboard usability and performance through API caching, vectorized calculations, and lighter client-side rendering.

## What To Defend In Interview
If time is short, focus on these four points:
1. Why aligned period-over-period comparison matters.
2. Why customer quality needs RFM and retention, not only revenue.
3. Why product concentration analysis matters for risk and prioritization.
4. Why forecast should be shown as scenarios and watchlist actions, not just a single line.

## What Not To Do In Interview
- Do not try to explain every file.
- Do not pretend every detail was coded manually without assistance.
- Do not present the project as only a dashboard; the stronger story is analytics platform plus product thinking.
