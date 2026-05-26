from pathlib import Path

import pytest

from fivetran_simulator.registered_sources import (
    DEFAULT_REGISTRY_PATH,
    SourceRegistryError,
    load_registry,
    profile_rows,
    read_source_rows,
)


def test_source_registry_declares_csv_and_json_sources() -> None:
    sources = load_registry(DEFAULT_REGISTRY_PATH)
    by_name = {source.name: source for source in sources}

    assert {
        "marketing_campaigns_csv",
        "support_tickets_json",
        "crm_accounts_api",
        "billing_invoices_api",
    }.issubset(by_name)
    assert by_name["marketing_campaigns_csv"].source_type == "file_csv"
    assert by_name["support_tickets_json"].source_type == "file_json"
    assert by_name["crm_accounts_api"].source_type == "api_paginated_json"
    assert by_name["billing_invoices_api"].source_type == "api_paginated_json"
    assert by_name["marketing_campaigns_csv"].primary_key == "campaign_id"
    assert by_name["support_tickets_json"].primary_key == "ticket_id"
    assert by_name["crm_accounts_api"].primary_key == "account_id"
    assert by_name["billing_invoices_api"].primary_key == "invoice_id"


def test_registered_file_sources_can_be_read() -> None:
    sources = {source.name: source for source in load_registry(DEFAULT_REGISTRY_PATH)}

    campaigns = read_source_rows(sources["marketing_campaigns_csv"])
    tickets = read_source_rows(sources["support_tickets_json"])
    accounts = read_source_rows(sources["crm_accounts_api"])
    invoices = read_source_rows(sources["billing_invoices_api"])

    assert campaigns[0]["campaign_id"] == "CMP_001"
    assert campaigns[0]["channel"] == "paid_search"
    assert tickets[0]["ticket_id"] == "TCK_0001"
    assert tickets[2]["closed_at"] is None
    assert [row["account_id"] for row in accounts] == [
        "ACC_001",
        "ACC_002",
        "ACC_003",
        "ACC_004",
        "ACC_005",
    ]
    assert [row["invoice_id"] for row in invoices] == [
        "INV_0001",
        "INV_0002",
        "INV_0003",
        "INV_0004",
        "INV_0005",
        "INV_0006",
    ]
    assert invoices[-1]["billing_status"] == "past_due"


def test_profile_rows_counts_duplicates_and_nulls() -> None:
    rows = [
        {"ticket_id": "TCK_1", "customer_id": "CUST_1", "closed_at": ""},
        {"ticket_id": "TCK_1", "customer_id": "", "closed_at": None},
        {"ticket_id": "TCK_2", "customer_id": "CUST_2", "closed_at": "2025-01-01"},
    ]

    profile = profile_rows(
        rows,
        primary_key="ticket_id",
        columns=("ticket_id", "customer_id", "closed_at"),
    )

    assert profile.row_count == 3
    assert profile.duplicate_key_count == 1
    assert profile.null_counts["customer_id"] == 1
    assert profile.null_counts["closed_at"] == 2


def test_registry_rejects_unknown_source_type(tmp_path: Path) -> None:
    registry = tmp_path / "source_registry.yml"
    registry.write_text(
        """
version: 1
sources:
  - name: bad_source
    source_type: spreadsheet_magic
    path: data/sources/example.csv
    target_schema: raw
    target_table: bad_raw
    load_mode: full_refresh
    primary_key: id
    grain: one row per record
    business_purpose: Invalid test source.
    columns:
      - name: id
""",
        encoding="utf-8",
    )

    with pytest.raises(SourceRegistryError, match="unsupported source_type"):
        load_registry(registry)
