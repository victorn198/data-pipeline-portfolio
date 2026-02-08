# mcp_server_fastapi.py
import os
import json
import snowflake.connector
from dotenv import load_dotenv
from fastapi import FastAPI, Body
from pydantic import BaseModel
import uvicorn

load_dotenv()

def get_snowflake_connection():
    """Estabelece e retorna uma conexão com o Snowflake."""
    try:
        # Usando os valores hardcoded que já funcionaram
        conn = snowflake.connector.connect(
            user=os.getenv("SNOWFLAKE_USER"),
            password=os.getenv("SNOWFLAKE_PASSWORD"),
            account='UZMOVYK-JJA45572',
            warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
            database='ANALYTICS',
            schema=os.getenv("SNOWFLAKE_SCHEMA")
        )
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao Snowflake: {e}")
        return None

app = FastAPI()

class SQLQuery(BaseModel):
    sql: str

@app.post("/execute_sql")
def execute_sql_endpoint(query: SQLQuery):
    """Endpoint para executar uma consulta SQL."""
    print(f"Recebida consulta SQL: {query.sql}")
    conn = None
    try:
        conn = get_snowflake_connection()
        if not conn:
            return {"error": "Falha ao estabelecer conexão com o Snowflake"}

        cursor = conn.cursor(snowflake.connector.DictCursor)
        cursor.execute(query.sql)
        result = cursor.fetchall()
        
        rows = [dict(row) for row in result]
        return {"status": "success", "data": rows}
    except Exception as e:
        return {"error": f"Erro ao executar a consulta SQL: {str(e)}"}
    finally:
        if conn:
            conn.close()

@app.get("/")
def read_root():
    return {"message": "Servidor de consulta Snowflake está no ar. Use o endpoint /execute_sql."}

# Para rodar, use: uvicorn mcp_server_fastapi:app --reload
