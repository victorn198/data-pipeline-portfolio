from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import nextgen_dashboard.backend.main as main_module
from nextgen_dashboard.backend.dashboard_service import DashboardService
from nextgen_dashboard.backend.dashboard_audit import run_dashboard_audit
from nextgen_dashboard.backend.proposal_applier import ProposalApplier
from nextgen_dashboard.backend.proposal_engine import ProposalEngine
from nextgen_dashboard.backend.proposal_previewer import ProposalPreviewer
from nextgen_dashboard.backend.proposal_store import ProposalStore
from nextgen_dashboard.backend.proposal_validator import ProposalValidator
from nextgen_dashboard.backend.semantic_layer import SemanticLayer


client = TestClient(main_module.app)
AGENT_HEADERS = {"X-NextGen-Agent-Token": "test-agent-token"}


@pytest.fixture(autouse=True)
def isolate_agent_state(tmp_path, monkeypatch):
    semantic_root = Path(__file__).resolve().parents[1] / "nextgen_dashboard" / "semantic"
    agent_data_root = tmp_path / "agent_data"
    monkeypatch.setenv("NEXTGEN_ENABLE_AGENT_MUTATIONS", "1")
    monkeypatch.setenv("NEXTGEN_AGENT_TOKEN", AGENT_HEADERS["X-NextGen-Agent-Token"])
    semantic_layer = SemanticLayer(
        semantic_root=semantic_root,
        agent_data_root=agent_data_root,
    )
    proposal_store = ProposalStore(data_root=agent_data_root)

    monkeypatch.setattr(main_module, "semantic_layer", semantic_layer)
    monkeypatch.setattr(main_module, "proposal_store", proposal_store)
    monkeypatch.setattr(
        main_module,
        "proposal_engine",
        ProposalEngine(semantic_layer=semantic_layer),
    )
    monkeypatch.setattr(
        main_module,
        "proposal_validator",
        ProposalValidator(semantic_layer=semantic_layer),
    )
    monkeypatch.setattr(
        main_module,
        "proposal_applier",
        ProposalApplier(
            proposal_store=proposal_store,
            semantic_layer=semantic_layer,
        ),
    )
    monkeypatch.setattr(
        main_module,
        "proposal_previewer",
        ProposalPreviewer(
            proposal_store=proposal_store,
            semantic_layer=semantic_layer,
        ),
    )
    monkeypatch.setattr(
        main_module,
        "dashboard_service",
        DashboardService(
            revenue_service=main_module.revenue_service,
            semantic_layer=semantic_layer,
        ),
    )
    yield


def test_root_serves_dashboard_html() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_desktop_lab_serves_html() -> None:
    response = client.get("/desktop-lab")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "NextGen Analytics Desktop" in response.text


def test_static_asset_allowlist_blocks_backup_artifacts() -> None:
    allowed_asset = client.get("/static/desktop_lab.js")
    assert allowed_asset.status_code == 200

    blocked_asset = client.get("/static/desktop_lab.js.served.bak")
    assert blocked_asset.status_code == 404


def test_health_endpoint() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200

    payload = response.json()
    assert payload["status"] in {"ok", "error"}
    assert isinstance(payload["message"], str)
    assert payload["message"]


def test_filter_metadata_endpoint() -> None:
    response = client.get("/api/meta/filters")
    assert response.status_code == 200

    payload = response.json()
    assert payload["min_date"]
    assert payload["max_date"]
    assert isinstance(payload["categories"], list)
    assert isinstance(payload["cities"], list)
    assert payload["data_engine"]


def test_semantic_layer_endpoint() -> None:
    response = client.get("/api/semantic-layer")
    assert response.status_code == 200

    payload = response.json()
    assert "sales_amount" in payload["metrics"]
    assert "sales" in payload["pages"]
    assert payload["pages"]["sales"]["primary_trend_metric"] == "sales_amount"
    assert payload["metrics"]["top_category_share"]["format"] == "percent"


