import os

import psycopg2
from dotenv import load_dotenv

from fivetran_simulator.online_retail import order_rows

load_dotenv()

INSERT_BATCH_SIZE = int(os.getenv("RETAIL_INSERT_BATCH_SIZE", "5000"))


def load_orders(conn):
    """
    Loads order lines derived from the canonical UCI Online Retail transaction set.
    Incremental behavior: inserts only missing order line IDs.
    """
    rows = order_rows()
    cur = conn.cursor()
    try:
        cur.execute("SELECT order_line_id FROM raw.orders_raw")
        existing_ids = {row[0] for row in cur.fetchall()}
        rows_to_insert = [row for row in rows if row[0] not in existing_ids]
        if not rows_to_insert:
            print(f"Order lines already up-to-date (rows={len(existing_ids)}).")
            return

        print(
            f"Loading {len(rows_to_insert)} order lines from canonical Online Retail transactions..."
        )
        for start in range(0, len(rows_to_insert), INSERT_BATCH_SIZE):
            batch = rows_to_insert[start : start + INSERT_BATCH_SIZE]
            cur.executemany(
                "INSERT INTO raw.orders_raw (order_line_id, order_id, customer_id, product_id, order_date, quantity, unit_price, total_amount, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                batch,
            )
        conn.commit()
        print("Order lines loaded successfully.")
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
        cursor.execute("DELETE FROM raw.orders_raw;")
        conn.commit()
        cursor.close()

        load_orders(conn)

        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM raw.orders_raw")
        print(f"Verification: {cursor.fetchone()[0]} order lines in table.")
        cursor.close()
    finally:
        conn.close()
        print("PostgreSQL connection closed.")
