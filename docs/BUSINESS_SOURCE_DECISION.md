# Business Source Decision

## Decision

Keep the portfolio focused on company analytics sources:

- ecommerce orders, customers, and products;
- CRM accounts;
- marketing campaigns;
- billing invoices;
- support tickets.

This is stronger for Data Analyst, BI Analyst, and Analytics Engineer roles than
adding unrelated public macroeconomic data.

## Why This Replaces The Public Macro Source

A public macroeconomic API is technically valid, but it weakens the story of
this repository. The product is positioned as an analytics platform for business
operations, not as an economic research project.

The better interview signal is a governed flow across company systems:

```text
CRM + Marketing + Billing + Support + Ecommerce
  -> raw loads with batch metadata
  -> profiling and quality checks
  -> dbt staging
  -> governed BI consumption
```

## Current API Posture

The implemented API-style sources are deterministic local simulations of common
SaaS patterns:

- `crm_accounts_api`: paginated CRM account feed;
- `billing_invoices_api`: paginated billing invoice feed.

This keeps the demo reliable while still proving the ingestion pattern expected
from APIs such as HubSpot, Salesforce, Stripe, Shopify, or Zendesk.

## Interview Framing

Use this explanation:

> I avoided depending on unstable public demo APIs for the core portfolio.
> Instead, I modeled the business systems analysts actually work with: CRM,
> marketing, billing, support, and ecommerce. The API sources are paginated and
> governed through raw load metadata, profiling, dbt staging, and Source Health
> visibility.
