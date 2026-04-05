from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

import pandas as pd

from .analytics_helpers import (
    build_aligned_trend,
    build_daily_trend_for_period_comparison,
    fmt_currency,
    fmt_decimal,
    fmt_number,
    fmt_pct,
    make_card,
    period_bounds_from_key,
    range_with_previous,
    safe_pct,
)
from .models import (
    BreakdownChartPayload,
    BreakdownPoint,
    DashboardPayload,
    DetailTablePayload,
    DrilldownDetailPayload,
    Granularity,
    ScenarioMode,
    HeatmapPayload,
    KpiCard,
    PageName,
    TableColumn,
    TableRow,
)
from .predictive_analytics import (
    apply_scenario_to_trend,
    build_driver_breakdown_points,
    build_driver_forecasts,
    build_monthly_distinct_series,
    build_monthly_sum_series,
    build_predictive_trend,
    driver_scenario_delta_pct,
    driver_scenario_share,
    driver_scenario_value,
    driver_share_shift_pct,
    rolling_backtest_mape,
    scenario_series_name,
)
from .revenue import RevenueService
from .semantic_layer import SemanticLayer
from .statistical_analytics import (
    annotate_trend_anomalies,
    build_pareto_points,
    build_rfm_customer_frame,
    build_rfm_segment_summary,
    detect_structural_shifts,
)

MetricFn = Callable[[pd.DataFrame], float]


def _sum_sales(df: pd.DataFrame) -> float:
    return float(df["sales_amount"].sum()) if not df.empty else 0.0


def _orders_count(df: pd.DataFrame) -> float:
    return float(df["order_id"].nunique()) if not df.empty else 0.0


def _customers_count(df: pd.DataFrame) -> float:
    return float(df["customer_id"].nunique()) if not df.empty else 0.0


def _products_count(df: pd.DataFrame) -> float:
    return float(df["product_id"].nunique()) if not df.empty else 0.0


def _records_count(df: pd.DataFrame) -> float:
    return float(len(df))


def _quantity_sum(df: pd.DataFrame) -> float:
    if df.empty or "quantity" not in df.columns:
        return 0.0
    return float(df["quantity"].sum())


def _average_ticket(df: pd.DataFrame) -> float:
    orders = _orders_count(df)
    return _sum_sales(df) / orders if orders else 0.0


def _avg_items_per_order(df: pd.DataFrame) -> float:
    orders = _orders_count(df)
    quantity = _quantity_sum(df)
    return quantity / orders if orders else 0.0


def _avg_unit_price(df: pd.DataFrame) -> float:
    quantity = _quantity_sum(df)
    return _sum_sales(df) / quantity if quantity else 0.0


def _top_category_share(df: pd.DataFrame) -> float:
    total_sales = _sum_sales(df)
    if df.empty or total_sales == 0:
        return 0.0
    top_sales = float(df.groupby("category")["sales_amount"].sum().max())
    return (top_sales / total_sales) * 100.0


def _top_n_products_share(df: pd.DataFrame, n: int = 5) -> float:
    total_sales = _sum_sales(df)
    if df.empty or total_sales == 0:
        return 0.0
    top_sales = float(
        df.groupby("product_name")["sales_amount"]
        .sum()
        .sort_values(ascending=False)
        .head(n)
        .sum()
    )
    return (top_sales / total_sales) * 100.0


def _non_cancelled_rate(df: pd.DataFrame) -> float:
    if df.empty or "status" not in df.columns:
        return 0.0
    return float((df["status"].astype(str).str.lower() != "cancelled").mean() * 100.0)


def _avg_lines_per_order(df: pd.DataFrame) -> float:
    orders = _orders_count(df)
    rows = _records_count(df)
    return rows / orders if orders else 0.0


def _customer_repeat_rate(df: pd.DataFrame) -> float:
    active_customers = _customers_count(df)
    if df.empty or active_customers == 0:
        return 0.0
    orders_per_customer = df.groupby("customer_id")["order_id"].nunique()
    repeat_customers = float((orders_per_customer > 1).sum())
    return (repeat_customers / active_customers) * 100.0


def _customer_new_counts(
    full_df: pd.DataFrame,
    current_df: pd.DataFrame,
    start_date: pd.Timestamp,
    end_date: pd.Timestamp,
) -> float:
    if current_df.empty:
        return 0.0
    first_purchase = full_df.attrs.get("customer_first_purchase")
    if first_purchase is None:
        first_purchase = full_df.groupby("customer_id")["order_day"].min()
    active_customers = pd.Index(current_df["customer_id"].dropna().unique())
    active_first_purchase = first_purchase.reindex(active_customers).dropna()
    return float(
        ((active_first_purchase >= start_date.normalize()) & (active_first_purchase <= end_date.normalize())).sum()
    )


def _display_label(value: object, max_len: int = 32) -> str:
    label = str(value)
    if len(label) <= max_len:
        return label
    return f"{label[: max_len - 1].rstrip()}..."


def _month_start(value: pd.Timestamp) -> pd.Timestamp:
    return pd.Timestamp(value).to_period("M").to_timestamp()


def _select_closed_month_history(
    current_df: pd.DataFrame,
    start_date: pd.Timestamp,
    end_date: pd.Timestamp,
) -> tuple[pd.DataFrame, pd.Timestamp, pd.Timestamp, bool]:
    start_ts = pd.Timestamp(start_date).normalize()
    end_ts = pd.Timestamp(end_date).normalize()
    first_full_start = start_ts if start_ts.day == 1 else (_month_start(start_ts) + pd.offsets.MonthBegin(1)).normalize()
    month_end = (_month_start(end_ts) + pd.offsets.MonthEnd(0)).normalize()
    last_full_end = end_ts if end_ts == month_end else (_month_start(end_ts) - pd.Timedelta(days=1)).normalize()
    if first_full_start <= last_full_end:
        closed_df = current_df[(current_df["order_day"] >= first_full_start) & (current_df["order_day"] <= last_full_end)].copy()
        if not closed_df.empty:
            month_count = closed_df["order_day"].dt.to_period("M").nunique()
            if month_count >= 6:
                return closed_df, first_full_start, last_full_end, True
    return current_df.copy(), start_ts, end_ts, False


def _last_closed_cohort_month(end_date: pd.Timestamp) -> pd.Timestamp | None:
    end_ts = pd.Timestamp(end_date).normalize()
    cohort_month = _month_start(end_ts)
    month_end = cohort_month + pd.offsets.MonthEnd(0)
    if end_ts < month_end:
        cohort_month = cohort_month - pd.DateOffset(months=1)
    return pd.Timestamp(cohort_month).normalize()


def _scenario_case_label(scenario_mode: ScenarioMode) -> str:
    if scenario_mode == "Conservative":
        return "conservative case"
    if scenario_mode == "Upside":
        return "upside case"
    return "base case"


def _scenario_pick(
    base_value: float,
    low_value: float | None,
    high_value: float | None,
    scenario_mode: ScenarioMode,
) -> float:
    if scenario_mode == "Conservative":
        return float(low_value if low_value is not None else base_value)
    if scenario_mode == "Upside":
        return float(high_value if high_value is not None else base_value)
    return float(base_value)


def _group_metric_map(df: pd.DataFrame, group_col: str, metric_fn: MetricFn) -> dict[str, float]:
    if df.empty or group_col not in df.columns:
        return {}
    payload: dict[str, float] = {}
    scoped = df.dropna(subset=[group_col])
    for raw_label, frame in scoped.groupby(group_col, sort=False):
        payload[str(raw_label)] = float(metric_fn(frame))
    return payload


def _build_breakdown_chart(
    title: str,
    x_title: str,
    y_title: str,
    current_df: pd.DataFrame,
    previous_df: pd.DataFrame,
    group_col: str,
    metric_fn: MetricFn,
    metric_format: str,
    limit: int = 6,
    current_trace_style: str = "bar",
    previous_trace_style: str = "bar",
    label_transform: Callable[[str], str] | None = None,
    filter_key: str | None = None,
) -> BreakdownChartPayload | None:
    current_map = _group_metric_map(current_df, group_col, metric_fn)
    previous_map = _group_metric_map(previous_df, group_col, metric_fn)
    labels = sorted(
        set(current_map) | set(previous_map),
        key=lambda label: (current_map.get(label, 0.0), previous_map.get(label, 0.0)),
        reverse=True,
    )[:limit]
    if not labels:
        return None

    points = [
        BreakdownPoint(
            label=label_transform(label) if label_transform else label,
            raw_label=label,
            current_value=float(current_map.get(label, 0.0)),
            previous_value=float(previous_map.get(label, 0.0)),
            delta_pct=safe_pct(current_map.get(label, 0.0), previous_map.get(label, 0.0)),
        )
        for label in labels
    ]
    return BreakdownChartPayload(
        title=title,
        x_title=x_title,
        y_title=y_title,
        metric_format=metric_format,
        current_trace_style=current_trace_style,
        previous_trace_style=previous_trace_style,
        filter_key=filter_key if filter_key in {"category", "city"} else None,
        points=points,
    )


