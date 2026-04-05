---
description: Review code changes before committing — security, style, tests, performance
---

# /code-review — Pre-Commit Code Review

Before any commit, run this checklist against the staged or unstaged changes.

## 1. Identify Changed Files

```powershell
git diff --stat HEAD
```

## 2. Classify the Change

Determine which layer is affected (per AGENTS.md):
- **semantic** — metrics.yml, pages.yml
- **analytical** — dashboard_service.py, predictive_analytics.py, statistical_analytics.py
- **UX/frontend** — app.js, desktop_lab.js, styles.css, HTML files
- **performance** — caching, data_source.py, repository.py
- **pipeline/dbt** — dbtproject/ models, snapshots, schema

## 3. Security Checklist

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] No absolute/system file paths in output
- [ ] All user inputs validated (query params, request bodies)
- [ ] SQL queries use parameterized statements (no f-string SQL)
- [ ] XSS: untrusted strings escaped before innerHTML (use `escapeHTML()`)
- [ ] Error messages don't leak internal stack traces to clients
- [ ] `.env` files remain in `.gitignore`

## 4. Style & Quality

- [ ] Python: PEP 8 compliance, type annotations on function signatures
- [ ] Python: Prefer `from __future__ import annotations` for forward refs
- [ ] JavaScript: No syntax errors (`node --check`)
- [ ] Functions do one thing — keep under 50 lines when possible
- [ ] No duplicated logic — reuse existing helpers

## 5. Test Coverage

- [ ] If backend changed → `pytest tests/test_nextgen_dashboard_api.py` passes
- [ ] If frontend changed → `node --check` passes
- [ ] If KPI definition changed → update metrics.yml, pages.yml, tests, and docs

## 6. Performance

- [ ] No N+1 queries or unbounded loops over DataFrames
- [ ] Prefer vectorized pandas/numpy over row-by-row iteration
- [ ] Cache-invalidation considered if caching logic changed
- [ ] Benchmark passes: all pages < 1.50s cold start

## 7. Report

Create a summary artifact with:
- Files reviewed
- Issues found (critical / warning / info)
- Recommendation (approve / fix before commit)
