import os

import psycopg2
from dotenv import load_dotenv

from fivetran_simulator.online_retail import product_rows

load_dotenv()

INSERT_BATCH_SIZE = int(os.getenv("RETAIL_INSERT_BATCH_SIZE", "5000"))


def load_products(conn):
    """
    Loads products derived from the canonical UCI Online Retail transaction set.
    Incremental behavior: inserts only missing product IDs.
    """
    rows = product_rows()
    cur = conn.cursor()
    try:
        cur.execute("SELECT product_id FROM raw.products_raw")
        existing_ids = {row[0] for row in cur.fetchall()}
        rows_to_insert = [row for row in rows if row[0] not in existing_ids]
        if not rows_to_insert:
            print(f"Products already up-to-date (rows={len(existing_ids)}).")
            return

        print(
            f"Loading {len(rows_to_insert)} products from canonical Online Retail transactions..."
        )
        for start in range(0, len(rows_to_insert), INSERT_BATCH_SIZE):
            batch = rows_to_insert[start : start + INSERT_BATCH_SIZE]
            cur.executemany(
                "INSERT INTO raw.products_raw (product_id, product_name, category, unit_price, stock_quantity) VALUES (%s, %s, %s, %s, %s)",
                batch,
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
