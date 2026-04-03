import os
import re
from typing import Any

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor

load_dotenv()

app = FastAPI(title="PostgreSQL Query API", version="1.0.0")

READ_ONLY_START_KEYWORDS = {"select", "with"}
MUTATING_SQL_KEYWORDS = {
    "insert",
    "update",
    "delete",
    "merge",
    "copy",
    "create",
    "alter",
    "drop",
    "truncate",
    "grant",
    "revoke",
    "call",
    "execute",
    "comment",
    "refresh",
    "reindex",
    "vacuum",
    "analyze",
    "cluster",
    "discard",
    "lock",
    "do",
}


class SQLQuery(BaseModel):
    sql: str


def get_postgres_connection():
    try:
        return psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            dbname=os.getenv("POSTGRES_DB", "analytics"),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "postgres"),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to connect to PostgreSQL: {exc}") from exc


def _strip_sql_comments_and_literals(sql: str) -> str:
    result: list[str] = []
    i = 0
    in_single_quote = False
    in_double_quote = False
    in_line_comment = False
    in_block_comment = False

    while i < len(sql):
        char = sql[i]
        next_char = sql[i + 1] if i + 1 < len(sql) else ""

        if in_line_comment:
            if char == "\n":
                in_line_comment = False
                result.append(char)
            i += 1
            continue

        if in_block_comment:
            if char == "*" and next_char == "/":
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if in_single_quote:
            if char == "'" and next_char == "'":
                i += 2
                continue
            if char == "'":
                in_single_quote = False
            i += 1
            continue

        if in_double_quote:
            if char == '"' and next_char == '"':
                i += 2
                continue
            if char == '"':
                in_double_quote = False
            i += 1
            continue

        if char == "-" and next_char == "-":
            in_line_comment = True
            i += 2
            continue

        if char == "/" and next_char == "*":
            in_block_comment = True
            i += 2
            continue

        if char == "'":
            in_single_quote = True
            i += 1
            continue

        if char == '"':
            in_double_quote = True
            i += 1
            continue

        result.append(char)
        i += 1

    return "".join(result)


def is_read_only_query(sql: str) -> bool:
    # Keep API safe for portfolio/demo usage: allow SELECT/CTE only.
    stripped_sql = _strip_sql_comments_and_literals(sql).strip()
    if not stripped_sql:
        return False

    statements = [part.strip() for part in stripped_sql.split(";") if part.strip()]
    if len(statements) != 1:
        return False

    tokens = re.findall(r"[A-Za-z_]+", statements[0].lower())
    if not tokens or tokens[0] not in READ_ONLY_START_KEYWORDS:
        return False

    if tokens[0] == "select" and "into" in tokens[1:]:
        return False

    return not any(token in MUTATING_SQL_KEYWORDS for token in tokens[1:])


@app.post("/execute_sql")
def execute_sql_endpoint(query: SQLQuery) -> dict[str, Any]:
    if not is_read_only_query(query.sql):
        raise HTTPException(status_code=400, detail="Only read-only queries (SELECT/CTE) are allowed.")

    conn = get_postgres_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query.sql)
            rows = cur.fetchall()
            return {"status": "success", "row_count": len(rows), "data": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"SQL execution error: {exc}") from exc
    finally:
        conn.close()


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "PostgreSQL query API is running. Use /execute_sql for read-only queries."}