def test_source_health_endpoint() -> None:
    response = client.get("/api/source-health")
    assert response.status_code == 200

    payload = response.json()
    assert payload["status"] in {"ok", "unavailable"}
    assert payload["title"] == "Source Health"
    assert payload["generated_at"]
    assert isinstance(payload["cards"], list)
    assert payload["cards"]
    assert payload["loads_table"]["title"] == "Latest Source Loads"
    assert payload["profile_table"]["title"] == "Source Profiling Results"

    if payload["status"] == "ok":
        card_keys = {card["key"] for card in payload["cards"]}
        assert {"sources_loaded", "rows_loaded", "duplicate_keys", "null_values"}.issubset(card_keys)
        assert payload["loads_table"]["rows"]
        assert payload["profile_table"]["rows"]


def test_source_catalog_endpoint() -> None:
    response = client.get("/api/source-catalog")
    assert response.status_code == 200

    payload = response.json()
    assert payload["title"] == "Data Center"
    assert payload["generated_at"]
    assert isinstance(payload["sources"], list)
    assert payload["sources"]

    source = payload["sources"][0]
    assert {
        "name",
        "label",
        "source_type",
        "type_label",
        "target",
        "primary_key",
        "columns",
        "status",
    }.issubset(source)
    assert isinstance(source["columns"], list)


def test_account_health_endpoint() -> None:
    response = client.get("/api/account-health")
    assert response.status_code == 200

    payload = response.json()
    assert payload["status"] in {"ok", "unavailable"}
    assert payload["title"] == "Account Health"
    assert payload["generated_at"]
    assert isinstance(payload["cards"], list)
    assert payload["cards"]
    assert payload["tier_table"]["title"] == "Health Tier Summary"
    assert payload["account_table"]["title"] == "Account Watchlist"

    if payload["status"] == "ok":
        card_keys = {card["key"] for card in payload["cards"]}
        assert {
            "accounts_monitored",
            "average_health_score",
            "accounts_at_risk",
            "outstanding_amount",
        }.issubset(card_keys)
        assert payload["tier_table"]["rows"]
        assert payload["account_table"]["rows"]


def test_dashboard_pages_respond() -> None:
    for page in ("sales", "revenue", "predictive", "customers", "retention", "products", "operations"):
        response = client.get("/api/dashboard", params={"page": page})
        assert response.status_code == 200

        payload = response.json()
        assert payload["page"] == page
        assert isinstance(payload["cards"], list)
        assert isinstance(payload["trend"], list)
        assert payload["trend_title"]

    predictive_payload = client.get("/api/dashboard", params={"page": "predictive", "granularity": "Quarter"}).json()
    assert predictive_payload["granularity"] == "Month"
    assert predictive_payload["scenario_mode"] == "Base"
    assert predictive_payload["cards"][0]["key"] == "next_month_revenue_forecast"
    assert predictive_payload["secondary_chart"]["title"] == "Projected Next-Month Revenue by Category"
    assert any(point["is_projection"] for point in predictive_payload["trend"])
    assert predictive_payload["detail_table"]["title"] == "Next-Step Watchlist"

    conservative_predictive = client.get("/api/dashboard", params={"page": "predictive", "scenario_mode": "Conservative"}).json()
    assert conservative_predictive["scenario_mode"] == "Conservative"
    assert conservative_predictive["cards"][0]["formatted_value"] != predictive_payload["cards"][0]["formatted_value"]
    assert any(point.get("share_shift_pct") is not None for point in conservative_predictive["secondary_chart"]["points"])

    customers_payload = client.get("/api/dashboard", params={"page": "customers"}).json()
    assert customers_payload["cards"][1]["key"] == "repeat_rate"
    assert customers_payload["secondary_chart"]["title"] == "Revenue by RFM Segment"
    assert customers_payload["detail_table"]["title"] == "RFM Segment Detail"

    retention_payload = client.get("/api/dashboard", params={"page": "retention", "granularity": "Quarter"}).json()
    assert retention_payload["granularity"] == "Month"
    assert retention_payload["primary_heatmap"] is not None
    assert retention_payload["cards"][0]["key"] == "latest_full_cohort_size"

    products_payload = client.get("/api/dashboard", params={"page": "products"}).json()
    assert products_payload["trend_metric_format"] == "percent"
    assert products_payload["primary_metric_key"] == "top_category_share"
    assert products_payload["secondary_chart"]["analysis_mode"] == "donut"
    assert products_payload["secondary_chart"]["interaction_key"] == "abc_class"

    operations_payload = client.get("/api/dashboard", params={"page": "operations"}).json()
    assert operations_payload["title"] == "Order Flow Operations"
    assert operations_payload["cards"][0]["key"] == "orders_count"
    assert operations_payload["trend_y_title"] == "Orders Count"
    assert operations_payload["secondary_chart"]["filter_key"] == "city"