def _table_payload(title: str, columns: list[tuple[str, str]], rows: list[dict[str, Any]]) -> DetailTablePayload | None:
    if not rows:
        return None
    table_rows = []
    for row in rows:
        values = {key: str(value) for key, value in row.items() if not str(key).startswith("_")}
        table_rows.append(
            TableRow(
                values=values,
                interaction_type=row.get("_interaction_type"),
                interaction_key=row.get("_interaction_key"),
                interaction_value=row.get("_interaction_value"),
            )
        )
    return DetailTablePayload(
        title=title,
        columns=[TableColumn(key=key, label=label) for key, label in columns],
        rows=table_rows,
    )


def _pareto_breakdown_payload(
    title: str,
    x_title: str,
    y_title: str,
    current_df: pd.DataFrame,
    previous_df: pd.DataFrame,
    group_col: str,
    metric_format: str,
    limit: int = 8,
    label_transform: Callable[[str], str] | None = None,
    filter_key: str | None = None,
    interaction_type: str | None = None,
    interaction_key: str | None = None,
    interaction_label: str | None = None,
) -> BreakdownChartPayload | None:
    points = build_pareto_points(
        current_df=current_df,
        previous_df=previous_df,
        group_col=group_col,
        limit=limit,
        label_transform=label_transform,
    )
    if not points:
        return None
    return BreakdownChartPayload(
        title=title,
        x_title=x_title,
        y_title=y_title,
        metric_format=metric_format,
        analysis_mode="pareto",
        current_series_name="Current Revenue",
        cumulative_series_name="Cumulative Share",
        cumulative_y_title="Cumulative Share",
        current_trace_style="bar",
        filter_key=filter_key if filter_key in {"category", "city"} else None,
        interaction_type=interaction_type,
        interaction_key=interaction_key,
        interaction_label=interaction_label,
        points=points,
    )


def _empty_retention_snapshot(max_age: int) -> dict[str, Any]:
    return {
        "heatmap": None,
        "cohort_sizes": pd.Series(dtype="float64"),
        "counts": pd.DataFrame(columns=list(range(max_age + 1))),
        "latest_full_cohort_size": 0.0,
        "retention": {age: 0.0 for age in range(1, min(max_age, 3) + 1)},
        "curve": {age: 0.0 for age in range(max_age + 1)},
        "detail_rows": [],
        "cohort_start": None,
        "cohort_end": None,
    }


def _build_retention_snapshot(
    scoped_df: pd.DataFrame,
    start_date: pd.Timestamp,
    end_date: pd.Timestamp,
    max_age: int = 6,
) -> dict[str, Any]:
    activity = scoped_df.dropna(subset=["customer_id", "order_day"])[["customer_id", "order_day"]].copy()
    if activity.empty:
        return _empty_retention_snapshot(max_age)

    activity["order_month"] = activity["order_day"].dt.to_period("M").dt.to_timestamp()
    activity = activity.drop_duplicates(subset=["customer_id", "order_month"])
    cohort_map = activity.groupby("customer_id")["order_month"].min()
    activity["cohort_month"] = activity["customer_id"].map(cohort_map)

    cohort_start = _month_start(start_date)
    cohort_end = _month_start(end_date)
    activity = activity[(activity["cohort_month"] >= cohort_start) & (activity["cohort_month"] <= cohort_end) & (activity["order_month"] <= cohort_end)].copy()
    if activity.empty:
        snapshot = _empty_retention_snapshot(max_age)
        snapshot["cohort_start"] = cohort_start
        snapshot["cohort_end"] = cohort_end
        return snapshot

    activity["cohort_age"] = ((activity["order_month"].dt.year - activity["cohort_month"].dt.year) * 12 + (activity["order_month"].dt.month - activity["cohort_month"].dt.month))
    activity = activity[(activity["cohort_age"] >= 0) & (activity["cohort_age"] <= max_age)]
    if activity.empty:
        snapshot = _empty_retention_snapshot(max_age)
        snapshot["cohort_start"] = cohort_start
        snapshot["cohort_end"] = cohort_end
        return snapshot

    cohort_sizes = (activity[activity["cohort_age"] == 0].groupby("cohort_month")["customer_id"].nunique().sort_index().astype(float))
    if cohort_sizes.empty:
        snapshot = _empty_retention_snapshot(max_age)
        snapshot["cohort_start"] = cohort_start
        snapshot["cohort_end"] = cohort_end
        return snapshot

    counts = (activity.groupby(["cohort_month", "cohort_age"])["customer_id"].nunique().unstack(fill_value=0).reindex(index=cohort_sizes.index, columns=list(range(max_age + 1)), fill_value=0).astype(float))

    def weighted_retention(age: int) -> float:
        eligible = [cohort for cohort in cohort_sizes.index if cohort + pd.DateOffset(months=age) <= cohort_end]
        if not eligible:
            return 0.0
        denom = float(cohort_sizes.loc[eligible].sum())
        numer = float(counts.loc[eligible, age].sum())
        return (numer / denom * 100.0) if denom else 0.0

    curve = {age: (100.0 if age == 0 else weighted_retention(age)) for age in range(max_age + 1)}
    retention = {age: weighted_retention(age) for age in range(1, min(max_age, 3) + 1)}

    latest_full_month = _last_closed_cohort_month(end_date)
    latest_full_size = 0.0
    if latest_full_month is not None and latest_full_month in cohort_sizes.index:
        latest_full_size = float(cohort_sizes.loc[latest_full_month])

    x_labels = [f"M{age}" for age in range(max_age + 1)]
    y_labels: list[str] = []
    z_values: list[list[float | None]] = []
    detail_rows: list[dict[str, str]] = []

    for cohort in sorted(cohort_sizes.index.tolist(), reverse=True):
        cohort_size = float(cohort_sizes.loc[cohort])
        y_labels.append(pd.Timestamp(cohort).strftime("%b %Y"))
        row_values: list[float | None] = []
        for age in range(max_age + 1):
            mature = cohort + pd.DateOffset(months=age) <= cohort_end
            if not mature:
                row_values.append(None)
                continue
            numer = float(counts.loc[cohort, age])
            row_values.append((numer / cohort_size * 100.0) if cohort_size else 0.0)
        z_values.append(row_values)
        detail_rows.append({
            "cohort": pd.Timestamp(cohort).strftime("%b %Y"),
            "size": fmt_number(cohort_size),
            "m1": fmt_pct(row_values[1]) if row_values[1] is not None else "-",
            "m2": fmt_pct(row_values[2]) if row_values[2] is not None else "-",
            "m3": fmt_pct(row_values[3]) if row_values[3] is not None else "-",
        })

    return {
        "heatmap": HeatmapPayload(
            title="Retention Cohort Heatmap",
            x_labels=x_labels,
            y_labels=y_labels,
            z_values=z_values,
            metric_format="percent",
        ),
        "cohort_sizes": cohort_sizes,
        "counts": counts,
        "latest_full_cohort_size": latest_full_size,
        "retention": retention,
        "curve": curve,
        "detail_rows": detail_rows[:6],
        "cohort_start": cohort_start,
        "cohort_end": cohort_end,
    }


