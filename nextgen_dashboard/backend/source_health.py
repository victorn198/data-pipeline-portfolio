from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from sqlalchemy import text

from .data_source import DashboardDataSource, DashboardSettings
from .models import (
    DetailTablePayload,
    SourceHealthCard,
    SourceHealthPayload,
    TableColumn,
    TableRow,
)


class SourceHealthService:
    def __init__(
        self,
        settings: DashboardSettings | None = None,
        registry_path: Path | None = None,
    ) -> None:
        self.settings = settings or DashboardSettings.from_env()
        self.data_source = DashboardDataSource(self.settings)
        self.registry_path = registry_path or (
            Path(__file__).resolve().parents[2]
            / "fivetran_simulator"
            / "source_registry.yml"
        )

    def build_payload(self) -> SourceHealthPayload:
        generated_at = datetime.now(timezone.utc).isoformat()

        if self.settings.data_source_mode != "database":
            return self._unavailable_payload(
                generated_at,
                "Source health requires database mode because load audit tables live in PostgreSQL.",
            )

        try:
            registry = self._load_registry_index()
            latest_loads = [
                row
                for row in self._latest_loads()
                if row.get("source_name") in registry
            ]
            profile_rows = self._profile_rows()
        except Exception as exc:
            return self._unavailable_payload(generated_at, str(exc))

        source_count = len(latest_loads)
        total_rows = sum(int(row.get("row_count") or 0) for row in latest_loads)
        duplicate_keys = sum(
            int(row.get("duplicate_key_count") or 0) for row in latest_loads
        )
        total_nulls = sum(
            int(row.get("metric_value") or 0)
            for row in profile_rows
            if row.get("metric_name") == "null_count"
        )

        cards = [
            SourceHealthCard(
                key="sources_loaded",
                title="Sources Loaded",
                value=str(source_count),
                subtitle="Latest batch per registered source",
                status="ok" if source_count else "warning",
            ),
            SourceHealthCard(
                key="rows_loaded",
                title="Rows Loaded",
                value=f"{total_rows:,}",
                subtitle="Rows in the latest source batches",
                status="ok",
            ),
            SourceHealthCard(
                key="duplicate_keys",
                title="Duplicate Keys",
                value=f"{duplicate_keys:,}",
                subtitle="Detected before staging deduplication",
                status="ok" if duplicate_keys == 0 else "warning",
            ),
            SourceHealthCard(
                key="null_values",
                title="Profiled Nulls",
                value=f"{total_nulls:,}",
                subtitle="Null or blank values across registered columns",
                status="ok" if total_nulls == 0 else "warning",
            ),
        ]

        return SourceHealthPayload(
            status="ok",
            subtitle="Registered source loads, batch metadata, duplicate-key checks, and null profiling.",
            generated_at=generated_at,
            cards=cards,
            loads_table=self._loads_table(latest_loads, registry),
            profile_table=self._profile_table(profile_rows),
            summary=[
                "Registered file sources now land in raw with batch metadata before dbt staging.",
                "Use duplicate-key and null counts to decide whether a source needs cleaning rules before it becomes BI-ready.",
                "This view makes source reliability visible inside the analytics product instead of hiding it in logs.",
            ],
        )

    def _latest_loads(self) -> list[dict[str, Any]]:
        query = text(
            """
            select distinct on (source_name)
                source_name,
                source_type,
                target_relation,
                load_mode,
                row_count,
                duplicate_key_count,
                loaded_at,
                load_batch_id
            from raw.source_load_batches
            order by source_name, loaded_at desc
            """
        )
        engine = self.data_source._get_engine()
        with engine.connect() as conn:
            return [dict(row) for row in conn.execute(query).mappings()]

    def _profile_rows(self) -> list[dict[str, Any]]:
        query = text(
            """
            with latest_batches as (
                select distinct on (source_name)
                    source_name,
                    load_batch_id
                from raw.source_load_batches
                order by source_name, loaded_at desc
            )
            select
                p.source_name,
                p.column_name,
                p.metric_name,
                p.metric_value,
                p.profiled_at
            from data_quality.source_profile_results p
            join latest_batches b
              on p.source_name = b.source_name
             and p.load_batch_id = b.load_batch_id
            order by p.source_name, p.column_name, p.metric_name
            """
        )
        engine = self.data_source._get_engine()
        with engine.connect() as conn:
            return [dict(row) for row in conn.execute(query).mappings()]

    def _load_registry_index(self) -> dict[str, dict[str, Any]]:
        if not self.registry_path.exists():
            return {}
        with self.registry_path.open("r", encoding="utf-8") as handle:
            payload = yaml.safe_load(handle) or {}
        sources = payload.get("sources", [])
        if not isinstance(sources, list):
            return {}
        return {
            str(source.get("name")): source
            for source in sources
            if isinstance(source, dict) and source.get("name")
        }

    def _loads_table(
        self,
        loads: list[dict[str, Any]],
        registry: dict[str, dict[str, Any]],
    ) -> DetailTablePayload:
        columns = [
            TableColumn(key="source", label="Source"),
            TableColumn(key="type", label="Type"),
            TableColumn(key="target", label="Target"),
            TableColumn(key="rows", label="Rows"),
            TableColumn(key="duplicates", label="Duplicates"),
            TableColumn(key="loaded_at", label="Loaded At"),
            TableColumn(key="purpose", label="Purpose"),
        ]
        rows = []
        for item in loads:
            source_name = str(item.get("source_name") or "")
            registered = registry.get(source_name, {})
            rows.append(
                TableRow(
                    values={
                        "source": source_name,
                        "type": str(item.get("source_type") or ""),
                        "target": str(item.get("target_relation") or ""),
                        "rows": f"{int(item.get('row_count') or 0):,}",
                        "duplicates": f"{int(item.get('duplicate_key_count') or 0):,}",
                        "loaded_at": _format_timestamp(item.get("loaded_at")),
                        "purpose": str(registered.get("business_purpose") or ""),
                    }
                )
            )
        return DetailTablePayload(
            title="Latest Source Loads",
            columns=columns,
            rows=rows,
        )

    def _profile_table(self, profile_rows: list[dict[str, Any]]) -> DetailTablePayload:
        columns = [
            TableColumn(key="source", label="Source"),
            TableColumn(key="column", label="Column"),
            TableColumn(key="metric", label="Metric"),
            TableColumn(key="value", label="Value"),
            TableColumn(key="profiled_at", label="Profiled At"),
        ]
        return DetailTablePayload(
            title="Source Profiling Results",
            columns=columns,
            rows=[
                TableRow(
                    values={
                        "source": str(item.get("source_name") or ""),
                        "column": str(item.get("column_name") or ""),
                        "metric": str(item.get("metric_name") or ""),
                        "value": f"{float(item.get('metric_value') or 0):,.0f}",
                        "profiled_at": _format_timestamp(item.get("profiled_at")),
                    }
                )
                for item in profile_rows
            ],
        )

    def _unavailable_payload(self, generated_at: str, message: str) -> SourceHealthPayload:
        return SourceHealthPayload(
            status="unavailable",
            subtitle=message,
            generated_at=generated_at,
            cards=[
                SourceHealthCard(
                    key="unavailable",
                    title="Source Health",
                    value="Unavailable",
                    subtitle=message,
                    status="warning",
                )
            ],
            loads_table=DetailTablePayload(title="Latest Source Loads"),
            profile_table=DetailTablePayload(title="Source Profiling Results"),
            summary=[message],
        )

    def build_catalog_payload(self) -> dict[str, Any]:
        generated_at = datetime.now(timezone.utc).isoformat()
        registry = self._load_registry_index()
        latest_loads: dict[str, dict[str, Any]] = {}
        load_status = "not_loaded"
        load_message = "Source registry is available; load audit tables are not connected in this mode."

        if self.settings.data_source_mode == "database":
            try:
                latest_loads = {
                    str(row.get("source_name") or ""): row
                    for row in self._latest_loads()
                }
                load_status = "loaded"
                load_message = "Registered sources are connected to load audit metadata."
            except Exception as exc:
                load_status = "registry_only"
                load_message = str(exc)

        sources = []
        for source_name, source in sorted(registry.items()):
            latest = latest_loads.get(source_name, {})
            columns = [
                str(column.get("name"))
                for column in source.get("columns", [])
                if isinstance(column, dict) and column.get("name")
            ]
            source_type = str(source.get("source_type") or "")
            row_count = int(latest.get("row_count") or 0)
            duplicate_count = int(latest.get("duplicate_key_count") or 0)
            sources.append(
                {
                    "name": source_name,
                    "label": _source_label(source_name),
                    "source_type": source_type,
                    "type_label": _source_type_label(source_type),
                    "connection_group": _source_group(source_type),
                    "path": str(source.get("path") or ""),
                    "target": ".".join(
                        item
                        for item in [
                            str(source.get("target_schema") or ""),
                            str(source.get("target_table") or ""),
                        ]
                        if item
                    ),
                    "load_mode": str(source.get("load_mode") or ""),
                    "primary_key": str(source.get("primary_key") or ""),
                    "grain": str(source.get("grain") or ""),
                    "business_purpose": str(source.get("business_purpose") or ""),
                    "columns": columns,
                    "row_count": row_count,
                    "duplicate_key_count": duplicate_count,
                    "loaded_at": _format_timestamp(latest.get("loaded_at")),
                    "status": "loaded" if latest else "registered",
                    "status_label": "Connected" if latest else "Registered",
                }
            )

        return {
            "status": load_status,
            "title": "Data Center",
            "subtitle": "Choose the sources available to this analytics workspace.",
            "generated_at": generated_at,
            "message": load_message,
            "sources": sources,
            "summary": [
                "Business users can inspect available CSV, JSON, and API-style sources from inside the product.",
                "Connected sources keep their target table, grain, primary key, row count, and profiling context visible.",
                "Local files can be previewed in the workspace before a governed warehouse load is created.",
            ],
        }


def _format_timestamp(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M")
    return str(value)


def _source_label(source_name: str) -> str:
    label = source_name.replace("_", " ").title()
    return (
        label.replace(" Api", " API")
        .replace("Crm", "CRM")
        .replace(" Csv", " CSV")
        .replace(" Json", " JSON")
    )


def _source_type_label(source_type: str) -> str:
    labels = {
        "file_csv": "CSV file",
        "file_json": "JSON file",
        "api_paginated_json": "Paginated API",
    }
    return labels.get(source_type, source_type.replace("_", " ").title())


def _source_group(source_type: str) -> str:
    if source_type.startswith("file_"):
        return "File"
    if "api" in source_type:
        return "Application"
    return "Source"
