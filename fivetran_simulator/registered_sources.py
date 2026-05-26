from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from uuid import uuid4

import psycopg2
import yaml
from dotenv import load_dotenv
from psycopg2 import sql


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY_PATH = Path(__file__).with_name("source_registry.yml")
SUPPORTED_SOURCE_TYPES = {
    "file_csv",
    "file_json",
    "api_paginated_json",
}
SUPPORTED_LOAD_MODES = {"full_refresh", "append"}
METADATA_COLUMNS = {
    "source_system",
    "source_entity",
    "load_batch_id",
    "loaded_at",
    "record_hash",
}


class SourceRegistryError(RuntimeError):
    pass


@dataclass(frozen=True)
class SourceDefinition:
    name: str
    source_type: str
    path: Path
    target_schema: str
    target_table: str
    load_mode: str
    primary_key: str
    grain: str
    business_purpose: str
    columns: tuple[str, ...]
    records_path: str | None = None
    next_page_path: str | None = None

    @property
    def relation_name(self) -> str:
        return f"{self.target_schema}.{self.target_table}"


@dataclass(frozen=True)
class SourceProfile:
    row_count: int
    duplicate_key_count: int
    null_counts: dict[str, int]


@dataclass(frozen=True)
class LoadResult:
    source_name: str
    target_relation: str
    load_batch_id: str
    inserted_rows: int
    profile: SourceProfile


def load_registry(registry_path: Path = DEFAULT_REGISTRY_PATH) -> list[SourceDefinition]:
    with registry_path.open("r", encoding="utf-8") as handle:
        payload = yaml.safe_load(handle) or {}

    if payload.get("version") != 1:
        raise SourceRegistryError("source registry must declare version: 1")

    raw_sources = payload.get("sources")
    if not isinstance(raw_sources, list) or not raw_sources:
        raise SourceRegistryError("source registry must contain a non-empty sources list")

    sources: list[SourceDefinition] = []
    seen_names: set[str] = set()
    for item in raw_sources:
        if not isinstance(item, dict):
            raise SourceRegistryError("each source registry entry must be a mapping")
        source = _parse_source_definition(item)
        if source.name in seen_names:
            raise SourceRegistryError(f"duplicate source name: {source.name}")
        seen_names.add(source.name)
        sources.append(source)

    return sources


def load_registered_sources(
    conn,
    registry_path: Path = DEFAULT_REGISTRY_PATH,
    only: Iterable[str] | None = None,
) -> list[LoadResult]:
    requested = set(only or [])
    results: list[LoadResult] = []

    for source in load_registry(registry_path):
        if requested and source.name not in requested:
            continue
        results.append(load_source(conn, source))

    if requested:
        loaded_names = {result.source_name for result in results}
        missing = requested - loaded_names
        if missing:
            raise SourceRegistryError(f"unknown registered source(s): {', '.join(sorted(missing))}")

    return results


def load_source(conn, source: SourceDefinition) -> LoadResult:
    rows = read_source_rows(source)
    batch_id = str(uuid4())
    loaded_at = datetime.now(timezone.utc)
    profile = profile_rows(rows, source.primary_key, source.columns)

    cur = conn.cursor()
    try:
        ensure_metadata_tables(cur)
        ensure_raw_table(cur, source)

        if source.load_mode == "full_refresh":
            cur.execute(
                sql.SQL("TRUNCATE TABLE {}.{}").format(
                    sql.Identifier(source.target_schema),
                    sql.Identifier(source.target_table),
                )
            )

        prepared_rows = [_prepare_row(row, source, batch_id, loaded_at) for row in rows]
        if prepared_rows:
            insert_columns = list(source.columns) + sorted(METADATA_COLUMNS)
            cur.executemany(
                _build_insert_statement(source, insert_columns),
                [[row.get(column) for column in insert_columns] for row in prepared_rows],
            )

        insert_load_audit(cur, source, batch_id, loaded_at, len(prepared_rows), profile)
        insert_profile_results(cur, source, batch_id, loaded_at, profile)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()

    return LoadResult(
        source_name=source.name,
        target_relation=source.relation_name,
        load_batch_id=batch_id,
        inserted_rows=len(prepared_rows),
        profile=profile,
    )


def read_source_rows(source: SourceDefinition) -> list[dict[str, Any]]:
    if not source.path.exists():
        raise SourceRegistryError(f"source file not found: {source.path}")

    if source.source_type == "file_csv":
        with source.path.open("r", encoding="utf-8", newline="") as handle:
            return [dict(row) for row in csv.DictReader(handle)]

    if source.source_type == "file_json":
        with source.path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        if not isinstance(payload, list) or not all(isinstance(row, dict) for row in payload):
            raise SourceRegistryError("JSON sources must contain a list of objects")
        return [dict(row) for row in payload]

    if source.source_type == "api_paginated_json":
        return _read_paginated_json_source(source)

    raise SourceRegistryError(f"unsupported source type: {source.source_type}")


