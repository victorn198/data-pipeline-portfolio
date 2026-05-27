from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path

import pandas as pd

from .data_source import (
    DashboardDataSource,
    DashboardSettings,
    DataSourceError,
)


@dataclass(slots=True)
class RepositoryHealth:
    status: str
    message: str


class SalesRepository:
    def __init__(self) -> None:
        self.settings = DashboardSettings.from_env()
        self.data_source = DashboardDataSource(self.settings)
        self._sales_cache: pd.DataFrame | None = None
        self._filter_metadata_cache: dict[str, object] | None = None
        self._first_purchase_cache: pd.Series | None = None

    def health(self) -> RepositoryHealth:
        try:
            return RepositoryHealth(
                status="ok", message=self.data_source.health_check()
            )
        except Exception as exc:  # pragma: no cover - defensive runtime guard
            return RepositoryHealth(status="error", message=str(exc))

    def load_sales_model(self, force_refresh: bool = False) -> pd.DataFrame:
        if self._sales_cache is not None and not force_refresh:
            return self._sales_cache

        sales_df = self.data_source.load_sales_model()
        sales_df.columns = [col.lower() for col in sales_df.columns]
        sales_df["order_date"] = pd.to_datetime(sales_df["order_date"], errors="coerce")
        sales_df = sales_df.dropna(subset=["order_date"]).copy()
        sales_df["order_date"] = sales_df["order_date"].dt.tz_localize(None)
        sales_df["order_day"] = sales_df["order_date"].dt.normalize()

        for numeric_col in ("sales_amount", "quantity", "unit_price"):
            if numeric_col in sales_df.columns:
                sales_df[numeric_col] = pd.to_numeric(
                    sales_df[numeric_col], errors="coerce"
                ).fillna(0.0)

        if "gross_sales_amount" not in sales_df.columns:
            sales_df["gross_sales_amount"] = sales_df["sales_amount"]
        else:
            sales_df["gross_sales_amount"] = pd.to_numeric(
                sales_df["gross_sales_amount"], errors="coerce"
            ).fillna(0.0)

        if "cancelled_sales_amount" not in sales_df.columns:
            if "status" in sales_df.columns:
                cancelled_mask = sales_df["status"].astype(str).str.lower() == "cancelled"
                sales_df["cancelled_sales_amount"] = sales_df["gross_sales_amount"].where(
                    cancelled_mask,
                    0.0,
                )
                sales_df["sales_amount"] = sales_df["gross_sales_amount"].where(
                    ~cancelled_mask,
                    0.0,
                )
            else:
                sales_df["cancelled_sales_amount"] = 0.0
        else:
            sales_df["cancelled_sales_amount"] = pd.to_numeric(
                sales_df["cancelled_sales_amount"], errors="coerce"
            ).fillna(0.0)

        if "is_cancelled" not in sales_df.columns:
            sales_df["is_cancelled"] = (
                sales_df["status"].astype(str).str.lower() == "cancelled"
                if "status" in sales_df.columns
                else False
            )

        self._sales_cache = sales_df
        self._filter_metadata_cache = None
        self._first_purchase_cache = None
        return self._sales_cache

    def load_marketing_model(self, force_refresh: bool = False) -> pd.DataFrame:
        try:
            marketing_df = self.data_source.read_relation(
                "marts",
                "mart_marketing_efficiency",
            )
            marketing_df.columns = [col.lower() for col in marketing_df.columns]
            return _normalize_marketing_frame(marketing_df)
        except Exception:
            return self._build_marketing_model_from_registered_file()

    def _build_marketing_model_from_registered_file(self) -> pd.DataFrame:
        source_path = (
            Path(__file__).resolve().parents[2]
            / "data"
            / "sources"
            / "marketing_campaigns.csv"
        )
        if not source_path.exists():
            return _normalize_marketing_frame(pd.DataFrame())

        campaigns = pd.read_csv(source_path)
        campaigns.columns = [col.lower() for col in campaigns.columns]
        campaigns = _normalize_marketing_frame(campaigns)
        if campaigns.empty:
            return campaigns

        sales = self.load_sales_model()
        if sales.empty:
            campaigns["attributed_orders_count"] = 0.0
            campaigns["attributed_customers_count"] = 0.0
            campaigns["attributed_revenue"] = 0.0
            campaigns["roas"] = 0.0
            campaigns["budget_utilization_pct"] = 0.0
            campaigns["acquisition_cost_proxy"] = 0.0
            return campaigns

        rows = []
        for _, campaign in campaigns.iterrows():
            target_city = str(campaign.get("target_city") or "").lower()
            start_date = pd.Timestamp(campaign.get("start_date")).normalize()
            end_date = pd.Timestamp(campaign.get("end_date")).normalize()
            matched = sales[
                (sales["city"].astype(str).str.lower() == target_city)
                & (sales["order_day"] >= start_date)
                & (sales["order_day"] <= end_date)
            ]
            attributed_revenue = float(matched["sales_amount"].sum()) if not matched.empty else 0.0
            attributed_customers = float(matched["customer_id"].nunique()) if not matched.empty else 0.0
            spend = float(campaign.get("spend") or 0.0)
            budget = float(campaign.get("budget") or 0.0)
            row = dict(campaign)
            row.update(
                {
                    "attributed_orders_count": float(matched["order_id"].nunique()) if not matched.empty else 0.0,
                    "attributed_customers_count": attributed_customers,
                    "attributed_revenue": attributed_revenue,
                    "roas": attributed_revenue / spend if spend else 0.0,
                    "budget_utilization_pct": spend / budget * 100.0 if budget else 0.0,
                    "acquisition_cost_proxy": spend / attributed_customers if attributed_customers else 0.0,
                }
            )
            rows.append(row)
        return _normalize_marketing_frame(pd.DataFrame(rows))

    def filter_frame_by_date(
        self,
        frame: pd.DataFrame,
        start_date: pd.Timestamp | None,
        end_date: pd.Timestamp | None,
    ) -> pd.DataFrame:
        scoped = frame
        if start_date is not None:
            scoped = scoped[
                scoped["order_day"] >= pd.Timestamp(start_date).normalize()
            ]
        if end_date is not None:
            scoped = scoped[
                scoped["order_day"] <= pd.Timestamp(end_date).normalize()
            ]
        return scoped

    def filter_sales(
        self,
        start_date: pd.Timestamp | None,
        end_date: pd.Timestamp | None,
        categories: list[str] | None,
        cities: list[str] | None,
    ) -> pd.DataFrame:
        scoped = self.load_sales_model()

        if categories:
            scoped = scoped[scoped["category"].isin(categories)]
        if cities:
            scoped = scoped[scoped["city"].isin(cities)]

        return self.filter_frame_by_date(scoped, start_date, end_date)

    def customer_first_purchase(self) -> pd.Series:
        if self._first_purchase_cache is not None:
            return self._first_purchase_cache

        sales_df = self.load_sales_model()
        self._first_purchase_cache = sales_df.groupby("customer_id")["order_day"].min()
        return self._first_purchase_cache

    def filter_metadata(self) -> dict[str, object]:
        if self._filter_metadata_cache is not None:
            return dict(self._filter_metadata_cache)

        sales_df = self.load_sales_model()
        min_ts = sales_df["order_day"].min()
        max_ts = sales_df["order_day"].max()
        max_date = max_ts.date()

        default_start = (max_ts - pd.Timedelta(days=365)).date()
        if default_start < min_ts.date():
            default_start = min_ts.date()

        categories = (
            sorted(sales_df["category"].dropna().astype(str).unique().tolist())
            if "category" in sales_df.columns
            else []
        )
        cities = (
            sorted(sales_df["city"].dropna().astype(str).unique().tolist())
            if "city" in sales_df.columns
            else []
        )

        self._filter_metadata_cache = {
            "min_date": min_ts.date().isoformat(),
            "max_date": max_date.isoformat(),
            "default_start_date": default_start.isoformat(),
            "default_end_date": max_date.isoformat(),
            "categories": categories,
            "cities": cities,
        }
        return dict(self._filter_metadata_cache)

    def validate_date_range(
        self, start: date | None, end: date | None
    ) -> tuple[pd.Timestamp, pd.Timestamp]:
        meta = self.filter_metadata()
        min_date = pd.Timestamp(meta["min_date"])
        max_date = pd.Timestamp(meta["max_date"])
        start_ts = pd.Timestamp(start) if start is not None else min_date
        end_ts = pd.Timestamp(end) if end is not None else max_date

        if start_ts < min_date:
            start_ts = min_date
        if end_ts > max_date:
            end_ts = max_date
        if start_ts > end_ts:
            raise DataSourceError("start_date must be less than or equal to end_date.")

        return start_ts.normalize(), end_ts.normalize()