def test_sales_drilldown_responds() -> None:
    overview_response = client.get(
        "/api/dashboard",
        params={"page": "sales", "granularity": "Month"},
    )
    assert overview_response.status_code == 200

    overview_payload = overview_response.json()
    assert overview_payload["trend"]

    first_period_key = overview_payload["trend"][0]["period_key"]
    drilldown_response = client.get(
        "/api/dashboard",
        params={
            "page": "sales",
            "granularity": "Month",
            "drilldown_period_key": first_period_key,
        },
    )
    assert drilldown_response.status_code == 200

    drilldown_payload = drilldown_response.json()
    assert drilldown_payload["page"] == "sales"
    assert drilldown_payload["view_mode"] == "drilldown"
    assert drilldown_payload["selected_period_label"]
    assert isinstance(drilldown_payload["trend"], list)


def test_agent_suggestions_endpoint() -> None:
    response = client.get("/api/agent/suggestions", params={"page": "sales"})
    assert response.status_code == 200

    payload = response.json()
    assert isinstance(payload["suggestions"], list)
    assert payload["suggestions"]
    assert all(item["page"] == "sales" for item in payload["suggestions"])


def test_agent_proposal_flow() -> None:
    create_response = client.post(
        "/api/agent/proposals",
        headers=AGENT_HEADERS,
        json={
            "page": "sales",
            "target": "dashboard",
            "title": "Add margin KPI",
            "rationale": "Margin visibility is missing from the current sales page.",
            "before": {"cards": ["sales_amount", "orders_count"]},
            "after": {
                "cards": ["sales_amount", "orders_count", "average_ticket"]
            },
        },
    )
    assert create_response.status_code == 200

    proposal = create_response.json()
    proposal_id = proposal["proposal_id"]
    assert proposal["status"] == "proposed"

    list_response = client.get("/api/agent/proposals")
    assert list_response.status_code == 200
    assert any(
        item["proposal_id"] == proposal_id
        for item in list_response.json()["proposals"]
    )

    update_response = client.patch(
        f"/api/agent/proposals/{proposal_id}",
        headers=AGENT_HEADERS,
        json={
            "status": "approved",
            "reviewer_note": "Approved for next iteration.",
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "approved"

    audit_response = client.get("/api/agent/audit-log")
    assert audit_response.status_code == 200
    assert any(
        event["proposal_id"] == proposal_id
        for event in audit_response.json()["events"]
    )


def test_agent_mutation_endpoints_require_demo_override(monkeypatch) -> None:
    monkeypatch.setenv("NEXTGEN_ENABLE_AGENT_MUTATIONS", "0")

    response = client.post(
        "/api/agent/proposals",
        headers=AGENT_HEADERS,
        json={
            "page": "sales",
            "target": "dashboard",
            "title": "Blocked in demo mode",
            "rationale": "Mutations should not be open by default.",
            "after": {"cards": ["sales_amount"]},
        },
    )
    assert response.status_code == 403
    assert "disabled in demo mode" in response.json()["detail"]


def test_invalid_agent_proposal_is_rejected() -> None:
    response = client.post(
        "/api/agent/proposals",
        headers=AGENT_HEADERS,
        json={
            "page": "sales",
            "target": "dashboard",
            "title": "Add invalid metric",
            "rationale": "This should fail because the metric does not exist.",
            "after": {"metric": "not_a_real_metric"},
        },
    )
    assert response.status_code == 400
    assert "Unknown metric" in response.json()["detail"]


def test_approved_proposal_can_be_applied_to_draft() -> None:
    create_response = client.post(
        "/api/agent/proposals",
        headers=AGENT_HEADERS,
        json={
            "page": "sales",
            "target": "page",
            "title": "Add drilldown note",
            "rationale": "Make drilldown more explicit.",
            "after": {
                "interaction_hint": "Click any aggregated Sales period to open day-by-day comparison."
            },
        },
    )
    assert create_response.status_code == 200
    proposal_id = create_response.json()["proposal_id"]

    approve_response = client.patch(
        f"/api/agent/proposals/{proposal_id}",
        headers=AGENT_HEADERS,
        json={"status": "approved", "reviewer_note": "approved for draft"},
    )
    assert approve_response.status_code == 200

    apply_response = client.post(
        f"/api/agent/proposals/{proposal_id}/apply-draft",
        headers=AGENT_HEADERS,
    )
    assert apply_response.status_code == 200
    assert apply_response.json()["applied_to_draft_at"]

    dashboard_response = client.get("/api/dashboard", params={"page": "sales"})
    assert dashboard_response.status_code == 200
    assert dashboard_response.json()["interaction_hint"]


def test_proposal_preview_endpoint() -> None:
    create_response = client.post(
        "/api/agent/proposals",
        headers=AGENT_HEADERS,
        json={
            "page": "sales",
            "target": "page",
            "title": "Tune sales subtitle",
            "rationale": "Preview should show subtitle diff.",
            "after": {
                "subtitle": "Sales page with explicit previous-period reading rule."
            },
        },
    )
    assert create_response.status_code == 200
    proposal_id = create_response.json()["proposal_id"]

    preview_response = client.get(f"/api/agent/proposals/{proposal_id}/preview")
    assert preview_response.status_code == 200
    payload = preview_response.json()
    assert payload["scope_key"] == "sales"
    assert any(change["field"] == "subtitle" for change in payload["changes"])


def test_semantic_metric_override_can_be_applied_to_draft() -> None:
    create_response = client.post(
        "/api/agent/proposals",
        headers=AGENT_HEADERS,
        json={
            "target": "semantic_layer",
            "title": "Rename sales metric",
            "rationale": "Use a stronger governed business label.",
            "after": {"metric_key": "sales_amount", "label": "Gross Sales"},
        },
    )
    assert create_response.status_code == 200
    proposal_id = create_response.json()["proposal_id"]

    approve_response = client.patch(
        f"/api/agent/proposals/{proposal_id}",
        headers=AGENT_HEADERS,
        json={"status": "approved", "reviewer_note": "approved metric override"},
    )
    assert approve_response.status_code == 200

    apply_response = client.post(
        f"/api/agent/proposals/{proposal_id}/apply-draft",
        headers=AGENT_HEADERS,
    )
    assert apply_response.status_code == 200
    assert apply_response.json()["applied_to_draft_at"]

    semantic_response = client.get("/api/semantic-layer")
    assert semantic_response.status_code == 200
    assert semantic_response.json()["metrics"]["sales_amount"]["label"] == "Gross Sales"

    dashboard_response = client.get("/api/dashboard", params={"page": "sales"})
    assert dashboard_response.status_code == 200
    assert dashboard_response.json()["cards"][0]["title"] == "Gross Sales"


def test_dashboard_uses_semantic_layout_config() -> None:
    response = client.get("/api/dashboard", params={"page": "revenue"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["trend_x_title"] == "Period"
    assert payload["cards"][0]["key"] == "revenue_in_window"
    assert payload["secondary_chart"]["title"] == "Revenue by City"
    assert payload["detail_table"]["title"] in {"Period Ledger", "Revenue Anomaly Detail", "Revenue Signal Log"}
    assert all("is_anomaly" in point for point in payload["trend"])
    assert all("is_structural_shift" in point for point in payload["trend"])
    if payload["detail_table"]["title"] == "Revenue Signal Log":
        signals = [row["values"]["signal"] for row in payload["detail_table"]["rows"]]
        if any("shift" in signal.lower() for signal in signals):
            assert any(point["is_structural_shift"] for point in payload["trend"])


def test_dashboard_exposes_driver_and_detail_layers() -> None:
    sales_payload = client.get("/api/dashboard", params={"page": "sales"}).json()
    sales_payload = client.get("/api/dashboard", params={"page": "sales"}).json()
    assert sales_payload["secondary_chart"]["title"] == "Category Pareto (Revenue)"
    assert sales_payload["secondary_chart"]["analysis_mode"] == "pareto"
    assert sales_payload["secondary_chart"]["interaction_key"] == "category"
    assert any(point.get("cumulative_pct") is not None for point in sales_payload["secondary_chart"]["points"])
    assert sales_payload["detail_table"]["title"] == "Category Pareto Detail"

    products_payload = client.get("/api/dashboard", params={"page": "products"}).json()
    assert products_payload["secondary_chart"]["title"] == "ABC Revenue Split"
    assert products_payload["secondary_chart"]["analysis_mode"] == "donut"
    assert products_payload["detail_table"]["title"] == "ABC Class Summary"
    assert "mix_shift" in products_payload["detail_table"]["rows"][0]["values"]
    assert any(point.get("share_shift_pct") is not None for point in products_payload["secondary_chart"]["points"])

    predictive_payload = client.get("/api/dashboard", params={"page": "predictive", "scenario_mode": "Upside"}).json()
    assert predictive_payload["detail_table"]["title"] == "Next-Step Watchlist"
    assert predictive_payload["scenario_mode"] == "Upside"
    assert "scenario_range" in predictive_payload["detail_table"]["rows"][0]["values"]
    assert "share_shift" in predictive_payload["detail_table"]["rows"][0]["values"]

    retention_payload = client.get("/api/dashboard", params={"page": "retention"}).json()
    assert retention_payload["primary_heatmap"]["title"] == "Retention Cohort Heatmap"
    assert retention_payload["secondary_chart"]["title"] == "Average Retention Curve"


def test_dashboard_detail_endpoint_exposes_underlying_members() -> None:
    sales_payload = client.get("/api/dashboard", params={"page": "sales"}).json()
    category_row = sales_payload["detail_table"]["rows"][0]
    sales_detail = client.get(
        "/api/dashboard/detail",
        params={
            "page": "sales",
            "drilldown_key": category_row["interaction_key"],
            "drilldown_value": category_row["interaction_value"],
        },
    )
    assert sales_detail.status_code == 200
    assert "Products inside" in sales_detail.json()["title"]

    customers_payload = client.get("/api/dashboard", params={"page": "customers"}).json()
    segment_row = customers_payload["detail_table"]["rows"][0]
    customers_detail = client.get(
        "/api/dashboard/detail",
        params={
            "page": "customers",
            "drilldown_key": segment_row["interaction_key"],
            "drilldown_value": segment_row["interaction_value"],
        },
    )
    assert customers_detail.status_code == 200
    assert "Customers inside" in customers_detail.json()["title"]

    products_payload = client.get("/api/dashboard", params={"page": "products"}).json()
    class_row = products_payload["detail_table"]["rows"][0]
    products_detail = client.get(
        "/api/dashboard/detail",
        params={
            "page": "products",
            "drilldown_key": class_row["interaction_key"],
            "drilldown_value": class_row["interaction_value"],
        },
    )
    assert products_detail.status_code == 200
    assert "Products in class" in products_detail.json()["title"]
    assert "mix_shift" in products_detail.json()["table"]["rows"][0]["values"]


def test_predictive_category_drilldown_responds() -> None:
    response = client.get(
        "/api/dashboard/detail",
        params={
            "page": "predictive",
            "scenario_mode": "Conservative",
            "drilldown_key": "category",
            "drilldown_value": "electronics",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["page"] == "predictive"
    assert "electronics" in payload["title"].lower()
    assert payload["table"]["rows"] is not None
    assert "share_shift" in payload["table"]["rows"][0]["values"]



def test_dashboard_metric_audit_passes_default_and_slice_contexts() -> None:
    results = run_dashboard_audit()
    assert results["summary"]["contexts_audited"] >= 6
    assert results["summary"]["total_checks"] > 0
    assert results["summary"]["failed_checks"] == []

    context_names = {context["name"] for context in results["contexts"]}
    assert {"default_month", "top_category_month", "top_city_month", "top_pair_month"}.issubset(context_names)
