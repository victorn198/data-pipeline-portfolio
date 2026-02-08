import os
import json
from pathlib import Path
import snowflake.connector
from dotenv import load_dotenv
from fastmcp import FastMCP

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Instanciar o servidor FastMCP
mcp = FastMCP("snowflake")

def get_snowflake_connection():
    """Estabelece e retorna uma conexão com o Snowflake."""
    try:
        # ATENÇÃO: ACCOUNT e DATABASE foram inseridos diretamente
        # para contornar problemas na leitura do arquivo .env
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

@mcp.tool
def execute_sql(sql_query: str):
    """Executa uma consulta SQL no Snowflake e retorna os resultados como uma string JSON."""
    conn = None
    try:
        conn = get_snowflake_connection()
        if not conn:
            return json.dumps({"error": "Falha ao estabelecer conexão com o Snowflake"})

        cursor = conn.cursor(snowflake.connector.DictCursor)
        cursor.execute(sql_query)
        result = cursor.fetchall()
        
        rows = [dict(row) for row in result]
        return json.dumps({"status": "success", "data": rows})
    except Exception as e:
        return json.dumps({"error": f"Erro ao executar a consulta SQL: {e}"})
    finally:
        if conn:
            conn.close()

@mcp.tool
def list_tables(database: str, schema: str):
    """Lista as tabelas em um banco de dados e esquema específicos do Snowflake."""
    sql_query = f"SHOW TABLES IN {database}.{schema};"
    return execute_sql(sql_query)

@mcp.tool
def get_table_schema(database: str, schema: str, table: str):
    """Descreve o esquema de uma tabela específica do Snowflake."""
    sql_query = f"DESCRIBE TABLE {database}.{schema}.{table};"
    return execute_sql(sql_query)

if __name__ == "__main__":
    mcp.run()
