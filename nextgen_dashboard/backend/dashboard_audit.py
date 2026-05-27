from __future__ import annotations

from dataclasses import dataclass
from math import isclose
from typing import Any

import pandas as pd

from .analytics_helpers import range_with_previous
from .dashboard_service import DashboardService
from .models import DashboardPayload, PageName
from .predictive_analytics import ScenarioMode
from .repository import SalesRepository
from .revenue import RevenueService
from .semantic_layer import SemanticLayer
from .statistical_analytics import build_pareto_points, build_rfm_segment_summary


@dataclass(slots=True)
class AuditContext:
    name: str
    start_date: pd.Timestamp
    end_date: pd.Timestamp
    categories: list[str]
    cities: list[str]
    granularity: str
    pages: tuple[PageName, ...]


def safe_close(a: float, b: float, tol: float = 1e-6) -> bool:
    return isclose(float(a), float(b), rel_tol=1e-9, abs_tol=tol)


def _sum_sales(df: pd.DataFrame) -> float:
    return float(df["sales_amount"].sum()) if not df.empty else 0.0


def _sum_gross_sales(df: pd.DataFrame) -> float:
    if df.empty:
        return 0.0
    if "gross_sales_amount" in df.columns:
        return float(df["gross_sales_amount"].sum())
    return _sum_sales(df)


def _sum_cancelled_sales(df: pd.DataFrame) -> float:
    if df.empty:
        return 0.0
    if "cancelled_sales_amount" in df.columns:
        return float(df["cancelled_sales_amount"].sum())
    if "status" in df.columns and "gross_sales_amount" in df.columns:
        mask = df["status"].astype(str).str.lower() == "cancelled"
        return float(df.loc[mask, "gross_sales_amount"].sum())
    return 0.0


def _cancellation_rate(df: pd.DataFrame) -> float:
    gross = _sum_gross_sales(df)
    return _sum_cancelled_sales(df) / gross * 100.0 if gross else 0.0


def _orders(df: pd.DataFrame) -> float:
    return float(df["order_id"].nunique()) if not df.empty else 0.0


def _customers(df: pd.DataFrame) -> float:
    return float(df["customer_id"].nunique()) if not df.empty else 0.0


def _products(df: pd.DataFrame) -> float:
    return float(df["product_id"].nunique()) if not df.empty else 0.0


def _quantity(df: pd.DataFrame) -> float:
    if df.empty or "quantity" not in df.columns:
        return 0.0
    return float(df["quantity"].sum())


def _avg_ticket(df: pd.DataFrame) -> float:
    order_count = _orders(df)
    return _sum_sales(df) / order_count if order_count else 0.0


def _avg_items(df: pd.DataFrame) -> float:
    order_count = _orders(df)
    total_qty = _quantity(df)
    return total_qty / order_count if order_count else 0.0


def _avg_unit_price(df: pd.DataFrame) -> float:
    total_qty = _quantity(df)
    return _sum_sales(df) / total_qty if total_qty else 0.0


def _top_category_share(df: pd.DataFrame) -> float:
    total = _sum_sales(df)
    if total == 0.0 or df.empty:
        return 0.0
    return float(df.groupby("category")["sales_amount"].sum().max() / total * 100.0)


