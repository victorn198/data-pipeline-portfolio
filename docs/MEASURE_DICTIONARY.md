# Measure Dictionary

This file records the business meaning of the dashboard metrics that are most
likely to be discussed in interviews. The executable metric registry lives in
`nextgen_dashboard/semantic/metrics.yml`.

## Certified Revenue Measures

| Metric | Meaning | Important caveat |
|---|---|---|
| `sales_amount` | Net Sales: order value after removing cancelled order value. | This is the primary revenue metric used by dashboard trends, RFM, Pareto, and forecasts. |
| `gross_sales_amount` | Raw order value before cancellation adjustment. | Use it to understand demand before operational cancellation loss. |
| `cancelled_sales_amount` | Order value removed from Net Sales because the order was cancelled. | This should not be mixed into recognized revenue analysis. |
| `cancellation_rate` | `cancelled_sales_amount / gross_sales_amount`. | Value-based cancellation rate, not row-count cancellation rate. |

## Customer Measures

| Metric | Meaning |
|---|---|
| `active_customers` | Distinct customers with activity in the selected window. |
| `new_customers` | Active customers whose first-ever purchase happened in the selected window. |
| `repeat_rate` | Share of active customers with more than one order in the selected window. |
| `revenue_at_risk` | Net Sales currently held by At Risk and Hibernating RFM segments. |

## Marketing Measures

| Metric | Meaning | Important caveat |
|---|---|---|
| `marketing_spend` | Spend from campaigns active in the selected window. | Campaign source comes from the registered marketing CSV. |
| `attributed_revenue` | Net Sales attributed by campaign target city and active campaign date window. | This is a governed portfolio attribution proxy, not last-click truth. |
| `marketing_roas` | `attributed_revenue / marketing_spend`. | Read together with channel mix and campaign detail. |
| `budget_utilization` | `marketing_spend / campaign_budget`. | Budget usage, not profitability. |

## Governance Rules

- Do not redefine `sales_amount` without updating `metrics.yml`, `pages.yml`,
  dbt tests, API tests, and this document.
- Forecast metrics use Net Sales history after cancellation adjustment.
- Imported local files are preview-only until promoted into a governed source
  contract and modeled through dbt.
