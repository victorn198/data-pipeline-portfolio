import os
import snowflake.connector
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

print('🚀 Carregando dados de exemplo no Snowflake RAW...')

load_dotenv()

conn = snowflake.connector.connect(
    account=os.getenv('SNOWFLAKE_ACCOUNT'),
    user=os.getenv('SNOWFLAKE_USER'),
    password=os.getenv('SNOWFLAKE_PASSWORD'),
    warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
    database=os.getenv('SNOWFLAKE_DATABASE'),
    schema=os.getenv('SNOWFLAKE_SCHEMA')
)

cur = conn.cursor()

print('📋 Criando tabelas RAW...')
cur.execute('CREATE OR REPLACE TABLE RAW.customers_raw (customer_id STRING, customer_name STRING, email STRING, city STRING, state STRING, created_date TIMESTAMP)')
cur.execute('CREATE OR REPLACE TABLE RAW.products_raw (product_id STRING, product_name STRING, category STRING, unit_price FLOAT, stock_quantity INT)')
cur.execute('CREATE OR REPLACE TABLE RAW.orders_raw (order_id STRING, customer_id STRING, product_id STRING, order_date TIMESTAMP, quantity INT, unit_price FLOAT, total_amount FLOAT, status STRING)')
conn.commit()

print('👥 500 clientes...')
for i in range(1, 501):
    cur.execute("INSERT INTO RAW.customers_raw VALUES (%s, %s, %s, %s, %s, %s)", 
                (f'CUST_{i:04d}', f'Cliente {i}', f'cliente{i}@exemplo.com', 
                 random.choice(['SP','RJ','BH','POA','CUR']), 
                 random.choice(['SP','RJ','MG','RS','PR']), datetime.now()))

print('📦 100 produtos...')
for i in range(1, 101):
    cur.execute("INSERT INTO RAW.products_raw VALUES (%s, %s, %s, %s, %s)", 
                (f'PROD_{i:04d}', f'Produto {i}', 
                 random.choice(['Eletrônicos','Roupas','Casa']), 
                 round(random.uniform(10.0,500.0),2), random.randint(0,100)))

print('🛒 1000 pedidos...')
customer_ids = [f'CUST_{i:04d}' for i in range(1,501)]
product_ids = [f'PROD_{i:04d}' for i in range(1,101)]
base_date = datetime(2025,1,1)

for i in range(1000):
    cur.execute("INSERT INTO RAW.orders_raw VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", 
                (f'ORD_{i+1:06d}', random.choice(customer_ids), random.choice(product_ids), 
                 base_date + timedelta(days=random.randint(0,365)), 
                 random.randint(1,5), 99.99, 
                 round(random.randint(1,5)*99.99,2), 
                 random.choice(['completed','pending','cancelled'])))

conn.commit()

cur.execute('SELECT COUNT(*) FROM RAW.orders_raw'); print(f'📋 Pedidos: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(*) FROM RAW.customers_raw'); print(f'👥 Clientes: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(*) FROM RAW.products_raw'); print(f'📦 Produtos: {cur.fetchone()[0]}')
print('🎉 Dados RAW prontos para dbt!')

cur.close()
conn.close()
