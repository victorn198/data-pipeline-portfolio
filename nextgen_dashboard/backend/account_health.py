from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pandas as pd

from .analytics_helpers import fmt_currency, fmt_number
from .data_source import DashboardDataSource, DashboardSettings
from .models import (
    AccountHealthCard,
    AccountHealthPayload,
    DetailTablePayload,
    TableColumn,
    TableRow,
)


class AccountHealthService:
    def __init__(self, settings: DashboardSettings | None = None) -> None:
        self.settings = settings or DashboardSettings.from_env()
        self.data_source = DashboardDataSource(self.settings)

    def build_payload(self) -> AccountHealthPayload:
        generated_at = datetime.now(timezone.utc).isoformat()
        try:
            frame = self._load_account_health()
        except Exception as exc:
            return self._unavailable_payload(generated_at, str(exc))

        if frame.empty:
            return self._unavailable_payload(
                generated_at,
                "Account health mart returned no rows. Run dbt after loading CRM, billing, and support sources.",
            )

        tier_counts = frame["health_tier"].value_counts().to_dict()
        total_accounts = int(len(frame))
        at_risk = int(tier_counts.get("risk", 0))
        watch = int(tier_counts.get("watch", 0))
        outstanding = float(frame["outstanding_amount"].sum())
        open_tickets = int(frame["open_ticket_count"].sum())
        avg_score = float(frame["health_score"].mean())

        cards = [
            AccountHealthCard(
                key="accounts_monitored",
                title="Accounts Monitored",
                value=fmt_number(total_accounts),
                subtitle="CRM accounts with operational signals",
                status="ok" if total_accounts else "warning",
            ),
            AccountHealthCard(
                key="average_health_score",
                title="Average Health Score",
                value=f"{avg_score:.0f}",
                subtitle="100 is best; billing and support issues reduce score",
                status="ok" if avg_score >= 85 else "warning" if avg_score >= 70 else "error",
            ),
            AccountHealthCard(
                key="accounts_at_risk",
                title="Accounts At Risk",
                value=fmt_number(at_risk),
                subtitle=f"{watch:,} accounts are in watch tier",
                status="ok" if at_risk == 0 else "error",
            ),
            AccountHealthCard(
                key="outstanding_amount",
                title="Outstanding Amount",
                value=fmt_currency(outstanding),
                subtitle=f"{open_tickets:,} open support tickets across accounts",
                status="ok" if outstanding == 0 else "warning",
            ),
        ]

        risk_driver = self._top_risk_driver(frame)
        top_risk_account = frame.sort_values(
            ["health_score", "outstanding_amount"],
            ascending=[True, False],
        ).iloc[0]

        return AccountHealthPayload(
            status="ok",
            subtitle="CRM, billing, support, and ecommerce signals consolidated into an account-level operational view.",
            generated_at=generated_at,
            cards=cards,
            tier_table=self._tier_table(frame),
            account_table=self._account_table(frame),
            summary=[
                f"{at_risk} of {total_accounts} monitored accounts are in the risk tier; {watch} more require watchlist follow-up.",
                f"Outstanding balance is {fmt_currency(outstanding)} and the most common follow-up driver is {risk_driver}.",
                f"Lowest-score account is {top_risk_account['account_name']} with score {int(top_risk_account['health_score'])}, driven by {top_risk_account['primary_risk_driver']}.",
            ],
        )

    def _load_account_health(self) -> pd.DataFrame:
        frame = self.data_source._read_relation("marts", "mart_account_health")
        frame.columns = [col.lower() for col in frame.columns]
        numeric_cols = [
            "annual_revenue",
            "employee_count",
            "invoice_count",
            "open_invoice_count",
            "past_due_invoice_count",
            "billed_amount",
            "paid_amount",
            "outstanding_amount",
            "ecommerce_order_count",
            "ecommerce_sales_amount",
            "ticket_count",
            "open_ticket_count",
            "high_priority_ticket_count",
            "avg_satisfaction_score",
            "health_score",
        ]
        for col in numeric_cols:
            if col in frame.columns:
                frame[col] = pd.to_numeric(frame[col], errors="coerce").fillna(0)
        return frame

    def _tier_table(self, frame: pd.DataFrame) -> DetailTablePayload:
        rows = []
        tier_order = ["risk", "watch", "healthy"]
        for tier in tier_order:
            tier_frame = frame[frame["health_tier"] == tier]
            if tier_frame.empty:
                continue
            rows.append(
                TableRow(
                    values={
                        "tier": tier,
                        "accounts": fmt_number(len(tier_frame)),
                        "avg_score": f"{float(tier_frame['health_score'].mean()):.0f}",
                        "outstanding": fmt_currency(float(tier_frame["outstanding_amount"].sum())),
                        "open_tickets": fmt_number(float(tier_frame["open_ticket_count"].sum())),
                        "billed": fmt_currency(float(tier_frame["billed_amount"].sum())),
                    }
                )
            )
        return DetailTablePayload(
            title="Health Tier Summary",
            columns=[
                TableColumn(key="tier", label="Tier"),
                TableColumn(key="accounts", label="Accounts"),
                TableColumn(key="avg_score", label="Avg Score"),
                TableColumn(key="outstanding", label="Outstanding"),
                TableColumn(key="open_tickets", label="Open Tickets"),
                TableColumn(key="billed", label="Billed"),
            ],
            rows=rows,
        )

    def _account_table(self, frame: pd.DataFrame) -> DetailTablePayload:
        sorted_frame = frame.sort_values(
            ["health_score", "outstanding_amount", "open_ticket_count"],
            ascending=[True, False, False],
        )
        rows = []
        for _, row in sorted_frame.head(12).iterrows():
            rows.append(
                TableRow(
                    values={
                        "account": str(row.get("account_name") or row.get("account_id")),
                        "owner": str(row.get("owner") or ""),
                        "stage": str(row.get("lifecycle_stage") or ""),
                        "tier": str(row.get("health_tier") or ""),
                        "score": f"{float(row.get('health_score') or 0):.0f}",
                        "driver": str(row.get("primary_risk_driver") or ""),
                        "outstanding": fmt_currency(float(row.get("outstanding_amount") or 0)),
                        "open_tickets": fmt_number(float(row.get("open_ticket_count") or 0)),
                        "billed": fmt_currency(float(row.get("billed_amount") or 0)),
                    }
                )
            )
        return DetailTablePayload(
            title="Account Watchlist",
            columns=[
                TableColumn(key="account", label="Account"),
                TableColumn(key="owner", label="Owner"),
                TableColumn(key="stage", label="Stage"),
                TableColumn(key="tier", label="Tier"),
                TableColumn(key="score", label="Score"),
                TableColumn(key="driver", label="Driver"),
                TableColumn(key="outstanding", label="Outstanding"),
                TableColumn(key="open_tickets", label="Open Tickets"),
                TableColumn(key="billed", label="Billed"),
            ],
            rows=rows,
        )

    def _top_risk_driver(self, frame: pd.DataFrame) -> str:
        drivers = frame["primary_risk_driver"].dropna().astype(str)
        if drivers.empty:
            return "stable"
        return str(drivers.value_counts().idxmax())

    def _unavailable_payload(self, generated_at: str, message: str) -> AccountHealthPayload:
        return AccountHealthPayload(
            status="unavailable",
            subtitle=message,
            generated_at=generated_at,
            cards=[
                AccountHealthCard(
                    key="unavailable",
                    title="Account Health",
                    value="Unavailable",
                    subtitle=message,
                    status="warning",
                )
            ],
            tier_table=DetailTablePayload(title="Health Tier Summary"),
            account_table=DetailTablePayload(title="Account Watchlist"),
            summary=[message],
        )