def profile_rows(
    rows: list[dict[str, Any]],
    primary_key: str,
    columns: tuple[str, ...],
) -> SourceProfile:
    key_values = [_normalize_value(row.get(primary_key)) for row in rows]
    seen: set[str] = set()
    duplicate_key_count = 0
    for value in key_values:
        if value == "":
            continue
        if value in seen:
            duplicate_key_count += 1
        seen.add(value)

    null_counts = {
        column: sum(1 for row in rows if _normalize_value(row.get(column)) == "")
        for column in columns
    }

    return SourceProfile(
        row_count=len(rows),
        duplicate_key_count=duplicate_key_count,
        null_counts=null_counts,
    )


def ensure_metadata_tables(cur) -> None:
    cur.execute("CREATE SCHEMA IF NOT EXISTS raw")
    cur.execute("CREATE SCHEMA IF NOT EXISTS data_quality")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS raw.source_load_batches (
            load_batch_id TEXT PRIMARY KEY,
            source_name TEXT NOT NULL,
            source_type TEXT NOT NULL,
            target_relation TEXT NOT NULL,
            load_mode TEXT NOT NULL,
            row_count INTEGER NOT NULL,
            duplicate_key_count INTEGER NOT NULL,
            loaded_at TIMESTAMPTZ NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS data_quality.source_profile_results (
            load_batch_id TEXT NOT NULL,
            source_name TEXT NOT NULL,
            column_name TEXT NOT NULL,
            metric_name TEXT NOT NULL,
            metric_value NUMERIC NOT NULL,
            profiled_at TIMESTAMPTZ NOT NULL
        )
        """
    )


def ensure_raw_table(cur, source: SourceDefinition) -> None:
    cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(source.target_schema)))
    raw_columns = [
        sql.SQL("{} TEXT").format(sql.Identifier(column))
        for column in source.columns
    ]
    metadata_columns = [
        sql.SQL("source_system TEXT NOT NULL"),
        sql.SQL("source_entity TEXT NOT NULL"),
        sql.SQL("load_batch_id TEXT NOT NULL"),
        sql.SQL("loaded_at TIMESTAMPTZ NOT NULL"),
        sql.SQL("record_hash TEXT NOT NULL"),
    ]
    cur.execute(
        sql.SQL("CREATE TABLE IF NOT EXISTS {}.{} ({})").format(
            sql.Identifier(source.target_schema),
            sql.Identifier(source.target_table),
            sql.SQL(", ").join(raw_columns + metadata_columns),
        )
    )


def insert_load_audit(
    cur,
    source: SourceDefinition,
    batch_id: str,
    loaded_at: datetime,
    inserted_rows: int,
    profile: SourceProfile,
) -> None:
    cur.execute(
        """
        INSERT INTO raw.source_load_batches (
            load_batch_id,
            source_name,
            source_type,
            target_relation,
            load_mode,
            row_count,
            duplicate_key_count,
            loaded_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            batch_id,
            source.name,
            source.source_type,
            source.relation_name,
            source.load_mode,
            inserted_rows,
            profile.duplicate_key_count,
            loaded_at,
        ),
    )