def _top5_products_share(df: pd.DataFrame) -> float:
    total = _sum_sales(df)
    if total == 0.0 or df.empty:
        return 0.0
    top = float(
        df.groupby("product_name")["sales_amount"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
        .sum()
    )
    return top / total * 100.0


def _records(df: pd.DataFrame) -> float:
    return float(len(df))


def _avg_lines(df: pd.DataFrame) -> float:
    order_count = _orders(df)
    return _records(df) / order_count if order_count else 0.0


def _success_rate(df: pd.DataFrame) -> float:
    if df.empty or "status" not in df.columns:
        return 0.0
    return float((df["status"].astype(str).str.lower() != "cancelled").mean() * 100.0)


def _repeat_rate(df: pd.DataFrame) -> float:
    active_customers = _customers(df)
    if active_customers == 0.0 or df.empty:
        return 0.0
    orders_per_customer = df.groupby("customer_id")["order_id"].nunique()
    return float((orders_per_customer > 1).sum() / active_customers * 100.0)


def _new_customers(
    full_df: pd.DataFrame,
    current_df: pd.DataFrame,
    start_date: pd.Timestamp,
    end_date: pd.Timestamp,
) -> float:
    if current_df.empty:
        return 0.0
    first_purchase = full_df.groupby("customer_id")["order_day"].min()
    active_customer_index = pd.Index(current_df["customer_id"].dropna().unique())
    active_first_purchase = first_purchase.reindex(active_customer_index).dropna()
    return float(
        (
            (active_first_purchase >= start_date.normalize())
            & (active_first_purchase <= end_date.normalize())
        ).sum()
    )


def _get_card(payload: DashboardPayload, key: str):
    for card in payload.cards:
        if card.key == key:
            return card
    raise KeyError(key)


def _context_descriptor(context: AuditContext) -> dict[str, object]:
    return {
        "name": context.name,
        "start": str(context.start_date.date()),
        "end": str(context.end_date.date()),
        "categories": list(context.categories),
        "cities": list(context.cities),
        "granularity": context.granularity,
        "pages": list(context.pages),
    }


def build_audit_contexts(repository: SalesRepository | None = None) -> list[AuditContext]:
    repository = repository or SalesRepository()
    metadata = repository.filter_metadata()
    full_df = repository.load_sales_model()
    start_ts, end_ts = repository.validate_date_range(
        pd.Timestamp(metadata["default_start_date"]).date(),
        pd.Timestamp(metadata["default_end_date"]).date(),
    )

    ranking = full_df.groupby(["category", "city"], dropna=True)["sales_amount"].sum().sort_values(ascending=False)
    top_pair = ranking.index[0] if not ranking.empty else ("", "")
    top_category = str(top_pair[0]) if top_pair[0] else (str(metadata["categories"][0]) if metadata["categories"] else "")
    top_city = str(top_pair[1]) if top_pair[1] else (str(metadata["cities"][0]) if metadata["cities"] else "")

    recent_start = max(start_ts, end_ts - pd.Timedelta(days=89))
    all_pages: tuple[PageName, ...] = (
        "executive",
        "sales",
        "revenue",
        "marketing",
        "customers",
        "retention",
        "products",
        "operations",
        "predictive",
    )
    day_pages: tuple[PageName, ...] = ("executive", "sales", "revenue", "marketing", "customers", "products", "operations")

    return [
        AuditContext("default_month", start_ts, end_ts, [], [], "Month", all_pages),
        AuditContext("default_quarter", start_ts, end_ts, [], [], "Quarter", all_pages),
        AuditContext("recent_90d_day", recent_start, end_ts, [], [], "Day", day_pages),
        AuditContext("top_category_month", start_ts, end_ts, [top_category] if top_category else [], [], "Month", all_pages),
        AuditContext("top_city_month", start_ts, end_ts, [], [top_city] if top_city else [], "Month", all_pages),
        AuditContext(
            "top_pair_month",
            start_ts,
            end_ts,
            [top_category] if top_category else [],
            [top_city] if top_city else [],
            "Month",
            all_pages,
        ),
    ]


def _build_page_payload(
    service: DashboardService,
    page: PageName,
    scoped_df: pd.DataFrame,
    current_df: pd.DataFrame,
    start_date: pd.Timestamp,
    end_date: pd.Timestamp,
    granularity: str,
    full_df: pd.DataFrame,
    marketing_df: pd.DataFrame | None = None,
    scenario_mode: ScenarioMode = "Base",
) -> DashboardPayload:
    return service.build_payload(
        page=page,
        scoped_df=scoped_df,
        current_df=current_df,
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
        full_df=full_df,
        marketing_df=marketing_df,
        scenario_mode=scenario_mode,
    )


def _retention_row_has_contiguous_maturity(row: list[float | None]) -> bool:
    seen_none = False
    for value in row:
        if value is None:
            seen_none = True
            continue
        if seen_none:
            return False
    return True


def _add_check(bucket: list[dict[str, object]], name: str, actual: object, expected: object, match: bool) -> None:
    bucket.append(
        {
            "name": name,
            "actual": actual,
            "expected": expected,
            "match": bool(match),
        }
    )


def _audit_predictive_scenarios(
    page_result: dict[str, list[dict[str, object]]],
    service: DashboardService,
    scoped_df: pd.DataFrame,
    current_df: pd.DataFrame,
    start_date: pd.Timestamp,
    end_date: pd.Timestamp,
    full_df: pd.DataFrame,
    marketing_df: pd.DataFrame | None,
) -> None:
    conservative = _build_page_payload(service, "predictive", scoped_df, current_df, start_date, end_date, "Month", full_df, marketing_df, "Conservative")
    base = _build_page_payload(service, "predictive", scoped_df, current_df, start_date, end_date, "Month", full_df, marketing_df, "Base")
    upside = _build_page_payload(service, "predictive", scoped_df, current_df, start_date, end_date, "Month", full_df, marketing_df, "Upside")

    forecast_keys = (
        "next_month_revenue_forecast",
        "next_month_orders_forecast",
        "next_month_active_customers_forecast",
    )
    for key in forecast_keys:
        low_value = _get_card(conservative, key).value
        base_value = _get_card(base, key).value
        high_value = _get_card(upside, key).value
        _add_check(
            page_result["consistency_checks"],
            f"predictive_{key}_scenario_ordering",
            {"conservative": low_value, "base": base_value, "upside": high_value},
            "conservative <= base <= upside",
            low_value <= base_value <= high_value,
        )

    base_projection = [point for point in base.trend if point.is_projection]
    conservative_projection = [point for point in conservative.trend if point.is_projection]
    upside_projection = [point for point in upside.trend if point.is_projection]
    for idx, point in enumerate(base_projection):
        lower_bound = point.lower_bound
        upper_bound = point.upper_bound
        in_band = True
        if lower_bound is not None:
            in_band = in_band and (float(lower_bound) <= float(point.current_value) + 1e-6)
        if upper_bound is not None:
            in_band = in_band and (float(point.current_value) <= float(upper_bound) + 1e-6)
        _add_check(
            page_result["consistency_checks"],
            f"predictive_projection_band_{idx}",
            {
                "value": point.current_value,
                "lower": lower_bound,
                "upper": upper_bound,
            },
            "lower <= value <= upper",
            in_band,
        )
        if idx < len(conservative_projection) and lower_bound is not None:
            _add_check(
                page_result["consistency_checks"],
                f"predictive_conservative_uses_lower_bound_{idx}",
                conservative_projection[idx].current_value,
                lower_bound,
                safe_close(conservative_projection[idx].current_value, lower_bound),
            )
        if idx < len(upside_projection) and upper_bound is not None:
            _add_check(
                page_result["consistency_checks"],
                f"predictive_upside_uses_upper_bound_{idx}",
                upside_projection[idx].current_value,
                upper_bound,
                safe_close(upside_projection[idx].current_value, upper_bound),
            )


def _audit_page(
    service: DashboardService,
    page: PageName,
    scoped_df: pd.DataFrame,
    current_df: pd.DataFrame,
    start_date: pd.Timestamp,
    end_date: pd.Timestamp,
    granularity: str,
    full_df: pd.DataFrame,
    marketing_df: pd.DataFrame | None = None,
) -> dict[str, list[dict[str, object]]]:
    payload = _build_page_payload(service, page, scoped_df, current_df, start_date, end_date, granularity, full_df, marketing_df)
    page_result: dict[str, list[dict[str, object]]] = {
        "card_checks": [],
        "consistency_checks": [],
    }

    if page in {"executive", "sales", "revenue", "marketing", "customers", "products", "operations", "predictive"}:
        page_current, page_previous, _, _ = range_with_previous(scoped_df, start_date, end_date)
    else:
        page_current = current_df
        page_previous = pd.DataFrame(columns=current_df.columns)

    if page == "executive":
        current_rfm = build_rfm_segment_summary(page_current, end_date)
        previous_rfm = build_rfm_segment_summary(page_previous, start_date - pd.Timedelta(days=1))
        risk_segments = {"At Risk", "Hibernating"}
        risk_current = float(current_rfm[current_rfm["segment"].isin(risk_segments)]["revenue"].sum()) if not current_rfm.empty else 0.0
        risk_previous = float(previous_rfm[previous_rfm["segment"].isin(risk_segments)]["revenue"].sum()) if not previous_rfm.empty else 0.0
        expected = {
            "sales_amount": _sum_sales(page_current),
            "gross_sales_amount": _sum_gross_sales(page_current),
            "active_customers": _customers(page_current),
            "revenue_at_risk": risk_current,
            "cancellation_rate": _cancellation_rate(page_current),
            "new_customers": _new_customers(full_df, page_current, start_date, end_date),
        }
        for key, expected_value in expected.items():
            actual_value = _get_card(payload, key).value
            _add_check(page_result["card_checks"], key, actual_value, expected_value, safe_close(actual_value, expected_value))
        _add_check(
            page_result["consistency_checks"],
            "executive_risk_revenue_non_negative",
            risk_current,
            ">= 0",
            risk_current >= 0 and risk_previous >= 0,
        )

    elif page == "sales":
        expected = {
            "sales_amount": _sum_sales(page_current),
            "orders_count": _orders(page_current),
            "average_ticket": _avg_ticket(page_current),
            "avg_items_per_order": _avg_items(page_current),
        }
        for key, expected_value in expected.items():
            actual_value = _get_card(payload, key).value
            _add_check(page_result["card_checks"], key, actual_value, expected_value, safe_close(actual_value, expected_value))

        pareto = build_pareto_points(page_current, page_previous, "category", limit=8)
        if payload.secondary_chart and pareto:
            first_api = payload.secondary_chart.points[0]
            first_expected = pareto[0]
            _add_check(
                page_result["consistency_checks"],
                "sales_category_pareto_first_row",
                {
                    "label": first_api.raw_label,
                    "share_pct": first_api.share_pct,
                    "cumulative_pct": first_api.cumulative_pct,
                },
                {
                    "label": first_expected.raw_label,
                    "share_pct": first_expected.share_pct,
                    "cumulative_pct": first_expected.cumulative_pct,
                },
                first_api.raw_label == first_expected.raw_label
                and safe_close(first_api.share_pct or 0.0, first_expected.share_pct or 0.0)
                and safe_close(first_api.cumulative_pct or 0.0, first_expected.cumulative_pct or 0.0),
            )

    elif page == "revenue":
        expected = {
            "revenue_in_window": _sum_sales(page_current),
            "gross_sales_amount": _sum_gross_sales(page_current),
            "cancellation_rate": _cancellation_rate(page_current),
        }
        for key, expected_value in expected.items():
            actual_value = _get_card(payload, key).value
            _add_check(page_result["card_checks"], key, actual_value, expected_value, safe_close(actual_value, expected_value))
        if payload.trend:
            actual_value = _get_card(payload, "latest_period_sales").value
            expected_value = payload.trend[-1].current_value
            _add_check(page_result["card_checks"], "latest_period_sales", actual_value, expected_value, safe_close(actual_value, expected_value))

    elif page == "marketing":
        spend = _get_card(payload, "marketing_spend").value
        attributed = _get_card(payload, "attributed_revenue").value
        roas = _get_card(payload, "marketing_roas").value
        expected_roas = attributed / spend if spend else 0.0
        _add_check(page_result["card_checks"], "marketing_roas", roas, expected_roas, safe_close(roas, expected_roas))
        for key in ("marketing_spend", "attributed_revenue", "campaigns_active", "budget_utilization"):
            actual_value = _get_card(payload, key).value
            _add_check(page_result["consistency_checks"], f"{key}_non_negative", actual_value, ">= 0", actual_value >= 0)

    elif page == "customers":
        active = _customers(page_current)
        new = _new_customers(full_df, page_current, start_date, end_date)
        expected = {
            "active_customers": active,
            "repeat_rate": _repeat_rate(page_current),
            "returning_customers": max(active - new, 0.0),
            "new_customers": new,
            "orders_per_customer": (_orders(page_current) / active) if active else 0.0,
            "revenue_per_customer": (_sum_sales(page_current) / active) if active else 0.0,
        }
        for key, expected_value in expected.items():
            actual_value = _get_card(payload, key).value
            _add_check(page_result["card_checks"], key, actual_value, expected_value, safe_close(actual_value, expected_value))
        rfm_summary = build_rfm_segment_summary(page_current, end_date)
        if not rfm_summary.empty:
            _add_check(
                page_result["consistency_checks"],
                "rfm_segment_totals_cover_customer_base",
                {
                    "segment_customers_sum": float(rfm_summary["customers"].sum()),
                    "segment_revenue_sum": float(rfm_summary["revenue"].sum()),
                },
                {
                    "active_customers": active,
                    "window_revenue": _sum_sales(page_current),
                },
                safe_close(float(rfm_summary["customers"].sum()), active)
                and safe_close(float(rfm_summary["revenue"].sum()), _sum_sales(page_current)),
            )

    elif page == "products":
        expected = {
            "products_sold": _products(page_current),
            "avg_unit_price": _avg_unit_price(page_current),
            "top_5_products_share": _top5_products_share(page_current),
            "top_category_share": _top_category_share(page_current),
        }
        for key, expected_value in expected.items():
            actual_value = _get_card(payload, key).value
            _add_check(page_result["card_checks"], key, actual_value, expected_value, safe_close(actual_value, expected_value))
        if payload.secondary_chart:
            share_sum = sum(float(point.share_pct or 0.0) for point in payload.secondary_chart.points)
            _add_check(page_result["consistency_checks"], "abc_share_sum", share_sum, 100.0, safe_close(share_sum, 100.0, tol=1e-4))

    elif page == "operations":
        expected = {
            "orders_count": _orders(page_current),
            "records_count": _records(page_current),
            "avg_lines_per_order": _avg_lines(page_current),
            "success_rate": _success_rate(page_current),
        }
        for key, expected_value in expected.items():
            actual_value = _get_card(payload, key).value
            _add_check(page_result["card_checks"], key, actual_value, expected_value, safe_close(actual_value, expected_value))

    elif page == "retention":
        heatmap = payload.primary_heatmap
        z_values = heatmap.z_values if heatmap else []
        pct_ok = all(cell is None or (0.0 <= float(cell) <= 100.0) for row in z_values for cell in row)
        latest_size = _get_card(payload, "latest_full_cohort_size").value
        _add_check(page_result["consistency_checks"], "retention_heatmap_range", pct_ok, True, pct_ok)
        _add_check(page_result["consistency_checks"], "latest_full_cohort_non_negative", latest_size, ">= 0", latest_size >= 0)
        for card_key in ("retention_m1", "retention_m2", "retention_m3"):
            card_value = _get_card(payload, card_key).value
            _add_check(page_result["consistency_checks"], f"{card_key}_range", card_value, "0..100", 0.0 <= card_value <= 100.0)
        age_zero_ok = all((not row) or row[0] is None or safe_close(float(row[0]), 100.0, tol=1e-4) for row in z_values)
        _add_check(page_result["consistency_checks"], "retention_age_zero_is_full_cohort", age_zero_ok, True, age_zero_ok)
        maturity_contiguous = all(_retention_row_has_contiguous_maturity(row) for row in z_values)
        _add_check(page_result["consistency_checks"], "retention_maturity_is_contiguous", maturity_contiguous, True, maturity_contiguous)

    elif page == "predictive":
        projection_points = [point for point in payload.trend if point.is_projection]
        _add_check(
            page_result["consistency_checks"],
            "predictive_has_projection_points",
            len(projection_points),
            ">= 1",
            len(projection_points) >= 1,
        )
        if projection_points:
            actual_value = _get_card(payload, "next_month_revenue_forecast").value
            expected_value = projection_points[0].current_value
            _add_check(page_result["card_checks"], "next_month_revenue_forecast", actual_value, expected_value, safe_close(actual_value, expected_value))
        if payload.secondary_chart:
            share_sum = sum(float(point.share_pct or 0.0) for point in payload.secondary_chart.points)
            _add_check(page_result["consistency_checks"], "predictive_driver_share_sum", share_sum, 100.0, safe_close(share_sum, 100.0, tol=1e-4))
        orders_card = _get_card(payload, "next_month_orders_forecast").value
        customers_card = _get_card(payload, "next_month_active_customers_forecast").value
        _add_check(page_result["consistency_checks"], "predictive_orders_non_negative", orders_card, ">= 0", orders_card >= 0)
        _add_check(page_result["consistency_checks"], "predictive_customers_non_negative", customers_card, ">= 0", customers_card >= 0)
        _audit_predictive_scenarios(page_result, service, scoped_df, current_df, start_date, end_date, full_df, marketing_df)

    return page_result


def run_dashboard_audit(
    repository: SalesRepository | None = None,
    service: DashboardService | None = None,
    contexts: list[AuditContext] | None = None,
) -> dict[str, object]:
    repository = repository or SalesRepository()
    service = service or DashboardService(
        revenue_service=RevenueService(),
        semantic_layer=SemanticLayer(),
    )

    full_df = repository.load_sales_model()
    full_df.attrs["customer_first_purchase"] = repository.customer_first_purchase()
    marketing_df = repository.load_marketing_model()
    contexts = contexts or build_audit_contexts(repository)

    results: dict[str, object] = {"contexts": []}
    all_checks: list[tuple[str, str, str, bool]] = []

    for context in contexts:
        scoped_df = repository.filter_sales(None, None, context.categories, context.cities)
        current_df = repository.filter_frame_by_date(scoped_df, context.start_date, context.end_date)

        context_result = _context_descriptor(context)
        context_result["pages"] = {}
        for page in context.pages:
            page_result = _audit_page(
                service=service,
                page=page,
                scoped_df=scoped_df,
                current_df=current_df,
                start_date=context.start_date,
                end_date=context.end_date,
                granularity=context.granularity,
                full_df=full_df,
                marketing_df=marketing_df,
            )
            context_result["pages"][page] = page_result
            for item in page_result["card_checks"]:
                all_checks.append((context.name, page, str(item["name"]), bool(item["match"])))
            for item in page_result["consistency_checks"]:
                all_checks.append((context.name, page, str(item["name"]), bool(item["match"])))
        results["contexts"].append(context_result)

    results["summary"] = {
        "contexts_audited": len(contexts),
        "total_checks": len(all_checks),
        "failed_checks": [
            {"context": context_name, "page": page, "check": name}
            for context_name, page, name, match in all_checks
            if not match
        ],
    }
    return results
