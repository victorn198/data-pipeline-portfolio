import os

import psycopg2
from dotenv import load_dotenv

from fivetran_simulator.online_retail import customer_rows

load_dotenv()

INSERT_BATCH_SIZE = int(os.getenv("RETAIL_INSERT_BATCH_SIZE", "5000"))


def load_customers(conn):
    """
    Loads customers derived from the canonical UCI Online Retail transaction set.
    Incremental behavior: inserts only missing customer IDs.
    """
    rows = customer_rows()
    cur = conn.cursor()
    try:
        cur.execute("SELECT customer_id FROM raw.customers_raw")
        existing_ids = {row[0] for row in cur.fetchall()}
        rows_to_insert = [row for row in rows if row[0] not in existing_ids]
        if not rows_to_insert:
            print(f"Customers already up-to-date (rows={len(existing_ids)}).")
            return

        print(
            f"Loading {len(rows_to_insert)} customers from canonical Online Retail transactions..."
        )
        for start in range(0, len(rows_to_insert), INSERT_BATCH_SIZE):
            batch = rows_to_insert[start : start + INSERT_BATCH_SIZE]
            cur.executemany(
                "INSERT INTO raw.customers_raw (customer_id, customer_name, email, city, state, created_date) VALUES (%s, %s, %s, %s, %s, %s)",
                batch,
            )
        conn.commit()
        print("Customers loaded successfully.")
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
        cursor.execute("DELETE FROM raw.customers_raw;")
        conn.commit()
        cursor.close()

        load_customers(conn)

        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM raw.customers_raw")
        print(f"Verification: {cursor.fetchone()[0]} customers in table.")
        cursor.close()
    finally:
        conn.close()
        print("PostgreSQL connection closed.")