def _normalize_marketing_frame(frame: pd.DataFrame) -> pd.DataFrame:
    expected_columns = [
        "campaign_id",
        "campaign_name",
        "channel",
        "start_date",
        "end_date",
        "target_city",
        "status",
        "budget",
        "spend",
        "attributed_orders_count",
        "attributed_customers_count",
        "attributed_revenue",
        "roas",
        "budget_utilization_pct",
        "acquisition_cost_proxy",
    ]
    if frame.empty:
        return pd.DataFrame(columns=expected_columns)

    frame = frame.copy()
    for column in ("start_date", "end_date"):
        if column in frame.columns:
            frame[column] = pd.to_datetime(frame[column], errors="coerce").dt.normalize()
        else:
            frame[column] = pd.NaT
    for column in (
        "budget",
        "spend",
        "attributed_orders_count",
        "attributed_customers_count",
        "attributed_revenue",
        "roas",
        "budget_utilization_pct",
        "acquisition_cost_proxy",
    ):
        if column not in frame.columns:
            frame[column] = 0.0
        frame[column] = pd.to_numeric(frame[column], errors="coerce").fillna(0.0)
    for column in ("campaign_id", "campaign_name", "channel", "target_city", "status"):
        if column not in frame.columns:
            frame[column] = ""
        frame[column] = frame[column].fillna("").astype(str)
    return frame
