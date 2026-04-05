---
description: Debug failing tests or runtime errors with structured investigation
---

# /debug — Structured Debugging Workflow

## 1. Reproduce the Issue

Run the minimum command to trigger the error:

```powershell
$env:NEXTGEN_SKIP_PREWARM="1"; venv\Scripts\python.exe -m pytest tests/test_nextgen_dashboard_api.py -v --tb=long -k "<test_name>"
```

## 2. Read Before Writing

Before making any code change:
- Read the full error traceback
- Identify the exact file, function, and line number
- Read the surrounding code (at least 20 lines of context)
- Understand the data flow: what calls what, what data types are expected

## 3. Search Before Inventing

Look for existing patterns in the codebase:
- Does a similar function already handle this case?
- Is there an existing test that covers this scenario?
- Is the error documented in PROGRESS_LOG.md or docs/?

## 4. Fix The Narrowest Layer

Per AGENTS.md: "Update the narrowest layer possible."
- Don't refactor while debugging
- Don't expand scope beyond the immediate fix
- One fix per issue

## 5. Verify the Fix

Run the full validation suite after fixing:
- Run the specific failing test
- Run the full test suite
- Run benchmark if performance-related
- Check frontend syntax if JS was modified

## 6. Document

If the bug was non-obvious, leave a brief comment in the code explaining
why the fix works, not just what it does.
