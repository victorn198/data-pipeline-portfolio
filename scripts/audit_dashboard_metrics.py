from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from nextgen_dashboard.backend.dashboard_audit import run_dashboard_audit


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit NextGen dashboard metrics and fail on broken contracts."
    )
    parser.add_argument(
        "--summary-only",
        action="store_true",
        help="Print only the audit summary instead of the full payload.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    results = run_dashboard_audit()
    payload = results["summary"] if args.summary_only else results
    print(json.dumps(payload, indent=2, default=str))
    return 1 if results["summary"]["failed_checks"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