@dataclass(slots=True)
class DashboardService:
    revenue_service: RevenueService
    semantic_layer: SemanticLayer | None = None

    def _metric_definitions(self) -> dict[str, Any]:
        if self.semantic_layer is None:
            return {}
        return self.semantic_layer.metric_definitions()

    def _page_definitions(self) -> dict[str, Any]:
        if self.semantic_layer is None:
            return {}
        return self.semantic_layer.page_definitions()

    def _apply_semantic_config(self, payload: DashboardPayload) -> DashboardPayload:
        metrics = self._metric_definitions()
        pages = self._page_definitions()

        for card in payload.cards:
            metric_cfg = metrics.get(card.key)
            if metric_cfg:
                card.title = metric_cfg.get("label", card.title)

        page_cfg = pages.get(payload.page)
        if not page_cfg:
            return payload

        payload.title = page_cfg.get("label", payload.title)
        payload.subtitle = page_cfg.get("subtitle", payload.subtitle)
        payload.insight_note = page_cfg.get("insight_note")
        payload.interaction_hint = page_cfg.get("interaction_hint")
        payload.allowed_actions = list(page_cfg.get("allowed_actions", []))
        payload.primary_metric_key = page_cfg.get("primary_trend_metric")

        card_order = page_cfg.get("cards", [])
        if card_order:
            card_map = {card.key: card for card in payload.cards}
            ordered_cards = [card_map[key] for key in card_order if key in card_map]
            remaining_cards = [card for card in payload.cards if card.key not in card_order]
            payload.cards = ordered_cards + remaining_cards

        if payload.view_mode == "overview":
            if page_cfg.get("trend_title_template"):
                if payload.page in {"retention", "predictive"}:
                    payload.trend_title = page_cfg["trend_title_template"]
                else:
                    payload.trend_title = f"{page_cfg['trend_title_template']} by {payload.granularity}"
            if page_cfg.get("trend_x_title"):
                payload.trend_x_title = page_cfg.get("trend_x_title")
            if page_cfg.get("current_trace_style"):
                payload.current_trace_style = page_cfg.get("current_trace_style")
            if page_cfg.get("previous_trace_style"):
                payload.previous_trace_style = page_cfg.get("previous_trace_style")

        primary_key = page_cfg.get("primary_trend_metric")
        metric_cfg = metrics.get(primary_key, {})
        if metric_cfg:
            payload.trend_y_title = metric_cfg.get("label", payload.trend_y_title)
            payload.trend_metric_format = metric_cfg.get("format", payload.trend_metric_format)

        return payload
    def build_payload(
        self,
        page: PageName,
        scoped_df: pd.DataFrame,
        current_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
        full_df: pd.DataFrame | None = None,
        scenario_mode: ScenarioMode = "Base",
    ) -> DashboardPayload:
        full_df = full_df if full_df is not None else scoped_df
        if page == "revenue":
            payload = self._build_revenue(scoped_df, current_df, start_date, end_date, granularity)
            return self._apply_semantic_config(payload)
        if page == "sales":
            payload = self._build_sales(scoped_df, start_date, end_date, granularity)
            return self._apply_semantic_config(payload)
        if page == "predictive":
            payload = self._build_predictive(scoped_df, current_df, start_date, end_date, scenario_mode)
            return self._apply_semantic_config(payload)
        if page == "customers":
            payload = self._build_customers(scoped_df, full_df, start_date, end_date, granularity)
            return self._apply_semantic_config(payload)
        if page == "retention":
            payload = self._build_retention(scoped_df, start_date, end_date)
            return self._apply_semantic_config(payload)
        if page == "products":
            payload = self._build_products(scoped_df, start_date, end_date, granularity)
            return self._apply_semantic_config(payload)
        payload = self._build_operations(scoped_df, start_date, end_date, granularity)
        return self._apply_semantic_config(payload)

    def build_detail_payload(
        self,
        page: PageName,
        scoped_df: pd.DataFrame,
        current_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
        drilldown_key: str,
        drilldown_value: str,
        full_df: pd.DataFrame | None = None,
        scenario_mode: ScenarioMode = "Base",
    ) -> DrilldownDetailPayload:
        full_df = full_df if full_df is not None else scoped_df
        if page == "sales" and drilldown_key == "category":
            return self._build_sales_category_detail(current_df, start_date, end_date, drilldown_value)
        if page == "predictive" and drilldown_key == "category":
            return self._build_predictive_category_detail(current_df, start_date, end_date, drilldown_value, scenario_mode)
        if page == "customers" and drilldown_key == "segment":
            return self._build_customer_segment_detail(current_df, end_date, drilldown_value)
        if page == "products" and drilldown_key == "abc_class":
            return self._build_product_class_detail(scoped_df, start_date, end_date, drilldown_value)
        raise ValueError(f"Unsupported drilldown for {page}: {drilldown_key}")

    def _build_sales_category_detail(
        self,
        current_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        category: str,
    ) -> DrilldownDetailPayload:
        scoped = current_df[current_df["category"] == category].copy()
        product_points = build_pareto_points(
            current_df=scoped,
            previous_df=scoped.iloc[0:0].copy(),
            group_col="product_name",
            limit=min(max(int(scoped["product_name"].dropna().nunique()), 1), 20) if not scoped.empty else 1,
        )
        category_revenue = _sum_sales(scoped)
        rows = []
        for point in product_points:
            product_frame = scoped[scoped["product_name"] == point.raw_label]
            rows.append(
                {
                    "product": str(point.raw_label),
                    "revenue": fmt_currency(point.current_value),
                    "share_in_category": fmt_pct((point.current_value / category_revenue * 100.0) if category_revenue else 0.0),
                    "cumulative": fmt_pct(point.cumulative_pct or 0.0),
                    "abc": point.segment_class or "-",
                    "orders": fmt_number(_orders_count(product_frame)),
                    "avg_ticket": fmt_currency(_average_ticket(product_frame)),
                }
            )
        table = _table_payload(
            title=f"Products inside {category}",
            columns=[("product", "Product"), ("revenue", "Revenue"), ("share_in_category", "Share in Category"), ("cumulative", "Cumulative"), ("abc", "ABC"), ("orders", "Orders"), ("avg_ticket", "Avg Ticket")],
            rows=rows,
        )
        return DrilldownDetailPayload(
            page="sales",
            title=f"Products inside {category}",
            subtitle=f"Top products ranked by revenue contribution inside the selected category from {start_date.date().isoformat()} to {end_date.date().isoformat()}.",
            table=table or DetailTablePayload(title=f"Products inside {category}"),
        )

    def _build_customer_segment_detail(
        self,
        current_df: pd.DataFrame,
        end_date: pd.Timestamp,
        segment: str,
    ) -> DrilldownDetailPayload:
        customer_frame = build_rfm_customer_frame(current_df, end_date)
        scoped = customer_frame[customer_frame["segment"] == segment].sort_values(["revenue", "orders"], ascending=[False, False]).head(20)
        rows = [
            {
                "customer": _display_label(row["customer_name"] or str(row["customer_id"]), max_len=30),
                "city": str(row["city"]),
                "revenue": fmt_currency(float(row["revenue"])),
                "orders": fmt_number(float(row["orders"])),
                "recency": fmt_number(float(row["recency_days"])),
                "last_order": pd.Timestamp(row["last_order_day"]).strftime("%Y-%m-%d"),
            }
            for _, row in scoped.iterrows()
        ]
        table = _table_payload(
            title=f"Customers inside {segment}",
            columns=[("customer", "Customer"), ("city", "City"), ("revenue", "Revenue"), ("orders", "Orders"), ("recency", "Recency (Days)"), ("last_order", "Last Order")],
            rows=rows,
        )
        return DrilldownDetailPayload(
            page="customers",
            title=f"Customers inside {segment}",
            subtitle="Highest-revenue customers in the selected RFM segment. Use recency and order count to decide retention or win-back actions.",
            table=table or DetailTablePayload(title=f"Customers inside {segment}"),
        )

    def _build_product_class_detail(
        self,
        scoped_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        abc_class: str,
    ) -> DrilldownDetailPayload:
        current_df, previous_df, _, _ = range_with_previous(scoped_df, start_date, end_date)
        product_points = build_pareto_points(
            current_df=current_df,
            previous_df=previous_df,
            group_col="product_name",
            limit=max(int(current_df["product_name"].dropna().nunique()), 1) if not current_df.empty else 1,
        )
        selected = [point for point in product_points if point.segment_class == abc_class][:20]
        total_revenue = _sum_sales(current_df)
        total_previous_revenue = _sum_sales(previous_df)
        rows = []
        for point in selected:
            product_frame = current_df[current_df["product_name"] == point.raw_label]
            category = str(product_frame["category"].mode().iloc[0]) if not product_frame.empty and not product_frame["category"].mode().empty else "Unknown"
            current_share = (point.current_value / total_revenue * 100.0) if total_revenue else 0.0
            previous_share = (point.previous_value / total_previous_revenue * 100.0) if total_previous_revenue else 0.0
            rows.append(
                {
                    "product": str(point.raw_label),
                    "category": category,
                    "revenue": fmt_currency(point.current_value),
                    "share_total": fmt_pct(current_share),
                    "previous_share": fmt_pct(previous_share),
                    "mix_shift": f"{current_share - previous_share:+.2f} pp",
                    "cumulative": fmt_pct(point.cumulative_pct or 0.0),
                    "qty": fmt_number(_quantity_sum(product_frame)),
                    "avg_unit_price": fmt_currency(_avg_unit_price(product_frame)),
                }
            )
        table = _table_payload(
            title=f"Products in class {abc_class}",
            columns=[("product", "Product"), ("category", "Category"), ("revenue", "Revenue"), ("share_total", "Share of Total"), ("previous_share", "Previous Share"), ("mix_shift", "Mix Shift (pp)"), ("cumulative", "Cumulative"), ("qty", "Qty"), ("avg_unit_price", "Avg Unit Price")],
            rows=rows,
        )
        return DrilldownDetailPayload(
            page="products",
            title=f"Products in class {abc_class}",
            subtitle=f"Products currently classified as {abc_class} from {start_date.date().isoformat()} to {end_date.date().isoformat()}. Use mix shift to see which products are gaining or losing portfolio weight.",
            table=table or DetailTablePayload(title=f"Products in class {abc_class}"),
        )

    def _base_payload(
        self,
        page: PageName,
        title: str,
        subtitle: str,
        granularity: Granularity,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        cards: list[KpiCard],
        trend: list,
        trend_title: str,
        trend_y_title: str,
        comparison_rule: str,
        summary: list[str],
        trend_metric_format: str = "currency",
        current_series_name: str = "Current",
        previous_series_name: str = "Previous",
        current_trace_style: str = "line",
        previous_trace_style: str = "line",
        primary_heatmap: HeatmapPayload | None = None,
        secondary_chart: BreakdownChartPayload | None = None,
        detail_table: DetailTablePayload | None = None,
        view_mode: str = "overview",
        selected_period_label: str | None = None,
        scenario_mode: ScenarioMode | None = None,
    ) -> DashboardPayload:
        return DashboardPayload(
            page=page,
            title=title,
            subtitle=subtitle,
            granularity=granularity,
            start_date=start_date.date().isoformat(),
            end_date=end_date.date().isoformat(),
            comparison_rule=comparison_rule,
            cards=cards,
            trend=trend,
            trend_title=trend_title,
            trend_x_title=granularity,
            trend_y_title=trend_y_title,
            trend_metric_format=trend_metric_format,
            scenario_mode=scenario_mode,
            current_series_name=current_series_name,
            previous_series_name=previous_series_name,
            current_trace_style=current_trace_style,
            previous_trace_style=previous_trace_style,
            primary_heatmap=primary_heatmap,
            secondary_chart=secondary_chart,
            detail_table=detail_table,
            view_mode=view_mode,
            selected_period_label=selected_period_label,
            summary=summary,
        )

    def build_sales_drilldown_payload(
        self,
        scoped_df: pd.DataFrame,
        global_start: pd.Timestamp,
        global_end: pd.Timestamp,
        source_granularity: Granularity,
        period_key: str,
    ) -> DashboardPayload:
        overview = self._build_sales(scoped_df, global_start, global_end, source_granularity)
        current_start, current_end, period_label = period_bounds_from_key(period_key, source_granularity)

        current_start = max(current_start, global_start)
        current_end = min(current_end, global_end)
        if current_start > current_end:
            return self._base_payload(
                page="sales",
                title=overview.title,
                subtitle=overview.subtitle,
                granularity=source_granularity,
                start_date=global_start,
                end_date=global_end,
                cards=overview.cards,
                trend=[],
                trend_title=f"Daily Drilldown - {period_label}",
                trend_y_title="Sales Amount",
                comparison_rule="Selected period has no overlap with current filter range.",
                summary=["Selected period is outside current filters."],
                trend_metric_format="currency",
                current_trace_style="bar",
                previous_trace_style="line",
                secondary_chart=None,
                detail_table=None,
                view_mode="drilldown",
                selected_period_label=period_label,
            )

        window_days = int((current_end - current_start).days)
        previous_end = current_start - pd.Timedelta(days=1)
        previous_start = previous_end - pd.Timedelta(days=window_days)
        trend = build_daily_trend_for_period_comparison(
            scoped_df=scoped_df,
            current_start=current_start,
            current_end=current_end,
            previous_start=previous_start,
        )

        summary = [
            f"Daily comparison for {period_label} versus the previous aligned window.",
            "Use this view to inspect whether the aggregate period result is driven by a few days or by broad daily movement.",
            "Driver breakdowns are hidden in drilldown mode to keep the analysis focused on the clicked period.",
        ]

        return self._apply_semantic_config(
            self._base_payload(
                page="sales",
                title=overview.title,
                subtitle=overview.subtitle,
                granularity=source_granularity,
                start_date=global_start,
                end_date=global_end,
                cards=overview.cards,
                trend=trend,
                trend_title=f"Daily Comparison inside {period_label}",
                trend_y_title="Sales Amount",
                comparison_rule="Clicked period decomposed by day against the previous aligned period of the same length.",
                summary=summary,
                trend_metric_format="currency",
                current_trace_style="bar",
                previous_trace_style="line",
                secondary_chart=None,
                detail_table=None,
                view_mode="drilldown",
                selected_period_label=period_label,
            )
        )

    def _build_revenue(
        self,
        scoped_df: pd.DataFrame,
        current_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
    ) -> DashboardPayload:
        revenue_payload = self.revenue_service.build_payload(
            scoped_df=scoped_df,
            current_df=current_df,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
        )
        revenue_payload.trend = annotate_trend_anomalies(revenue_payload.trend)
        secondary_chart = _build_breakdown_chart(
            title="Revenue by City",
            x_title="City",
            y_title="Revenue",
            current_df=current_df,
            previous_df=range_with_previous(scoped_df, start_date, end_date)[1],
            group_col="city",
            metric_fn=_sum_sales,
            metric_format="currency",
            limit=6,
            current_trace_style="bar",
            previous_trace_style="bar",
            filter_key="city",
        )

        anomalies = [point for point in revenue_payload.trend if point.is_anomaly]
        structural_shifts = detect_structural_shifts(
            revenue_payload.trend,
            window=3 if granularity in {"Month", "Quarter"} else 2,
            threshold=1.75,
        )
        shift_index = {str(shift["period_key"]): shift for shift in structural_shifts}
        for point in revenue_payload.trend:
            shift = shift_index.get(str(point.period_key))
            point.is_structural_shift = shift is not None
            point.shift_score = float(shift["score"]) if shift else None
            point.shift_direction = str(shift["direction"]) if shift else None

        signal_rows = [
            {
                "signal": "Anomaly",
                "period": point.period_label,
                "value": fmt_currency(point.current_value),
                "reference": fmt_currency(point.baseline_value or 0.0),
                "change": f"{point.delta_pct:+.2f}%",
                "evidence": f"z={point.anomaly_score:+.2f}" if point.anomaly_score is not None else "-",
            }
            for point in sorted(anomalies, key=lambda item: abs(item.anomaly_score or 0.0), reverse=True)[:6]
        ]
        signal_rows.extend(
            {
                "signal": str(shift["direction"]),
                "period": str(shift["period_label"]),
                "value": fmt_currency(float(shift["after_mean"])),
                "reference": fmt_currency(float(shift["before_mean"])),
                "change": f"{safe_pct(float(shift['after_mean']), float(shift['before_mean'])):+.2f}%",
                "evidence": f"shift score={float(shift['score']):.2f}",
            }
            for shift in structural_shifts[:4]
        )
        if signal_rows:
            detail_table = _table_payload(
                title="Revenue Signal Log",
                columns=[("signal", "Signal"), ("period", "Period"), ("value", "Observed / After"), ("reference", "Baseline / Before"), ("change", "Change"), ("evidence", "Evidence")],
                rows=signal_rows,
            )
        else:
            detail_table = _table_payload(
                title="Period Ledger",
                columns=[("period", "Period"), ("current", "Revenue"), ("previous", "Previous"), ("delta", "Delta")],
                rows=[
                    {
                        "period": point.period_label,
                        "current": fmt_currency(point.current_value),
                        "previous": fmt_currency(point.previous_value or 0.0),
                        "delta": f"{point.delta_pct:+.2f}%",
                    }
                    for point in revenue_payload.trend[-8:]
                ],
            )

        summary = list(revenue_payload.summary)
        if anomalies:
            strongest = sorted(anomalies, key=lambda item: abs(item.anomaly_score or 0.0), reverse=True)[0]
            direction = "above" if strongest.current_value >= (strongest.baseline_value or 0.0) else "below"
            summary.insert(
                1,
                f"{len(anomalies)} unusually volatile {granularity.lower()} periods were flagged; {strongest.period_label} sits {direction} the trailing baseline with robust z-score {strongest.anomaly_score:+.2f}.",
            )
        else:
            summary.insert(
                1,
                f"No statistically unusual {granularity.lower()} periods were detected against the recent trailing baseline.",
            )
        if structural_shifts:
            shift = structural_shifts[0]
            summary.insert(
                2,
                f"A likely structural {str(shift['direction']).lower()} was detected around {shift['period_label']}; average revenue moved from {fmt_currency(float(shift['before_mean']))} to {fmt_currency(float(shift['after_mean']))} across adjacent windows.",
            )
        else:
            summary.insert(
                2,
                f"No structural break was strong enough to suggest a persistent level shift in {granularity.lower()} revenue.",
            )

        return self._base_payload(
            page="revenue",
            title="Revenue Trends",
            subtitle="Revenue run-rate, anomaly signals and overall trajectory across the selected slice.",
            granularity=granularity,
            start_date=start_date,
            end_date=end_date,
            cards=revenue_payload.cards,
            trend=revenue_payload.trend,
            trend_title=f"Revenue Trend by {granularity}",
            trend_y_title="Sales Amount",
            comparison_rule=revenue_payload.comparison_rule,
            summary=summary,
            trend_metric_format="currency",
            current_trace_style="line",
            previous_trace_style="line",
            secondary_chart=secondary_chart,
            detail_table=detail_table,
        )

    def _build_predictive(
        self,
        scoped_df: pd.DataFrame,
        current_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        scenario_mode: ScenarioMode = "Base",
    ) -> DashboardPayload:
        current_df, previous_df, _, previous_end = range_with_previous(scoped_df, start_date, end_date)
        history_df, history_start, history_end, uses_closed_months = _select_closed_month_history(current_df, start_date, end_date)

        revenue_series = build_monthly_sum_series(history_df)
        orders_series = build_monthly_distinct_series(history_df, "order_id")
        customers_series = build_monthly_distinct_series(history_df, "customer_id")

        base_trend, revenue_fit = build_predictive_trend(revenue_series, horizon=3)
        _, orders_fit = build_predictive_trend(orders_series, horizon=1)
        _, customers_fit = build_predictive_trend(customers_series, horizon=1)
        trend = apply_scenario_to_trend(base_trend, scenario_mode)

        latest_revenue_actual = float(revenue_series.iloc[-1]) if not revenue_series.empty else 0.0
        latest_orders_actual = float(orders_series.iloc[-1]) if not orders_series.empty else 0.0
        latest_customers_actual = float(customers_series.iloc[-1]) if not customers_series.empty else 0.0
        base_revenue_forecast = float(revenue_fit.forecast.iloc[0]) if not revenue_fit.forecast.empty else latest_revenue_actual
        base_orders_forecast = float(orders_fit.forecast.iloc[0]) if not orders_fit.forecast.empty else latest_orders_actual
        base_customers_forecast = float(customers_fit.forecast.iloc[0]) if not customers_fit.forecast.empty else latest_customers_actual
        forecast_low = float(revenue_fit.lower.iloc[0]) if not revenue_fit.lower.empty else base_revenue_forecast
        forecast_high = float(revenue_fit.upper.iloc[0]) if not revenue_fit.upper.empty else base_revenue_forecast
        next_revenue_forecast = _scenario_pick(base_revenue_forecast, forecast_low, forecast_high, scenario_mode)
        next_orders_forecast = _scenario_pick(
            base_orders_forecast,
            float(orders_fit.lower.iloc[0]) if not orders_fit.lower.empty else base_orders_forecast,
            float(orders_fit.upper.iloc[0]) if not orders_fit.upper.empty else base_orders_forecast,
            scenario_mode,
        )
        next_customers_forecast = _scenario_pick(
            base_customers_forecast,
            float(customers_fit.lower.iloc[0]) if not customers_fit.lower.empty else base_customers_forecast,
            float(customers_fit.upper.iloc[0]) if not customers_fit.upper.empty else base_customers_forecast,
            scenario_mode,
        )

        current_rfm = build_rfm_segment_summary(current_df, end_date)
        previous_rfm = build_rfm_segment_summary(previous_df, previous_end)
        risk_segments = {"At Risk", "Hibernating"}
        revenue_at_risk_current = float(current_rfm[current_rfm["segment"].isin(risk_segments)]["revenue"].sum()) if not current_rfm.empty else 0.0
        revenue_at_risk_previous = float(previous_rfm[previous_rfm["segment"].isin(risk_segments)]["revenue"].sum()) if not previous_rfm.empty else 0.0

        scenario_title = scenario_series_name(scenario_mode)
        cards = [
            make_card("next_month_revenue_forecast", f"Next Month Revenue ({scenario_title})", next_revenue_forecast, latest_revenue_actual, fmt_currency),
            make_card("next_month_orders_forecast", f"Next Month Orders ({scenario_title})", next_orders_forecast, latest_orders_actual, fmt_number),
            make_card("next_month_active_customers_forecast", f"Next Month Active Customers ({scenario_title})", next_customers_forecast, latest_customers_actual, fmt_number),
            make_card("revenue_at_risk", "Revenue At Risk", revenue_at_risk_current, revenue_at_risk_previous, fmt_currency),
        ]

        drivers = build_driver_forecasts(history_df, group_col="category", horizon=1, limit=6)
        secondary_chart = (
            BreakdownChartPayload(
                title="Projected Next-Month Revenue by Category",
                x_title="Category",
                y_title="Revenue",
                metric_format="currency",
                current_series_name=scenario_title,
                previous_series_name="Latest Closed Month",
                current_trace_style="bar",
                previous_trace_style="bar",
                interaction_type="detail",
                interaction_key="category",
                interaction_label="Select a category to inspect the products most likely to drive next-month performance",
                points=build_driver_breakdown_points(drivers, scenario_mode=scenario_mode),
            )
            if drivers
            else None
        )

        detail_table = _table_payload(
            title="Next-Step Watchlist",
            columns=[("category", "Category"), ("latest_month", "Latest Closed Month"), ("forecast_selected", scenario_title), ("scenario_range", "Low / High Case"), ("delta", "Forecast Delta"), ("forecast_share", "Forecast Share"), ("share_shift", "Share Shift (pp)"), ("recent_growth", "Recent 3M Growth"), ("action", "Recommended Action")],
            rows=[
                {
                    "category": _display_label(driver.label, max_len=26),
                    "latest_month": fmt_currency(driver.latest_actual),
                    "forecast_selected": fmt_currency(driver_scenario_value(driver, scenario_mode)),
                    "scenario_range": f"{fmt_currency(driver.forecast_low)} - {fmt_currency(driver.forecast_high)}",
                    "delta": f"{driver_scenario_delta_pct(driver, scenario_mode):+.2f}%",
                    "forecast_share": fmt_pct(driver_scenario_share(driver, scenario_mode)),
                    "share_shift": f"{driver_share_shift_pct(driver, scenario_mode):+.2f} pp",
                    "recent_growth": f"{driver.recent_growth_pct:+.2f}%",
                    "action": driver.action,
                    "_interaction_type": "detail",
                    "_interaction_key": "category",
                    "_interaction_value": driver.raw_label,
                }
                for driver in drivers
            ],
        )

        next_quarter_base = float(revenue_fit.forecast.sum()) if not revenue_fit.forecast.empty else base_revenue_forecast
        next_quarter_low = float(revenue_fit.lower.sum()) if not revenue_fit.lower.empty else forecast_low
        next_quarter_high = float(revenue_fit.upper.sum()) if not revenue_fit.upper.empty else forecast_high
        backtest_mape = rolling_backtest_mape(revenue_series)
        lead_driver = max(drivers, key=lambda item: driver_scenario_share(item, scenario_mode)) if drivers else None
        share_gainer = max(drivers, key=lambda item: driver_share_shift_pct(item, scenario_mode)) if drivers else None
        share_loser = min(drivers, key=lambda item: driver_share_shift_pct(item, scenario_mode)) if drivers else None
        history_label = (
            f"closed months from {history_start.strftime('%b %Y')} to {history_end.strftime('%b %Y')}"
            if uses_closed_months
            else f"selected history from {history_start.strftime('%b %Y')} to {history_end.strftime('%b %Y')}"
        )
        scenario_case = _scenario_case_label(scenario_mode)
        summary = [
            f"{scenario_case.capitalize()} next-month revenue is {fmt_currency(next_revenue_forecast)}; the model base range still spans {fmt_currency(forecast_low)} to {fmt_currency(forecast_high)} with recent backtest MAPE at {backtest_mape:.2f}% using {history_label}.",
            (
                f"{lead_driver.label} remains the largest projected category at {driver_scenario_share(lead_driver, scenario_mode):.2f}% of forecast revenue, while mix shifts toward {share_gainer.label} by {driver_share_shift_pct(share_gainer, scenario_mode):+.2f} pp and away from {share_loser.label} by {driver_share_shift_pct(share_loser, scenario_mode):+.2f} pp."
                if lead_driver and share_gainer and share_loser
                else "Not enough stable category history is available to rank next-month drivers."
            ),
            f"Revenue currently sitting in At Risk and Hibernating segments is {fmt_currency(revenue_at_risk_current)}. Use the watchlist to decide where to defend, accelerate or investigate before the next month closes.",
        ]

        return self._base_payload(
            page="predictive",
            title="Predictive Outlook",
            subtitle="Forward-looking revenue baseline, next-month drivers and business watchlist across the selected slice.",
            granularity="Month",
            start_date=start_date,
            end_date=end_date,
            cards=cards,
            trend=trend,
            trend_title="Monthly Revenue Forecast",
            trend_y_title="Revenue Forecast",
            comparison_rule="Forecast uses Holt linear smoothing on monthly history inside the selected window. The dashed line is the model baseline and the shaded band is an approximate 95% range derived from residual volatility.",
            summary=summary,
            trend_metric_format="currency",
            scenario_mode=scenario_mode,
            current_series_name="Actual",
            previous_series_name="Model Baseline",
            current_trace_style="line",
            previous_trace_style="line",
            secondary_chart=secondary_chart,
            detail_table=detail_table,
        )

    def _build_predictive_category_detail(
        self,
        current_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        category: str,
        scenario_mode: ScenarioMode = "Base",
    ) -> DrilldownDetailPayload:
        scoped = current_df[current_df["category"] == category].copy()
        history_df, history_start, history_end, uses_closed_months = _select_closed_month_history(scoped, start_date, end_date)
        drivers = build_driver_forecasts(history_df, group_col="product_name", horizon=1, limit=15)
        scenario_title = scenario_series_name(scenario_mode)
        rows = [
            {
                "product": str(driver.label),
                "latest_month": fmt_currency(driver.latest_actual),
                "forecast_selected": fmt_currency(driver_scenario_value(driver, scenario_mode)),
                "scenario_range": f"{fmt_currency(driver.forecast_low)} - {fmt_currency(driver.forecast_high)}",
                "delta": f"{driver_scenario_delta_pct(driver, scenario_mode):+.2f}%",
                "share_in_category": fmt_pct(driver_scenario_share(driver, scenario_mode)),
                "share_shift": f"{driver_share_shift_pct(driver, scenario_mode):+.2f} pp",
                "recent_growth": f"{driver.recent_growth_pct:+.2f}%",
                "action": driver.action,
            }
            for driver in drivers
        ]
        table = _table_payload(
            title=f"Forecast driver products inside {category}",
            columns=[("product", "Product"), ("latest_month", "Latest Closed Month"), ("forecast_selected", scenario_title), ("scenario_range", "Low / High Case"), ("delta", "Forecast Delta"), ("share_in_category", "Forecast Share"), ("share_shift", "Share Shift (pp)"), ("recent_growth", "Recent 3M Growth"), ("action", "Recommended Action")],
            rows=rows,
        )
        range_label = (
            f"closed months from {history_start.strftime('%b %Y')} to {history_end.strftime('%b %Y')}"
            if uses_closed_months
            else f"selected history from {history_start.strftime('%b %Y')} to {history_end.strftime('%b %Y')}"
        )
        return DrilldownDetailPayload(
            page="predictive",
            title=f"Forecast driver products inside {category}",
            subtitle=f"Products ranked under the { _scenario_case_label(scenario_mode) } inside {category}, using {range_label}.",
            table=table or DetailTablePayload(title=f"Forecast driver products inside {category}"),
        )

    def _build_sales(

        self,
        scoped_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
    ) -> DashboardPayload:
        current_df, previous_df, _, _ = range_with_previous(scoped_df, start_date, end_date)

        cards = [
            make_card("sales_amount", "Sales Amount", _sum_sales(current_df), _sum_sales(previous_df), fmt_currency),
            make_card("orders_count", "Orders Count", _orders_count(current_df), _orders_count(previous_df), fmt_number),
            make_card("average_ticket", "Average Ticket", _average_ticket(current_df), _average_ticket(previous_df), fmt_currency),
            make_card("avg_items_per_order", "Avg Items / Order", _avg_items_per_order(current_df), _avg_items_per_order(previous_df), fmt_decimal),
        ]
        trend = build_aligned_trend(
            scoped_df=scoped_df,
            current_df=current_df,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            aggregator=_sum_sales,
            optimized_sum_col="sales_amount",
        )
        secondary_chart = _pareto_breakdown_payload(
            title="Category Pareto (Revenue)",
            x_title="Category",
            y_title="Sales Amount",
            current_df=current_df,
            previous_df=previous_df,
            group_col="category",
            metric_format="currency",
            limit=8,
            interaction_type="detail",
            interaction_key="category",
            interaction_label="Select a category to inspect the products driving it",
        )

        pareto_points = secondary_chart.points if secondary_chart else []
        detail_table = _table_payload(
            title="Category Pareto Detail",
            columns=[("category", "Category"), ("sales", "Sales"), ("share", "Share"), ("cumulative", "Cumulative"), ("class", "ABC"), ("orders", "Orders"), ("ticket", "Avg Ticket")],
            rows=[
                {
                    "category": point.label,
                    "sales": fmt_currency(point.current_value),
                    "share": fmt_pct(point.share_pct or 0.0),
                    "cumulative": fmt_pct(point.cumulative_pct or 0.0),
                    "class": point.segment_class or "-",
                    "orders": fmt_number(_orders_count(current_df[current_df["category"] == point.raw_label])),
                    "ticket": fmt_currency(_average_ticket(current_df[current_df["category"] == point.raw_label])),
                    "_interaction_type": "detail",
                    "_interaction_key": "category",
                    "_interaction_value": point.raw_label,
                }
                for point in pareto_points
            ],
        )

        class_a_points = [point for point in pareto_points if point.segment_class == "A"]
        class_a_coverage = class_a_points[-1].cumulative_pct if class_a_points else 0.0
        summary = [
            f"Revenue in the selected window is {cards[0].formatted_value}, versus {cards[0].formatted_previous_value} in the previous equivalent window ({cards[0].delta_label}).",
            f"Order volume is {cards[1].formatted_value} while Average Ticket is {cards[2].formatted_value}, separating demand change from ticket-size change.",
            f"Pareto view shows {len(class_a_points)} A-class categories cover {class_a_coverage:.2f}% of revenue; click a category to inspect the products inside it.",
        ]
        if trend:
            latest = trend[-1]
            summary[2] = f"Latest visible {granularity.lower()} ({latest.period_label}) moved {latest.delta_pct:+.2f}% versus the previous equivalent period; the category Pareto shows whether that move came from a narrow set of categories."
        return self._base_payload(
            page="sales",
            title="Sales Overview",
            subtitle="Topline revenue, order volume and category concentration across the selected slice.",
            granularity=granularity,
            start_date=start_date,
            end_date=end_date,
            cards=cards,
            trend=trend,
            trend_title=f"Sales Amount by {granularity}",
            trend_y_title="Sales Amount",
            comparison_rule="Cards compare the selected window versus the previous window of the same length. Trend points compare each visible period against the previous equivalent period; partial edge periods are aligned by day position.",
            summary=summary,
            trend_metric_format="currency",
            current_trace_style="bar",
            previous_trace_style="line",
            secondary_chart=secondary_chart,
            detail_table=detail_table,
        )

    def _build_customers(
        self,
        scoped_df: pd.DataFrame,
        full_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
    ) -> DashboardPayload:
        current_df, previous_df, previous_start, previous_end = range_with_previous(scoped_df, start_date, end_date)

        active_current = _customers_count(current_df)
        active_previous = _customers_count(previous_df)
        new_current = _customer_new_counts(full_df, current_df, start_date, end_date)
        new_previous = _customer_new_counts(full_df, previous_df, previous_start, previous_end)
        returning_current = max(active_current - new_current, 0.0)
        returning_previous = max(active_previous - new_previous, 0.0)
        repeat_rate_current = _customer_repeat_rate(current_df)
        repeat_rate_previous = _customer_repeat_rate(previous_df)
        orders_per_customer_current = (_orders_count(current_df) / active_current) if active_current else 0.0
        orders_per_customer_previous = (_orders_count(previous_df) / active_previous) if active_previous else 0.0
        revenue_per_customer_current = (_sum_sales(current_df) / active_current) if active_current else 0.0
        revenue_per_customer_previous = (_sum_sales(previous_df) / active_previous) if active_previous else 0.0

        cards = [
            make_card("active_customers", "Active Customers", active_current, active_previous, fmt_number),
            make_card("repeat_rate", "Repeat Purchase Rate", repeat_rate_current, repeat_rate_previous, fmt_pct),
            make_card("returning_customers", "Returning Customers", returning_current, returning_previous, fmt_number),
            make_card("new_customers", "New Customers", new_current, new_previous, fmt_number),
            make_card("orders_per_customer", "Orders per Active Customer", orders_per_customer_current, orders_per_customer_previous, fmt_decimal),
            make_card("revenue_per_customer", "Revenue per Active Customer", revenue_per_customer_current, revenue_per_customer_previous, fmt_currency),
        ]
        trend = build_aligned_trend(
            scoped_df=scoped_df,
            current_df=current_df,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            aggregator=_customers_count,
        )

        current_rfm = build_rfm_segment_summary(current_df, end_date)
        previous_rfm = build_rfm_segment_summary(previous_df, previous_end)
        segment_order = [
            "Champions",
            "Loyal",
            "Potential Loyalists",
            "Needs Attention",
            "At Risk",
            "Hibernating",
        ]
        segment_map_current = current_rfm.set_index("segment")["revenue"].to_dict() if not current_rfm.empty else {}
        segment_map_previous = previous_rfm.set_index("segment")["revenue"].to_dict() if not previous_rfm.empty else {}
        segment_points = []
        for segment in segment_order:
            current_value = float(segment_map_current.get(segment, 0.0))
            previous_value = float(segment_map_previous.get(segment, 0.0))
            if current_value == 0.0 and previous_value == 0.0:
                continue
            segment_points.append(
                BreakdownPoint(
                    label=segment,
                    raw_label=segment,
                    current_value=current_value,
                    previous_value=previous_value,
                    delta_pct=safe_pct(current_value, previous_value),
                )
            )

        secondary_chart = (
            BreakdownChartPayload(
                title="Revenue by RFM Segment",
                x_title="RFM Segment",
                y_title="Revenue",
                metric_format="currency",
                current_trace_style="bar",
                previous_trace_style="bar",
                interaction_type="detail",
                interaction_key="segment",
                interaction_label="Select a segment to inspect the customers inside it",
                points=segment_points,
            )
            if segment_points
            else None
        )

        detail_rows = [
            {
                "segment": str(row["segment"]),
                "customers": fmt_number(float(row["customers"])),
                "revenue": fmt_currency(float(row["revenue"])),
                "share": fmt_pct(float(row["share_pct"])),
                "orders": fmt_number(float(row["orders"])),
                "orders_per_customer": fmt_decimal(float(row["avg_orders_per_customer"])),
                "recency": fmt_number(float(row["median_recency_days"])),
                "_interaction_type": "detail",
                "_interaction_key": "segment",
                "_interaction_value": str(row["segment"]),
            }
            for _, row in current_rfm.iterrows()
        ]
        detail_table = _table_payload(
            title="RFM Segment Detail",
            columns=[("segment", "Segment"), ("customers", "Customers"), ("revenue", "Revenue"), ("share", "Revenue Share"), ("orders", "Orders"), ("orders_per_customer", "Orders / Customer"), ("recency", "Median Recency (Days)")],
            rows=detail_rows,
        )

        acquisition_share = (new_current / active_current * 100.0) if active_current else 0.0
        if not current_rfm.empty:
            top_segment = current_rfm.sort_values("revenue", ascending=False).iloc[0]
            premium_share = float(current_rfm[current_rfm["segment"].isin(["Champions", "Loyal"])]["share_pct"].sum())
            risk_share = float(current_rfm[current_rfm["segment"].isin(["At Risk", "Hibernating"])]["share_pct"].sum())
            segment_read = f"RFM shows {top_segment['segment']} as the largest revenue block at {float(top_segment['share_pct']):.2f}% of current-window revenue."
            risk_read = f"High-value segments (Champions + Loyal) account for {premium_share:.2f}% of revenue, while At Risk + Hibernating account for {risk_share:.2f}%."
        else:
            segment_read = "RFM segmentation needs active customers inside the selected window to produce a stable read."
            risk_read = "No RFM segment detail is available for the active filter context."

        summary = [
            f"Active customer base is {cards[0].formatted_value}; Repeat Purchase Rate is {cards[1].formatted_value}, which shows how much of the base is buying more than once inside the window.",
            f"Acquisition mix is {acquisition_share:.2f}% new customers and {100.0 - acquisition_share:.2f}% returning customers, using first-ever purchase date as the definition of new.",
            f"{segment_read} {risk_read} Click a segment to inspect the actual customers inside it.",
        ]
        return self._base_payload(
            page="customers",
            title="Customer Segmentation",
            subtitle="Customer base size, retention quality and RFM value segmentation across the selected slice.",
            granularity=granularity,
            start_date=start_date,
            end_date=end_date,
            cards=cards,
            trend=trend,
            trend_title=f"Active Customers by {granularity}",
            trend_y_title="Active Customers",
            comparison_rule="Customer KPIs compare the selected window against the previous window of the same length. Trend points compare each visible period against the previous equivalent period; partial edge periods are aligned by day position.",
            summary=summary,
            trend_metric_format="number",
            current_trace_style="bar",
            previous_trace_style="line",
            secondary_chart=secondary_chart,
            detail_table=detail_table,
        )

    def _build_retention(
        self,
        scoped_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
    ) -> DashboardPayload:
        _, _, previous_start, previous_end = range_with_previous(scoped_df, start_date, end_date)
        current_snapshot = _build_retention_snapshot(scoped_df, start_date, end_date)
        previous_snapshot = _build_retention_snapshot(scoped_df, previous_start, previous_end)

        cards = [
            make_card(
                "latest_full_cohort_size",
                "Latest Full Cohort Size",
                current_snapshot["latest_full_cohort_size"],
                previous_snapshot["latest_full_cohort_size"],
                fmt_number,
            ),
            make_card(
                "retention_m1",
                "Month 1 Retention",
                current_snapshot["retention"].get(1, 0.0),
                previous_snapshot["retention"].get(1, 0.0),
                fmt_pct,
            ),
            make_card(
                "retention_m2",
                "Month 2 Retention",
                current_snapshot["retention"].get(2, 0.0),
                previous_snapshot["retention"].get(2, 0.0),
                fmt_pct,
            ),
            make_card(
                "retention_m3",
                "Month 3 Retention",
                current_snapshot["retention"].get(3, 0.0),
                previous_snapshot["retention"].get(3, 0.0),
                fmt_pct,
            ),
        ]

        secondary_chart = BreakdownChartPayload(
            title="Average Retention Curve",
            x_title="Months Since Acquisition",
            y_title="Retention Rate",
            metric_format="percent",
            current_trace_style="line",
            previous_trace_style="line",
            points=[
                BreakdownPoint(
                    label=f"M{age}",
                    raw_label=f"M{age}",
                    current_value=float(current_snapshot["curve"].get(age, 0.0)),
                    previous_value=float(previous_snapshot["curve"].get(age, 0.0)),
                    delta_pct=safe_pct(current_snapshot["curve"].get(age, 0.0), previous_snapshot["curve"].get(age, 0.0)),
                )
                for age in range(0, 7)
            ],
        )

        detail_table = _table_payload(
            title="Recent Cohort Detail",
            columns=[("cohort", "Cohort"), ("size", "Size"), ("m1", "M1"), ("m2", "M2"), ("m3", "M3")],
            rows=current_snapshot["detail_rows"],
        )

        cohort_range_text = "selected cohort window"
        if current_snapshot["cohort_start"] is not None and current_snapshot["cohort_end"] is not None:
            cohort_range_text = (
                f"{pd.Timestamp(current_snapshot['cohort_start']).strftime('%b %Y')} to "
                f"{pd.Timestamp(current_snapshot['cohort_end']).strftime('%b %Y')}"
            )

        summary = [
            f"Month 1 retention is {cards[1].formatted_value} across cohorts acquired from {cohort_range_text}; read this before judging acquisition volume.",
            f"Latest full cohort size is {cards[0].formatted_value}, which separates cohort volume from post-acquisition quality.",
            "The heatmap is fixed to monthly cohorts. Blank cells indicate cohorts that are not mature enough yet for that retention month.",
        ]

        return self._base_payload(
            page="retention",
            title="Retention Cohorts",
            subtitle="Monthly acquisition cohorts show how customer return behavior evolves after the first purchase inside the selected slice.",
            granularity="Month",
            start_date=start_date,
            end_date=end_date,
            cards=cards,
            trend=[],
            trend_title="Retention Cohort Heatmap",
            trend_y_title="Retention Rate",
            comparison_rule="Cohort analysis is fixed to monthly acquisition cohorts. Cards compare the current cohort window against the previous equivalent cohort window; blank heatmap cells mean the cohort is not mature enough yet.",
            summary=summary,
            trend_metric_format="percent",
            current_trace_style="line",
            previous_trace_style="line",
            primary_heatmap=current_snapshot["heatmap"],
            secondary_chart=secondary_chart,
            detail_table=detail_table,
        )

    def _build_products(
        self,
        scoped_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
    ) -> DashboardPayload:
        current_df, previous_df, _, _ = range_with_previous(scoped_df, start_date, end_date)

        cards = [
            make_card("products_sold", "Products Sold (Distinct)", _products_count(current_df), _products_count(previous_df), fmt_number),
            make_card("avg_unit_price", "Average Unit Price", _avg_unit_price(current_df), _avg_unit_price(previous_df), fmt_currency),
            make_card("top_5_products_share", "Top 5 Products Share", _top_n_products_share(current_df), _top_n_products_share(previous_df), fmt_pct),
            make_card("top_category_share", "Top Category Share", _top_category_share(current_df), _top_category_share(previous_df), fmt_pct),
        ]
        trend = build_aligned_trend(
            scoped_df=scoped_df,
            current_df=current_df,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            aggregator=_top_category_share,
        )

        product_points = build_pareto_points(
            current_df=current_df,
            previous_df=previous_df,
            group_col="product_name",
            limit=max(int(current_df["product_name"].dropna().nunique()), 1) if "product_name" in current_df.columns else 1,
        )
        total_revenue = float(sum(point.current_value for point in product_points))
        total_previous_revenue = _sum_sales(previous_df)
        class_order = ["A", "B", "C"]
        class_points = []
        detail_rows = []
        for class_name in class_order:
            class_members = [point for point in product_points if point.segment_class == class_name]
            if not class_members:
                continue
            current_value = float(sum(point.current_value for point in class_members))
            previous_value = float(sum(point.previous_value for point in class_members))
            share_pct = (current_value / total_revenue * 100.0) if total_revenue else 0.0
            previous_share_pct = (previous_value / total_previous_revenue * 100.0) if total_previous_revenue else 0.0
            share_shift_pct = share_pct - previous_share_pct
            class_points.append(
                BreakdownPoint(
                    label=class_name,
                    raw_label=class_name,
                    current_value=current_value,
                    previous_value=previous_value,
                    delta_pct=safe_pct(current_value, previous_value),
                    share_pct=share_pct,
                    previous_share_pct=previous_share_pct,
                    share_shift_pct=share_shift_pct,
                    segment_class=class_name,
                )
            )
            class_frame = current_df[current_df["product_name"].isin([point.raw_label for point in class_members])]
            detail_rows.append(
                {
                    "class": class_name,
                    "revenue": fmt_currency(current_value),
                    "share": fmt_pct(share_pct),
                    "previous_share": fmt_pct(previous_share_pct),
                    "mix_shift": f"{share_shift_pct:+.2f} pp",
                    "products": fmt_number(float(len(class_members))),
                    "avg_unit_price": fmt_currency(_avg_unit_price(class_frame)),
                    "_interaction_type": "detail",
                    "_interaction_key": "abc_class",
                    "_interaction_value": class_name,
                }
            )

        secondary_chart = (
            BreakdownChartPayload(
                title="ABC Revenue Split",
                x_title="ABC Class",
                y_title="Revenue Share",
                metric_format="percent",
                analysis_mode="donut",
                current_series_name="Revenue Share",
                previous_series_name="Previous Revenue",
                interaction_type="detail",
                interaction_key="abc_class",
                interaction_label="Select an ABC class to inspect the products inside it",
                points=class_points,
            )
            if class_points
            else None
        )

        detail_table = _table_payload(
            title="ABC Class Summary",
            columns=[("class", "ABC"), ("revenue", "Revenue"), ("share", "Revenue Share"), ("previous_share", "Previous Share"), ("mix_shift", "Mix Shift (pp)"), ("products", "Products"), ("avg_unit_price", "Avg Unit Price")],
            rows=detail_rows,
        )
        class_a_points = [point for point in product_points if point.segment_class == "A"]
        class_a_coverage = class_a_points[-1].cumulative_pct if class_a_points else 0.0
        mix_gainer = max(class_points, key=lambda item: item.share_shift_pct or 0.0) if class_points else None
        mix_loser = min(class_points, key=lambda item: item.share_shift_pct or 0.0) if class_points else None
        summary = [
            f"Top Category Share is {cards[3].formatted_value}; if it rises while product breadth stays stable, concentration risk is increasing.",
            f"Top 5 Products Share is {cards[2].formatted_value}, while A-class products already cover {class_a_coverage:.2f}% of revenue.",
            (
                f"Mix shifted toward class {mix_gainer.label} by {(mix_gainer.share_shift_pct or 0.0):+.2f} pp and away from class {mix_loser.label} by {(mix_loser.share_shift_pct or 0.0):+.2f} pp. Click a class to inspect the products actually driving the change."
                if mix_gainer and mix_loser
                else "Use the ABC split first, then click a class to inspect the actual products inside it and decide where to focus."
            ),
        ]
        return self._base_payload(
            page="products",
            title="Product Performance",
            subtitle="Assortment breadth, Pareto concentration and product mix risk across the selected slice.",
            granularity=granularity,
            start_date=start_date,
            end_date=end_date,
            cards=cards,
            trend=trend,
            trend_title=f"Top Category Share by {granularity}",
            trend_y_title="Top Category Share",
            comparison_rule="Product KPIs compare the selected window against the previous window of the same length. Trend points compare each visible period against the previous equivalent period; partial edge periods are aligned by day position.",
            summary=summary,
            trend_metric_format="percent",
            current_trace_style="line",
            previous_trace_style="line",
            secondary_chart=secondary_chart,
            detail_table=detail_table,
        )

    def _build_operations(
        self,
        scoped_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
    ) -> DashboardPayload:
        current_df, previous_df, _, _ = range_with_previous(scoped_df, start_date, end_date)

        cards = [
            make_card("orders_count", "Orders Count", _orders_count(current_df), _orders_count(previous_df), fmt_number),
            make_card("records_count", "Records in Window", _records_count(current_df), _records_count(previous_df), fmt_number),
            make_card("avg_lines_per_order", "Avg Lines / Order", _avg_lines_per_order(current_df), _avg_lines_per_order(previous_df), fmt_decimal),
            make_card("success_rate", "Non-Cancelled Rate", _non_cancelled_rate(current_df), _non_cancelled_rate(previous_df), fmt_pct),
        ]
        trend = build_aligned_trend(
            scoped_df=scoped_df,
            current_df=current_df,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            aggregator=_orders_count,
        )
        secondary_chart = _build_breakdown_chart(
            title="Non-Cancelled Rate by City",
            x_title="City",
            y_title="Non-Cancelled Rate",
            current_df=current_df,
            previous_df=previous_df,
            group_col="city",
            metric_fn=_non_cancelled_rate,
            metric_format="percent",
            limit=6,
            current_trace_style="bar",
            previous_trace_style="bar",
            filter_key="city",
        )
        city_map = _group_metric_map(current_df, "city", _orders_count)
        city_rank = sorted(city_map, key=lambda key: city_map.get(key, 0.0), reverse=True)[:8]
        detail_rows = []
        for city in city_rank:
            city_df = current_df[current_df["city"] == city]
            detail_rows.append({
                "city": city,
                "orders": fmt_number(_orders_count(city_df)),
                "records": fmt_number(_records_count(city_df)),
                "lines": fmt_decimal(_avg_lines_per_order(city_df)),
                "success": fmt_pct(_non_cancelled_rate(city_df)),
            })

        detail_table = _table_payload(
            title="Operational Detail by City",
            columns=[("city", "City"), ("orders", "Orders"), ("records", "Records"), ("lines", "Avg Lines / Order"), ("success", "Non-Cancelled Rate")],
            rows=detail_rows,
        )
        summary = [
            f"Orders Count is {cards[0].formatted_value} and row intensity is {cards[2].formatted_value} lines per order, which helps separate throughput from processing complexity.",
            f"Non-Cancelled Rate is {cards[3].formatted_value}; if throughput is stable but this rate falls, operational quality is deteriorating.",
            "Use the city quality breakdown to isolate where operational pressure is translating into worse fulfillment outcomes.",
        ]
        return self._base_payload(
            page="operations",
            title="Order Flow Operations",
            subtitle="Order throughput, row intensity and fulfillment quality across the selected slice.",
            granularity=granularity,
            start_date=start_date,
            end_date=end_date,
            cards=cards,
            trend=trend,
            trend_title=f"Orders Count by {granularity}",
            trend_y_title="Orders Count",
            comparison_rule="Operational KPIs compare the selected window against the previous window of the same length. Trend points compare each visible period against the previous equivalent period; partial edge periods are aligned by day position.",
            summary=summary,
            trend_metric_format="number",
            current_trace_style="bar",
            previous_trace_style="line",
            secondary_chart=secondary_chart,
            detail_table=detail_table,
        )




