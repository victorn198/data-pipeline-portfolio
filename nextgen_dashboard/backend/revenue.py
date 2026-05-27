from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from .analytics_helpers import (
    build_aligned_trend,
    fmt_currency,
    fmt_pct,
    make_card,
    range_with_previous,
)
from .models import Granularity, RevenuePayload


@dataclass(slots=True)
class RevenueService:
    def build_payload(
        self,
        scoped_df: pd.DataFrame,
        current_df: pd.DataFrame,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
        granularity: Granularity,
    ) -> RevenuePayload:
        current_df, previous_df, previous_start, previous_end = range_with_previous(
            scoped_df, start_date, end_date
        )
        trend = build_aligned_trend(
            scoped_df=scoped_df,
            current_df=current_df,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            aggregator=lambda frame: float(frame["sales_amount"].sum()) if not frame.empty else 0.0,
            optimized_sum_col="sales_amount",
        )
        cards = self._build_cards(
            current_df=current_df,
            previous_df=previous_df,
            trend=trend,
            start_date=start_date,
            end_date=end_date,
        )
        summary = self._build_summary(
            cards=cards,
            trend=trend,
            granularity=granularity,
        )

        return RevenuePayload(
            granularity=granularity,
            start_date=start_date.date().isoformat(),
            end_date=end_date.date().isoformat(),
            comparison_rule=(
                "Cards compare the selected date window versus the immediately previous window of the same length. "
                "Trend points compare each visible period against the previous equivalent period; partial edge periods are aligned by day position."
            ),
            cards=cards,
            trend=trend,
            summary=summary,
        )

    def _build_cards(
        self,
        current_df: pd.DataFrame,
        previous_df: pd.DataFrame,
        trend: list,
        start_date: pd.Timestamp,
        end_date: pd.Timestamp,
    ) -> list:
        current_revenue = float(current_df["sales_amount"].sum()) if not current_df.empty else 0.0
        previous_revenue = float(previous_df["sales_amount"].sum()) if not previous_df.empty else 0.0
        current_gross = float(current_df["gross_sales_amount"].sum()) if not current_df.empty and "gross_sales_amount" in current_df.columns else current_revenue
        previous_gross = float(previous_df["gross_sales_amount"].sum()) if not previous_df.empty and "gross_sales_amount" in previous_df.columns else previous_revenue
        current_cancelled = float(current_df["cancelled_sales_amount"].sum()) if not current_df.empty and "cancelled_sales_amount" in current_df.columns else max(current_gross - current_revenue, 0.0)
        previous_cancelled = float(previous_df["cancelled_sales_amount"].sum()) if not previous_df.empty and "cancelled_sales_amount" in previous_df.columns else max(previous_gross - previous_revenue, 0.0)
        current_cancel_rate = current_cancelled / current_gross * 100.0 if current_gross else 0.0
        previous_cancel_rate = previous_cancelled / previous_gross * 100.0 if previous_gross else 0.0

        days = int((end_date - start_date).days) + 1
        current_run_rate = current_revenue / days if days > 0 else 0.0
        previous_run_rate = previous_revenue / days if days > 0 else 0.0

        current_orders = float(current_df["order_id"].nunique()) if not current_df.empty else 0.0
        previous_orders = float(previous_df["order_id"].nunique()) if not previous_df.empty else 0.0
        current_ticket = current_revenue / current_orders if current_orders else 0.0
        previous_ticket = previous_revenue / previous_orders if previous_orders else 0.0

        latest_current = float(trend[-1].current_value) if trend else 0.0
        latest_previous = float(trend[-1].previous_value) if trend else 0.0

        return [
            make_card(
                "revenue_in_window",
                "Revenue in Window",
                current_revenue,
                previous_revenue,
                fmt_currency,
            ),
            make_card(
                "gross_sales_amount",
                "Gross Sales",
                current_gross,
                previous_gross,
                fmt_currency,
            ),
            make_card(
                "cancellation_rate",
                "Cancellation Rate",
                current_cancel_rate,
                previous_cancel_rate,
                fmt_pct,
            ),
            make_card(
                "latest_period_sales",
                "Latest Period Sales",
                latest_current,
                latest_previous,
                fmt_currency,
            ),
        ]

    def _build_summary(
        self,
        cards: list,
        trend: list,
        granularity: Granularity,
    ) -> list[str]:
        if not cards:
            return ["No data available for selected filters."]

        revenue_card = next(card for card in cards if card.key == "revenue_in_window")
        gross_card = next(card for card in cards if card.key == "gross_sales_amount")
        cancel_card = next(card for card in cards if card.key == "cancellation_rate")
        latest_card = next(card for card in cards if card.key == "latest_period_sales")
        summary = [
            f"Net revenue in the selected window is {revenue_card.formatted_value}, versus {revenue_card.formatted_previous_value} in the previous equivalent window ({revenue_card.delta_label}).",
            f"Gross sales are {gross_card.formatted_value}; cancellation rate is {cancel_card.formatted_value}, which separates demand from cancelled order value.",
        ]
        if trend:
            summary.append(
                f"Latest visible {granularity.lower()} contributes {latest_card.formatted_value} and moved {latest_card.delta_label} versus the previous equivalent period."
            )
        return summary
