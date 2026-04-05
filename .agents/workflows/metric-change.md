---
description: Add or modify a KPI — semantic metric change with governed workflow
---

# /metric-change — Governed Metric Change

This workflow ensures KPI changes follow the non-negotiable rules in AGENTS.md:
changing a metric definition requires updating metrics.yml, pages.yml, tests, and docs.

## 1. Understand the Change

Before modifying any metric:
- What is the current definition? Read `nextgen_dashboard/semantic/metrics.yml`
- Which pages reference it? Read `nextgen_dashboard/semantic/pages.yml`
- Which tests assert on it? Search `tests/test_nextgen_dashboard_api.py`

## 2. Update Semantic Layer

Edit `nextgen_dashboard/semantic/metrics.yml`:
- Add/modify the metric definition
- Include: label, description, format, aggregation, dimensions, allowed_granularities

If the metric is displayed on a page, edit `nextgen_dashboard/semantic/pages.yml`:
- Add metric key to the page's `cards` list
- Update `primary_trend_metric` if this becomes the hero metric

## 3. Update Backend

If the metric requires new computation:
- Add logic to `dashboard_service.py` (the analytics engine)
- Keep computation vectorized (pandas/numpy)
- Update `models.py` if new response fields are needed

## 4. Update Tests

In `tests/test_nextgen_dashboard_api.py`:
- Add assertions for the new metric in `test_dashboard_pages_respond`
- If the metric has special behavior, add a dedicated test function
- Verify existing tests still pass

## 5. Update Documentation

If the change is externally visible:
- Update `docs/MEASURE_DICTIONARY.md`
- Update relevant sections in README if applicable

## 6. Validate

Run /validate to confirm everything passes:
```powershell
$env:NEXTGEN_SKIP_PREWARM="1"; venv\Scripts\python.exe -m pytest tests/test_nextgen_dashboard_api.py -v --tb=short
```
