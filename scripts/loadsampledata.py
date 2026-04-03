import os
import sys
import argparse
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

# Ensure local package imports work when running from scripts/ path.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fivetran_simulator.extract_customers import load_customers
from fivetran_simulator.extract_orders import load_orders
from fivetran_simulator.extract_products import load_products


def _ensure_raw_tables(cur):
    cur.execute("CREATE SCHEMA IF NOT EXISTS raw")
    cur.execute(
        "CREATE TABLE IF NOT EXISTS raw.customers_raw (customer_id TEXT, customer_name TEXT, email TEXT, city TEXT, state TEXT, created_date TIMESTAMP)"
    )
    cur.execute(
        "CREATE TABLE IF NOT EXISTS raw.products_raw (product_id TEXT, product_name TEXT, category TEXT, unit_price DOUBLE PRECISION, stock_quantity INTEGER)"
    )
    cur.execute(
        "CREATE TABLE IF NOT EXISTS raw.orders_raw (order_id TEXT, customer_id TEXT, product_id TEXT, order_date TIMESTAMP, quantity INTEGER, unit_price DOUBLE PRECISION, total_amount DOUBLE PRECISION, status TEXT)"
    )


def _truncate_raw_tables(cur):
    cur.execute("TRUNCATE TABLE raw.orders_raw")
    cur.execute("TRUNCATE TABLE raw.products_raw")
    cur.execute("TRUNCATE TABLE raw.customers_raw")


def _resolve_mode(explicit_mode):
    if explicit_mode:
        return explicit_mode
    return os.getenv("PIPELINE_LOAD_MODE", "incremental").strip().lower()


def main():
    """
    Orchestrates RAW load:
    - Connect to PostgreSQL
    - Ensure RAW tables exist
    - Optionally truncate RAW tables (full refresh mode)
    - Fetch data from Fake Store API and load into RAW (incremental by default)
    - Verify final counts
    """
    parser = argparse.ArgumentParser(description="Load Fake Store data into PostgreSQL RAW")
    parser.add_argument(
        "--mode",
        choices=["incremental", "full_refresh"],
        default=None,
        help="Load mode. Defaults to PIPELINE_LOAD_MODE env var or incremental.",
    )
    args = parser.parse_args()

    load_dotenv()
    load_mode = _resolve_mode(args.mode)
    if load_mode not in {"incremental", "full_refresh"}:
        raise ValueError(
            "Invalid load mode. Use 'incremental' or 'full_refresh' via --mode or PIPELINE_LOAD_MODE."
        )

    print(f"Starting API-based load into PostgreSQL RAW schema (mode={load_mode})...")

    conn = None
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            dbname=os.getenv("POSTGRES_DB", "analytics"),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "postgres"),
        )
        print("PostgreSQL connection successful.")

        cur = conn.cursor()
        _ensure_raw_tables(cur)
        conn.commit()

        if load_mode == "full_refresh":
            print("Applying full refresh: truncating RAW tables...")
            _truncate_raw_tables(cur)
            conn.commit()
            print("RAW tables truncated.")
        else:
            print("Incremental mode: keeping existing RAW data.")

        cur.close()
        print("RAW tables ready for load.")

        print("Loading data from Fake Store API...")
        load_customers(conn)
        load_products(conn)
        load_orders(conn)

        print("Verifying final counts...")
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM raw.customers_raw")
        print(f"Customers: {cur.fetchone()[0]}")
        cur.execute("SELECT COUNT(*) FROM raw.products_raw")
        print(f"Products: {cur.fetchone()[0]}")
        cur.execute("SELECT COUNT(*) FROM raw.orders_raw")
        print(f"Orders: {cur.fetchone()[0]}")
        cur.close()

        print("Load complete. RAW data is ready for dbt.")

    except Exception as exc:
        print(f"Load failed: {exc}")
        raise
    finally:
        if conn:
            conn.close()
            print("PostgreSQL connection closed.")


if __name__ == "__main__":
    main()
