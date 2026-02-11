import os
import random
from datetime import datetime, timedelta

import snowflake.connector
from dotenv import load_dotenv

print("🚀 Loading sample data into Snowflake RAW...")

load_dotenv()

# Conecta ao Snowflake usando os valores que funcionaram
conn = snowflake.connector.connect(
    account="UZMOVYK-JJA45572",
    user=os.getenv("SNOWFLAKE_USER"),
    password=os.getenv("SNOWFLAKE_PASSWORD"),
    warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
    database="ANALYTICS",
    schema=os.getenv("SNOWFLAKE_SCHEMA"),
)

cur = conn.cursor()

# Apaga os dados antigos para garantir que a carga seja limpa
print("🧹 Cleaning old data...")
cur.execute("DELETE FROM RAW.CUSTOMERS_RAW;")
cur.execute("DELETE FROM RAW.PRODUCTS_RAW;")
cur.execute("DELETE FROM RAW.ORDERS_RAW;")
conn.commit()

print("📋 Creating RAW tables...")
cur.execute(
    "CREATE OR REPLACE TABLE RAW.customers_raw (customer_id STRING, customer_name STRING, email STRING, city STRING, state STRING, created_date TIMESTAMP)"
)
cur.execute(
    "CREATE OR REPLACE TABLE RAW.products_raw (product_id STRING, product_name STRING, category STRING, unit_price FLOAT, stock_quantity INT)"
)
cur.execute(
    "CREATE OR REPLACE TABLE RAW.orders_raw (order_id STRING, customer_id STRING, product_id STRING, order_date TIMESTAMP, quantity INT, unit_price FLOAT, total_amount FLOAT, status STRING)"
)
conn.commit()

print("👥 Generating 500 customers...")
customers_data = []
for i in range(1, 501):
    customers_data.append(
        (
            f"CUST_{i:04d}",
            f"Customer {i}",
            f"customer{i}@example.com",
            random.choice(["SP", "RJ", "BH", "POA", "CUR"]),
            random.choice(["SP", "RJ", "MG", "RS", "PR"]),
            datetime.now(),
        )
    )
cur.executemany(
    "INSERT INTO RAW.customers_raw VALUES (%s, %s, %s, %s, %s, %s)", customers_data
)


print("📦 Generating 100 products...")
products_data = []
for i in range(1, 101):
    products_data.append(
        (
            f"PROD_{i:04d}",
            f"Product {i}",
            random.choice(["Electronics", "Apparel", "Home Goods"]),
            round(random.uniform(10.0, 500.0), 2),
            random.randint(0, 100),
        )
    )
cur.executemany(
    "INSERT INTO RAW.products_raw VALUES (%s, %s, %s, %s, %s)", products_data
)


print("🛒 Generating 1000 orders...")
customer_ids = [f"CUST_{i:04d}" for i in range(1, 501)]
product_ids = [f"PROD_{i:04d}" for i in range(1, 101)]
base_date = datetime(2025, 1, 1)
orders_data = []
for i in range(1000):
    quantity = random.randint(1, 5)
    unit_price = 99.99
    orders_data.append(
        (
            f"ORD_{i + 1:06d}",
            random.choice(customer_ids),
            random.choice(product_ids),
            base_date + timedelta(days=random.randint(0, 365)),
            quantity,
            unit_price,
            round(quantity * unit_price, 2),
            random.choice(["completed", "pending", "cancelled"]),
        )
    )
cur.executemany(
    "INSERT INTO RAW.orders_raw VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", orders_data
)

conn.commit()

# Verification
cur.execute("SELECT COUNT(*) FROM RAW.orders_raw")
print(f"   📋 Orders: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM RAW.customers_raw")
print(f"   👥 Customers: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM RAW.products_raw")
print(f"   📦 Products: {cur.fetchone()[0]}")
print("✅ LOAD COMPLETE!")
print("🎉 RAW data is ready for dbt!")

cur.close()
conn.close()
