from __future__ import annotations

import sys
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from nextgen_dashboard.backend.data_source import DashboardDataSource, DashboardSettings


def main() -> None:
    load_dotenv()

    settings = DashboardSettings.from_env()
    source = DashboardDataSource(settings)

    base_dir = Path("data/local")
    base_dir.mkdir(parents=True, exist_ok=True)

    tables = source.load_base_tables()
    sales = tables["sales"]
    customers = tables["customers"]
    products = tables["products"]

    sales.to_csv(
        base_dir / f"{settings.sales_schema}.{settings.sales_table}.csv", index=False
    )
    customers.to_csv(
        base_dir / f"{settings.customer_schema}.{settings.customer_table}.csv",
        index=False,
    )
    products.to_csv(
        base_dir / f"{settings.product_schema}.{settings.product_table}.csv",
        index=False,
    )

    print(f"Export finished at {base_dir.resolve()}")


if __name__ == "__main__":
    main()
