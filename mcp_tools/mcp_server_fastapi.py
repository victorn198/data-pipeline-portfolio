import logging
import os
import re
from typing import Any

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor

load_dotenv()

logger = logging.getLogger("mcp_tools.security")

MCP_TOKEN = os.getenv("MCP_API_TOKEN", "").strip()
MCP_STATEMENT_TIMEOUT_MS = int(os.getenv("MCP_STATEMENT_TIMEOUT_MS", "10000"))
MCP_ROW_LIMIT = int(os.getenv("MCP_ROW_LIMIT", "5000"))

app = FastAPI(title="PostgreSQL Query API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        o.strip()
        for o in os.getenv(
            "MCP_ALLOWED_ORIGINS",
            "http://127.0.0.1:8601,http://localhost:8601",
        ).split(",")
        if o.strip()
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

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


def _require_mcp_auth(request: Request) -> None:
    """Reject requests when MCP_API_TOKEN is set and the caller does not provide it."""
    if not MCP_TOKEN:
        return  # auth disabled (local dev without token)
    auth_header = request.headers.get("authorization", "")
    provided = auth_header.removeprefix("Bearer ").strip()
    if not provided or provided != MCP_TOKEN:
        logger.warning("MCP auth rejected from %s", request.client.host if request.client else "unknown")
        raise HTTPException(status_code=403, detail="Invalid or missing MCP API token.")


@app.post("/execute_sql")
def execute_sql_endpoint(query: SQLQuery, request: Request) -> dict[str, Any]:
    _require_mcp_auth(request)

    if not is_read_only_query(query.sql):
        logger.warning("Blocked non-read-only query: %.120s", query.sql)
        raise HTTPException(status_code=400, detail="Only read-only queries (SELECT/CTE) are allowed.")

    conn = get_postgres_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Enforce read-only at the database level (defense in depth)
            cur.execute("SET TRANSACTION READ ONLY")
            cur.execute(f"SET statement_timeout = {MCP_STATEMENT_TIMEOUT_MS}")
            cur.execute(query.sql)
            rows = cur.fetchmany(MCP_ROW_LIMIT)
            return {"status": "success", "row_count": len(rows), "data": rows}
    except psycopg2.errors.ReadOnlySqlTransaction:
        raise HTTPException(status_code=400, detail="Only read-only queries are allowed.")
    except psycopg2.errors.QueryCanceled:
        raise HTTPException(status_code=408, detail="Query exceeded time limit.")
    except Exception as exc:
        logger.exception("SQL execution error")
        raise HTTPException(status_code=500, detail="Internal query execution error.") from exc
    finally:
        conn.close()


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "PostgreSQL query API is running. Use /execute_sql for read-only queries."}
