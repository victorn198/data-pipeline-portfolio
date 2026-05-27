from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
import statistics
import sys
import time

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from fastapi.testclient import TestClient

import nextgen_dashboard.backend.main as main_module


DEFAULT_PAGES = [
    "executive",
    "sales",
    "revenue",
    "marketing",
    "predictive",
    "customers",
    "retention",
    "products",
    "operations",
]


@dataclass
class BenchmarkResult:
    name: str
    cold_seconds: float
    median_seconds: float
    max_seconds: float
    iterations: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Benchmark NextGen dashboard API routes using FastAPI TestClient."
    )
    parser.add_argument(
        "--pages",
        nargs="+",
        default=DEFAULT_PAGES,
        help="Dashboard pages to benchmark.",
    )
    parser.add_argument(
        "--warmup-runs",
        type=int,
        default=1,
        help="Number of warmup requests before timed iterations.",
    )
    parser.add_argument(
        "--iterations",
        type=int,
        default=3,
        help="Number of timed iterations per route.",
    )
    parser.add_argument(
        "--threshold-seconds",
        type=float,
        default=None,
        help="Fail when any median route time exceeds this threshold.",
    )
    return parser.parse_args()


def build_default_context(client: TestClient) -> dict[str, str]:
    response = client.get("/api/meta/filters")
    response.raise_for_status()
    payload = response.json()
    max_date = date.fromisoformat(payload["max_date"])
    min_date = date.fromisoformat(payload["min_date"])
    start_date = max(min_date, max_date - timedelta(days=365))
    return {
        "start_date": start_date.isoformat(),
        "end_date": max_date.isoformat(),
    }


def page_params(page: str, base_context: dict[str, str]) -> dict[str, str]:
    params = {"page": page, **base_context}
    if page == "revenue":
        params["granularity"] = "Day"
    elif page == "predictive":
        params["scenario_mode"] = "Base"
    elif page != "retention":
        params["granularity"] = "Month"
    return params


def time_request(client: TestClient, params: dict[str, str]) -> float:
    started = time.perf_counter()
    response = client.get("/api/dashboard", params=params)
    elapsed = time.perf_counter() - started
    response.raise_for_status()
    return elapsed


def benchmark_page(
    client: TestClient,
    page: str,
    base_context: dict[str, str],
    warmup_runs: int,
    iterations: int,
) -> BenchmarkResult:
    params = page_params(page, base_context)
    cold_seconds = time_request(client, params)

    for _ in range(max(0, warmup_runs)):
        time_request(client, params)

    samples = [time_request(client, params) for _ in range(iterations)]
    return BenchmarkResult(
        name=page,
        cold_seconds=cold_seconds,
        median_seconds=statistics.median(samples),
        max_seconds=max(samples),
        iterations=iterations,
    )


def main() -> int:
    args = parse_args()
    with TestClient(main_module.app) as client:
        base_context = build_default_context(client)
        results = [
            benchmark_page(
                client=client,
                page=page,
                base_context=base_context,
                warmup_runs=args.warmup_runs,
                iterations=args.iterations,
            )
            for page in args.pages
        ]

    print("NextGen dashboard benchmark")
    print(f"Window: {base_context['start_date']} -> {base_context['end_date']}")
    print("")
    print(f"{'page':<14} {'cold_s':>10} {'median_s':>10} {'max_s':>10}")
    for result in results:
        print(
            f"{result.name:<14} "
            f"{result.cold_seconds:>10.4f} "
            f"{result.median_seconds:>10.4f} "
            f"{result.max_seconds:>10.4f}"
        )

    if args.threshold_seconds is not None:
        slow = [
            result
            for result in results
            if result.median_seconds > args.threshold_seconds
        ]
        if slow:
            print("")
            print(
                "Benchmark threshold exceeded for: "
                + ", ".join(
                    f"{result.name} ({result.median_seconds:.4f}s)"
                    for result in slow
                )
            )
            return 1

        print("")
        print(
            f"All median route times are within {args.threshold_seconds:.2f}s."
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())