def insert_profile_results(
    cur,
    source: SourceDefinition,
    batch_id: str,
    loaded_at: datetime,
    profile: SourceProfile,
) -> None:
    rows = [
        (batch_id, source.name, "__table__", "row_count", profile.row_count, loaded_at),
        (
            batch_id,
            source.name,
            source.primary_key,
            "duplicate_key_count",
            profile.duplicate_key_count,
            loaded_at,
        ),
    ]
    rows.extend(
        (batch_id, source.name, column, "null_count", count, loaded_at)
        for column, count in profile.null_counts.items()
    )
    cur.executemany(
        """
        INSERT INTO data_quality.source_profile_results (
            load_batch_id,
            source_name,
            column_name,
            metric_name,
            metric_value,
            profiled_at
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        rows,
    )


def _parse_source_definition(item: dict[str, Any]) -> SourceDefinition:
    required = (
        "name",
        "source_type",
        "path",
        "target_schema",
        "target_table",
        "load_mode",
        "primary_key",
        "grain",
        "business_purpose",
        "columns",
    )
    missing = [key for key in required if key not in item]
    if missing:
        raise SourceRegistryError(f"source entry missing required keys: {', '.join(missing)}")

    source_type = str(item["source_type"]).strip()
    if source_type not in SUPPORTED_SOURCE_TYPES:
        raise SourceRegistryError(f"unsupported source_type for {item['name']}: {source_type}")

    load_mode = str(item["load_mode"]).strip()
    if load_mode not in SUPPORTED_LOAD_MODES:
        raise SourceRegistryError(f"unsupported load_mode for {item['name']}: {load_mode}")

    columns_payload = item["columns"]
    if not isinstance(columns_payload, list) or not columns_payload:
        raise SourceRegistryError(f"source {item['name']} must define at least one column")

    columns: list[str] = []
    for column in columns_payload:
        if isinstance(column, dict):
            column_name = str(column.get("name", "")).strip()
        else:
            column_name = str(column).strip()
        if not column_name:
            raise SourceRegistryError(f"source {item['name']} contains an empty column name")
        columns.append(column_name)

    primary_key = str(item["primary_key"]).strip()
    if primary_key not in columns:
        raise SourceRegistryError(f"primary_key for {item['name']} must be present in columns")

    path = Path(str(item["path"]))
    if not path.is_absolute():
        path = PROJECT_ROOT / path

    return SourceDefinition(
        name=str(item["name"]).strip(),
        source_type=source_type,
        path=path,
        target_schema=str(item["target_schema"]).strip(),
        target_table=str(item["target_table"]).strip(),
        load_mode=load_mode,
        primary_key=primary_key,
        grain=str(item["grain"]).strip(),
        business_purpose=str(item["business_purpose"]).strip(),
        columns=tuple(columns),
        records_path=str(item.get("records_path", "records")).strip() or "records",
        next_page_path=str(item.get("next_page_path", "next_page")).strip() or "next_page",
    )


def _read_paginated_json_source(source: SourceDefinition) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    current_path: Path | None = source.path
    visited: set[Path] = set()

    for _ in range(100):
        if current_path is None:
            return rows
        resolved_path = current_path.resolve()
        if resolved_path in visited:
            raise SourceRegistryError(f"pagination loop detected for source {source.name}: {resolved_path}")
        visited.add(resolved_path)
        if not resolved_path.exists():
            raise SourceRegistryError(f"paginated source page not found: {resolved_path}")

        with resolved_path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        if not isinstance(payload, dict):
            raise SourceRegistryError(f"paginated source page must be an object: {resolved_path}")

        page_records = payload.get(source.records_path or "records", [])
        if not isinstance(page_records, list) or not all(isinstance(row, dict) for row in page_records):
            raise SourceRegistryError(f"paginated source records must be a list of objects: {resolved_path}")
        rows.extend(dict(row) for row in page_records)

        next_page = payload.get(source.next_page_path or "next_page")
        if next_page in (None, ""):
            return rows
        if not isinstance(next_page, str):
            raise SourceRegistryError(f"next_page must be a string or null: {resolved_path}")
        current_path = resolved_path.parent / next_page

    raise SourceRegistryError(f"pagination limit exceeded for source {source.name}")


def _prepare_row(
    row: dict[str, Any],
    source: SourceDefinition,
    batch_id: str,
    loaded_at: datetime,
) -> dict[str, Any]:
    prepared = {
        column: _normalize_value(row.get(column))
        for column in source.columns
    }
    prepared.update(
        {
            "source_system": source.name,
            "source_entity": source.target_table.removesuffix("_raw"),
            "load_batch_id": batch_id,
            "loaded_at": loaded_at,
            "record_hash": _row_hash(prepared, source.columns),
        }
    )
    return prepared


def _build_insert_statement(source: SourceDefinition, insert_columns: list[str]) -> sql.Composed:
    return sql.SQL("INSERT INTO {}.{} ({}) VALUES ({})").format(
        sql.Identifier(source.target_schema),
        sql.Identifier(source.target_table),
        sql.SQL(", ").join(sql.Identifier(column) for column in insert_columns),
        sql.SQL(", ").join(sql.Placeholder() for _ in insert_columns),
    )


def _normalize_value(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _row_hash(row: dict[str, Any], columns: tuple[str, ...]) -> str:
    payload = json.dumps(
        {column: row.get(column, "") for column in columns},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _connect_from_env():
    load_dotenv()
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        dbname=os.getenv("POSTGRES_DB", "analytics"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "postgres"),
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load registered file sources into PostgreSQL RAW.")
    parser.add_argument(
        "--source",
        action="append",
        dest="sources",
        help="Registered source name to load. Repeat to load multiple sources. Defaults to all.",
    )
    parser.add_argument(
        "--registry",
        default=str(DEFAULT_REGISTRY_PATH),
        help="Path to source registry YAML.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    conn = _connect_from_env()
    try:
        results = load_registered_sources(
            conn,
            registry_path=Path(args.registry),
            only=args.sources,
        )
    finally:
        conn.close()

    for result in results:
        print(
            f"{result.source_name}: loaded {result.inserted_rows} rows into "
            f"{result.target_relation} (batch={result.load_batch_id})"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
