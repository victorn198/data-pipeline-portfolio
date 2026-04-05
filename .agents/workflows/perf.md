---
description: Investigate performance issues — profile, benchmark, optimize
---

# /perf — Performance Investigation

## 1. Baseline Benchmark

Run the benchmark to establish current performance:

```powershell
$env:NEXTGEN_SKIP_PREWARM="1"; venv\Scripts\python.exe scripts/benchmark_dashboard.py --threshold-seconds 1.50
```

Record cold-start and median times per page.

## 2. Profile Slow Route

If a specific page is slow, profile it:

```powershell
$env:NEXTGEN_SKIP_PREWARM="1"; venv\Scripts\python.exe -c "
import time
from nextgen_dashboard.backend.main import repository, dashboard_service
from nextgen_dashboard.backend.semantic_layer import SemanticLayer

sl = SemanticLayer()
sl.load()

full_df = repository.load_sales_model()
full_df.attrs['customer_first_purchase'] = repository.customer_first_purchase()
scoped_df = repository.filter_sales(start_date=None, end_date=None, categories=[], cities=[])
start, end = repository.validate_date_range(None, None)
current_df = repository.filter_frame_by_date(scoped_df, start, end)

t0 = time.perf_counter()
dashboard_service.build_payload(page='PAGE_NAME', scoped_df=scoped_df, current_df=current_df, start_date=start, end_date=end, granularity='Month', full_df=full_df, scenario_mode='Base')
print(f'Duration: {time.perf_counter()-t0:.4f}s')
"
```

## 3. Optimization Checklist

From AGENTS.md performance expectations:
- [ ] Vectorized aggregation (no row-by-row loops)
- [ ] Cached reusable intermediates (LRU with TTL)
- [ ] Backend precomputation over frontend over-rendering
- [ ] DataFrame operations: avoid `.apply()` with lambdas; prefer `.groupby().agg()`
- [ ] Check if prewarm cache is being populated correctly

## 4. Verify After Optimization

Re-run benchmark and compare against baseline:

```powershell
$env:NEXTGEN_SKIP_PREWARM="1"; venv\Scripts\python.exe scripts/benchmark_dashboard.py --threshold-seconds 1.50
```

All pages must remain under 1.50s cold start.
