from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()


class DataSourceError(RuntimeError):
    pass


_IDENTIFIER_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def _safe_identifier(name: str) -> str:
    if not _IDENTIFIER_RE.match(name):
        raise DataSourceError(f"Invalid identifier: {name}")
    return name


@dataclass(frozen=True)
class DashboardSettings:
    data_source_mode: str
    database_url: str | None
    local_data_dir: Path
    sales_schema: str
    sales_table: str
    customer_schema: str
    customer_table: str
    product_schema: str
    product_table: str

    @staticmethod
    def from_env() -> "DashboardSettings":
        return DashboardSettings(
            data_source_mode=os.getenv("DASHBOARD_SOURCE_MODE", "database")
            .strip()
            .lower(),
            database_url=os.getenv("DATABASE_URL") or _build_default_postgres_url(),
            local_data_dir=Path(os.getenv("LOCAL_DATA_DIR", "data/local")).resolve(),
            sales_schema=os.getenv("DASHBOARD_SALES_SCHEMA", "marts"),
            sales_table=os.getenv("DASHBOARD_SALES_TABLE", "fct_sales"),
            customer_schema=os.getenv("DASHBOARD_CUSTOMER_SCHEMA", "marts"),
            customer_table=os.getenv("DASHBOARD_CUSTOMER_TABLE", "dim_customer"),
            product_schema=os.getenv("DASHBOARD_PRODUCT_SCHEMA", "marts"),
            product_table=os.getenv("DASHBOARD_PRODUCT_TABLE", "dim_product"),
        )


def _build_default_postgres_url() -> str:
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "analytics")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"


class DashboardDataSource:
    def __init__(self, settings: DashboardSettings):
        self.settings = settings
        self._engine = None

    def _get_engine(self):
        if self._engine is not None:
            return self._engine

        if not self.settings.database_url:
            raise DataSourceError(
                "DATABASE_URL is required when DASHBOARD_SOURCE_MODE=database"
            )

        self._engine = create_engine(self.settings.database_url)
        return self._engine

    def _read_relation(self, schema: str, relation: str) -> pd.DataFrame:
        schema = _safe_identifier(schema)
        relation = _safe_identifier(relation)

        if self.settings.data_source_mode == "database":
            engine = self._get_engine()
            query = f'SELECT * FROM "{schema}"."{relation}"'
            return pd.read_sql_query(query, con=engine)

        if self.settings.data_source_mode == "local":
            base = self.settings.local_data_dir
            csv_path = base / f"{schema}.{relation}.csv"
            parquet_path = base / f"{schema}.{relation}.parquet"

            if csv_path.exists():
                return pd.read_csv(csv_path)
            if parquet_path.exists():
                return pd.read_parquet(parquet_path)

            raise DataSourceError(
                f"Local source file not found for {schema}.{relation}. Expected {csv_path.name} or {parquet_path.name}."
            )

        raise DataSourceError(
            f"Invalid DASHBOARD_SOURCE_MODE='{self.settings.data_source_mode}'. Use 'database' or 'local'."
        )

    def read_relation(self, schema: str, relation: str) -> pd.DataFrame:
        return self._read_relation(schema, relation)

    def load_base_tables(self) -> dict[str, pd.DataFrame]:
        return {
            "sales": self._read_relation(
                self.settings.sales_schema, self.settings.sales_table
            ),
            "customers": self._read_relation(
                self.settings.customer_schema, self.settings.customer_table
            ),
            "products": self._read_relation(
                self.settings.product_schema, self.settings.product_table
            ),
        }

    def load_sales_model(self) -> pd.DataFrame:
        tables = self.load_base_tables()
        sales = tables["sales"]
        customers = tables["customers"]
        products = tables["products"]

        sales.columns = [c.lower() for c in sales.columns]
        customers.columns = [c.lower() for c in customers.columns]
        products.columns = [c.lower() for c in products.columns]

        if "order_date" in sales.columns:
            sales["order_date"] = pd.to_datetime(
                sales["order_date"], errors="coerce", utc=True
            ).dt.tz_convert(None)

        joined = sales.merge(
            customers[["customer_key", "customer_name", "city", "state"]],
            how="left",
            on="customer_key",
        ).merge(
            products[["product_key", "product_name", "category"]],
            how="left",
            on="product_key",
        )

        return joined

    def health_check(self) -> str:
        if self.settings.data_source_mode == "local":
            return f"Local source mode active: {self.settings.local_data_dir}"

        engine = self._get_engine()
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        return "Database connection successful."
