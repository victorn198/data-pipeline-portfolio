# Account Health Case Study

## Business Question

Which company accounts need operational follow-up first when CRM, billing,
support, and ecommerce signals disagree?

This case study exists because real analytics work rarely starts from one clean
reporting table. A useful analyst connects systems, defines a defensible grain,
cleans the sources, and turns the result into a decision workflow.

## Source Inputs

| Source | Grain | Role in the analysis |
|---|---:|---|
| CRM accounts | one row per account | ownership, lifecycle stage, industry, annual revenue |
| Billing invoices | one row per invoice | billed amount, paid amount, outstanding balance, payment status |
| Support tickets | one row per ticket | open issues, high-priority pressure, satisfaction signal |
| Ecommerce sales | one row per sale/order line | commercial activity tied back to known customers |

The sources are simulated for portfolio reliability, but they follow the same
contracts expected from company systems: raw landing, batch metadata, profiling,
dbt staging, tests, marts, API delivery, and dashboard consumption.

## Modeling Decision

The mart [mart_account_health.sql](../dbtproject/models/marts/mart_account_health.sql)
uses **one row per CRM account** as its grain. Billing creates the account to
customer map, then support tickets and ecommerce activity are joined through
the known customer ids.

The model intentionally does not redefine revenue, retention, or existing BI
KPIs. It creates a new operational score for prioritization:

- past-due invoices reduce score strongly;
- open invoices reduce score moderately;
- open and high-priority support tickets reduce score;
- low satisfaction reduces score;
- customer lifecycle stage adds context.

The output is classified into:

- `healthy`
- `watch`
- `risk`

It also exposes a `primary_risk_driver` so the dashboard explains why an account
needs action.

## Dashboard Workflow

The `Account Health` desktop window answers three questions in order:

1. How many accounts are healthy, watch, or risk?
2. Which operational driver is creating the watchlist?
3. Which specific accounts should be handled first?

The page includes:

- score cards for monitored accounts, average score, at-risk accounts, and
  outstanding amount;
- health tier visual;
- risk driver visual;
- account watchlist with score, owner, stage, tier, driver, outstanding balance,
  open tickets, and billed amount.

## Data Quality Controls

The dbt schema validates:

- account id uniqueness and not-null;
- health score between `0` and `100`;
- outstanding amount not greater than billed amount;
- accepted values for lifecycle stage, health tier, and primary risk driver.

These checks make the portfolio story stronger because the dashboard is not
just visual. It is backed by warehouse contracts.

## Interview Narrative

Use this short explanation:

> I built an account health mart to show how I connect company systems into a
> practical operating view. CRM tells me who owns the account, billing tells me
> whether money is blocked, support tells me whether the customer experience is
> under pressure, and ecommerce activity gives commercial context. I model the
> result at account grain, test the output in dbt, expose it through FastAPI,
> and render a dashboard watchlist that explains both priority and reason.

## Why It Matters For Employability

This case demonstrates the work expected from Data Analyst, BI Analyst, and
junior Analytics Engineer roles:

- SQL modeling across multiple sources;
- data quality checks;
- business grain definition;
- dashboard workflow design;
- prioritization logic that can be explained without hiding behind tooling.
