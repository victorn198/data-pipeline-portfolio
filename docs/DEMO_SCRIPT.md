# Portfolio Demo Script

Use this as a 60 to 90 second walkthrough for interviews, LinkedIn videos, or
screen recordings.

## Opening

This is an end-to-end analytics engineering portfolio project. It simulates a
company data environment, lands sources in PostgreSQL, models them with dbt,
validates quality with tests, serves analytics through FastAPI, and displays
the result in a custom desktop-style BI interface.

## Flow

1. Open the desktop dashboard.
2. Show `Sales Overview` briefly to establish the classic BI layer: revenue,
   period comparison, Pareto, and drilldown.
3. Open `Data Center` to show source selection and local CSV/JSON import inside
   the product. Upload a sample CSV to show the automatic `Imported Dataset`
   window: parsing, profiling, detected dataset type, suggested mapping, auto
   view, and sample rows. Make clear it is a preview, not a silent KPI change.
4. Open `Source Health` to show that sources are registered, loaded with batch
   metadata, and profiled for duplicate keys and nulls.
5. Open `Account Health`.
6. Explain that this is the multi-source case:
   - CRM gives account ownership and lifecycle stage.
   - Billing shows outstanding balance and payment risk.
   - Support shows customer pressure.
   - Ecommerce adds commercial activity context.
7. Point to the four Account Health cards.
8. Point to `Health Tier Summary`: this shows whether the account base is
   healthy, watch, or risk.
9. Point to `Risk Driver Mix`: this explains why accounts need follow-up.
10. Point to `Account Watchlist`: this turns the analysis into a decision list.

## Closing Line

The important part is not that this is a large dashboard. It is that the
project connects source ingestion, data quality, warehouse modeling, API
delivery, and business interpretation into one repeatable analytics workflow.

## Recording URL

Use this URL for a clean Account Health screenshot or recording:

```text
http://127.0.0.1:8601/?open=account_health&maximize=account_health&theme=desktop&guide=off
```

Use this URL for a broader desktop demo:

```text
http://127.0.0.1:8601/?open=data_center,sales,predictive,account_health&theme=desktop&guide=off
```

## Capture Assets

Current portfolio-ready captures:

- `assets/gallery/nextgen-demo.gif`
- `assets/gallery/nextgen-demo.webm`
- `assets/gallery/desktop-home-compact.png`
- `assets/gallery/desktop-sales-overview.png`
- `assets/gallery/desktop-revenue-trends.png`
- `assets/gallery/desktop-predictive-outlook.png`
- `assets/gallery/desktop-customer-segments.png`
- `assets/gallery/desktop-retention-cohorts.png`
- `assets/gallery/desktop-product-performance.png`
- `assets/gallery/desktop-order-flow-ops.png`
- `assets/gallery/desktop-workflow.png`
- `assets/gallery/desktop-source-health.png`
- `assets/gallery/desktop-account-health.png`
- `assets/gallery/desktop-sales-predictive.png`
- `assets/gallery/desktop-products-retention.png`
- `assets/gallery/interactive-steps/01-desktop-start.png`
- `assets/gallery/interactive-steps/03-sales-adjusted.png`
- `assets/gallery/interactive-steps/04-spotlight.png`
- `assets/gallery/interactive-steps/05-compare.png`
- `assets/gallery/interactive-steps/08-account-action-board.png`
- `assets/gallery/interactive-steps/09-workflow-finish.png`

For small browser panes, use `desktop-home-compact.png`; it captures the
two-row responsive top bar used by the in-app browser.

For the main portfolio demo, use `nextgen-demo.webm`. It records real icon
clicks, window movement/resizing, Spotlight, Compare, filters, and the Action
Board in the colored `Glass Blue` theme.
