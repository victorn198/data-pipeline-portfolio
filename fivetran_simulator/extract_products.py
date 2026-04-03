import os
import time
from random import Random

import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.getenv("FAKESTORE_API_BASE_URL", "https://fakestoreapi.com")
API_TIMEOUT_SECONDS = int(os.getenv("FAKESTORE_TIMEOUT_SECONDS", "20"))
API_MAX_RETRIES = int(os.getenv("FAKESTORE_MAX_RETRIES", "3"))
TARGET_PRODUCTS = int(os.getenv("FAKESTORE_TARGET_PRODUCTS", "2000"))
INSERT_BATCH_SIZE = int(os.getenv("FAKESTORE_INSERT_BATCH_SIZE", "5000"))
RANDOM_SEED = int(os.getenv("FAKESTORE_RANDOM_SEED", "42"))


def _fetch_products():
    endpoint = f"{API_BASE_URL}/products"
    last_error = None

    for attempt in range(1, API_MAX_RETRIES + 1):
        try:
            response = requests.get(endpoint, timeout=API_TIMEOUT_SECONDS)
            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, list):
                raise ValueError("Unexpected products payload format (expected list).")
            return payload
        except (requests.RequestException, ValueError) as exc:
            last_error = exc
            if attempt < API_MAX_RETRIES:
                time.sleep(attempt)

    raise RuntimeError(f"Failed to fetch products from Fake Store API: {last_error}")


def load_products(conn):
    """
    Fetches products from Fake Store API and scales them into raw.products_raw.
    Incremental behavior: inserts only missing product IDs.
    """
    products = _fetch_products()
    if not products:
        raise RuntimeError("Products endpoint returned no records.")

    target_products = max(len(products), TARGET_PRODUCTS)
    rng = Random(RANDOM_SEED + 7)
    products_data = []

    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM raw.products_raw")
        existing_products = int(cur.fetchone()[0] or 0)
        cur.execute(
            "SELECT COALESCE(MAX(CAST(NULLIF(REGEXP_REPLACE(product_id, '\\D', '', 'g'), '') AS BIGINT)), 0) FROM raw.products_raw"
        )
        max_product_number = int(cur.fetchone()[0] or 0)
        start_index = max_product_number

        if start_index >= target_products:
            print(
                f"Products already up-to-date (rows={existing_products}, max_id={max_product_number}, target={target_products}). No new records inserted."
            )
            return

        new_products = target_products - start_index
        print(
            f"Loading {new_products} new products from API templates (rows={existing_products}, max_id={max_product_number}, target={target_products})..."
        )

        for i in range(start_index, target_products):
            template = products[i % len(products)]
            product_number = i + 1
            rating = template.get("rating", {})
            base_stock = int(rating.get("count", 0) or 0)
            base_price = round(float(template.get("price", 10.0) or 10.0), 2)
            price_multiplier = 0.85 + (rng.random() * 0.5)
            unit_price = round(max(1.0, base_price * price_multiplier), 2)
            stock_quantity = max(0, base_stock + rng.randint(0, 250))

            products_data.append(
                (
                    f"PROD_{product_number:06d}",
                    f"{str(template.get('title', 'Product')).strip()} | SKU-{product_number:06d}",
                    str(template.get("category", "uncategorized")),
                    unit_price,
                    stock_quantity,
                )
            )

            if len(products_data) >= INSERT_BATCH_SIZE:
                cur.executemany(
                    "INSERT INTO raw.products_raw (product_id, product_name, category, unit_price, stock_quantity) VALUES (%s, %s, %s, %s, %s)",
                    products_data,
                )
                products_data.clear()

        if products_data:
            cur.executemany(
                "INSERT INTO raw.products_raw (product_id, product_name, category, unit_price, stock_quantity) VALUES (%s, %s, %s, %s, %s)",
                products_data,
            )
        conn.commit()
        print("Products loaded successfully.")
    finally:
        cur.close()


if __name__ == "__main__":
    load_dotenv()

    conn = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        dbname=os.getenv("POSTGRES_DB", "analytics"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "postgres"),
    )

    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM raw.products_raw;")
        conn.commit()
        cursor.close()

        load_products(conn)

        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM raw.products_raw")
        print(f"Verification: {cursor.fetchone()[0]} products in table.")
        cursor.close()
    finally:
        conn.close()
        print("PostgreSQL connection closed.")
