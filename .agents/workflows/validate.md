---
description: Run the full project validation suite (tests, frontend checks, benchmark)
---

# /validate — Full Project Validation

Run all required checks from AGENTS.md in order. Report a pass/fail summary at the end.

// turbo-all

## Steps

1. Set environment to skip prewarm (avoids DB dependency during tests):
```powershell
$env:NEXTGEN_SKIP_PREWARM="1"
```

2. Run backend API tests:
```powershell
venv\Scripts\python.exe -m pytest tests/test_nextgen_dashboard_api.py -v --tb=short
```

3. Check frontend syntax — app.js:
```powershell
node --check nextgen_dashboard/frontend/app.js
```

4. Check frontend syntax — desktop_lab.js:
```powershell
node --check nextgen_dashboard/frontend/desktop_lab.js
```

5. Run performance benchmark:
```powershell
$env:NEXTGEN_SKIP_PREWARM="1"; venv\Scripts\python.exe scripts/benchmark_dashboard.py --threshold-seconds 1.50
```

6. Summarize results in a table:

| Check | Expected |
|---|---|
| pytest (20 tests) | All passed |
| app.js syntax | No errors |
| desktop_lab.js syntax | No errors |
| Benchmark (7 pages) | All median < 1.50s |

If any check fails, stop and report the failure before proceeding.
