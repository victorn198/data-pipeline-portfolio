---
description: Stage, validate, and commit changes with conventional commit messages
---

# /commit — Smart Commit Workflow

## 1. Review What Changed

```powershell
git status --short
git diff --stat HEAD
```

## 2. Classify and Validate

- If backend Python changed → run pytest
- If frontend JS changed → run node --check
- If semantic layer changed → confirm metrics.yml/pages.yml/tests are in sync
- If dbt changed → note that `dbt run && dbt test` should be run when DB is available

## 3. Stage Files

Stage only the relevant files. Do NOT use `git add .` blindly.

```powershell
git add <specific files>
```

## 4. Write Conventional Commit Message

Use this format:
```
<type>(<scope>): <short description>

<optional body with details>
```

**Types:** feat, fix, refactor, docs, test, chore, perf, ci, security
**Scopes:** dashboard, frontend, backend, semantic, dbt, pipeline, mcp, docs

Examples:
- `feat(backend): add rate limiter middleware`
- `fix(frontend): escape HTML in drilldown labels`
- `perf(backend): add TTL-based cache expiration`
- `docs: update deployment guide`

## 5. Commit

```powershell
git commit -m "<message>"
```

## 6. Post-Commit Verification

```powershell
git log --oneline -3
git status --short
```

Confirm working tree is clean after commit.
