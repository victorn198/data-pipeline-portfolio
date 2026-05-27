from __future__ import annotations

import hashlib
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CANONICAL_DATASET_PATH = PROJECT_ROOT / "data" / "canonical" / "online_retail_uci_sample.csv"

CITY_BY_COUNTRY = {
    "Australia": ["Sydney", "Melbourne", "Brisbane"],
    "Belgium": ["Brussels", "Antwerp", "Ghent"],
    "EIRE": ["Dublin", "Cork", "Galway"],
    "France": ["Paris", "Lyon", "Marseille"],
    "Germany": ["Berlin", "Munich", "Hamburg"],
    "Netherlands": ["Amsterdam", "Rotterdam", "Utrecht"],
    "Portugal": ["Lisbon", "Porto", "Braga"],
    "Spain": ["Madrid", "Barcelona", "Valencia"],
    "Switzerland": ["Zurich", "Geneva", "Basel"],
    "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"],
}

CATEGORY_RULES = (
    ("seasonal", ("CHRISTMAS", "EASTER", "HALLOWEEN", "VALENTINE")),
    ("home decor", ("HEART", "CANDLE", "LANTERN", "LIGHT", "WALL", "FRAME", "MIRROR", "HOLDER")),
    ("kitchen", ("MUG", "CUP", "PLATE", "BOWL", "TEA", "COFFEE", "CAKE", "NAPKIN", "CUTLERY")),
    ("gifts", ("GIFT", "TOY", "DOLL", "GAME", "BAG", "BOX", "CHARM", "KEY RING")),
    ("stationery", ("CARD", "PENCIL", "PEN", "NOTEBOOK", "PAPER", "STICKER", "TAPE")),
    ("apparel", ("SCARF", "HAT", "APRON", "BIB", "CLOTH", "SOCK")),
)


def stable_int(value: str) -> int:
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()
    return int(digest[:12], 16)


def normalize_id(prefix: str, value: str) -> str:
    cleaned = "".join(ch if ch.isalnum() else "_" for ch in str(value).strip().upper())
    cleaned = "_".join(part for part in cleaned.split("_") if part)
    return f"{prefix}_{cleaned}"


def load_online_retail_sample() -> pd.DataFrame:
    if not CANONICAL_DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Canonical retail dataset not found: {CANONICAL_DATASET_PATH}"
        )
    frame = pd.read_csv(CANONICAL_DATASET_PATH, parse_dates=["InvoiceDate"])
    frame.columns = [str(col).strip() for col in frame.columns]
    frame = frame.dropna(
        subset=["InvoiceNo", "StockCode", "Description", "CustomerID", "InvoiceDate"]
    )
    frame = frame[(frame["UnitPrice"] > 0) & (frame["Quantity"] != 0)].copy()
    frame["row_number"] = range(1, len(frame) + 1)
    frame["order_line_id"] = frame["row_number"].map(lambda value: f"LINE_{value:09d}")
    frame["order_id"] = frame["InvoiceNo"].map(lambda value: normalize_id("INV", value))
    frame["product_id"] = frame["StockCode"].map(lambda value: normalize_id("SKU", value))
    frame["customer_id"] = frame["CustomerID"].map(lambda value: normalize_id("CUST", value))
    frame["quantity_abs"] = frame["Quantity"].abs().astype(int)
    frame["unit_price"] = frame["UnitPrice"].round(2)
    frame["line_amount"] = (frame["quantity_abs"] * frame["unit_price"]).round(2)
    return frame


def infer_category(description: str) -> str:
    text = str(description or "").upper()
    for category, keywords in CATEGORY_RULES:
        if any(keyword in text for keyword in keywords):
            return category
    return "general merchandise"


def city_for_customer(customer_id: str, country: str) -> str:
    cities = CITY_BY_COUNTRY.get(country) or [str(country or "International").title()]
    return cities[stable_int(customer_id) % len(cities)]


def status_for_line(invoice_no: str, quantity: int, invoice_date: pd.Timestamp, max_date: pd.Timestamp) -> str:
    if str(invoice_no).upper().startswith("C") or quantity < 0:
        return "cancelled"

    days_from_latest = max(0, int((max_date.normalize() - invoice_date.normalize()).days))
    bucket = stable_int(f"{invoice_no}|{invoice_date.isoformat()}") % 100
    if days_from_latest <= 7:
        return "pending" if bucket < 18 else "paid"
    if days_from_latest <= 21:
        return "paid" if bucket < 40 else "shipped"
    if days_from_latest <= 45:
        return "shipped" if bucket < 30 else "completed"
    return "completed"


def customer_rows() -> list[tuple]:
    frame = load_online_retail_sample()
    grouped = (
        frame.sort_values("InvoiceDate")
        .groupby("customer_id", as_index=False)
        .agg(
            source_customer_id=("CustomerID", "first"),
            country=("Country", "first"),
            first_order_at=("InvoiceDate", "min"),
        )
    )
    rows = []
    for _, row in grouped.iterrows():
        customer_id = str(row["customer_id"])
        source_id = str(row["source_customer_id"])
        country = str(row["country"])
        created_offset = 30 + (stable_int(customer_id) % 720)
        created_date = pd.Timestamp(row["first_order_at"]) - pd.Timedelta(days=created_offset)
        rows.append(
            (
                customer_id,
                f"Retail Customer {source_id}",
                f"{customer_id.lower()}@online-retail.example",
                city_for_customer(customer_id, country),
                country,
                created_date.to_pydatetime(),
            )
        )
    return rows


def product_rows() -> list[tuple]:
    frame = load_online_retail_sample()
    grouped = (
        frame.sort_values("InvoiceDate")
        .groupby("product_id", as_index=False)
        .agg(
            description=("Description", "first"),
            median_price=("unit_price", "median"),
            total_quantity=("quantity_abs", "sum"),
        )
    )
    rows = []
    for _, row in grouped.iterrows():
        product_id = str(row["product_id"])
        description = str(row["description"]).strip().title()
        stock_quantity = int(max(0, min(5000, row["total_quantity"] * 0.18)))
        rows.append(
            (
                product_id,
                description,
                infer_category(description),
                round(float(row["median_price"]), 2),
                stock_quantity,
            )
        )
    return rows


def order_rows() -> list[tuple]:
    frame = load_online_retail_sample()
    max_date = pd.Timestamp(frame["InvoiceDate"].max())
    rows = []
    for _, row in frame.iterrows():
        invoice_date = pd.Timestamp(row["InvoiceDate"])
        rows.append(
            (
                str(row["order_line_id"]),
                str(row["order_id"]),
                str(row["customer_id"]),
                str(row["product_id"]),
                invoice_date.to_pydatetime(),
                int(row["quantity_abs"]),
                round(float(row["unit_price"]), 2),
                round(float(row["line_amount"]), 2),
                status_for_line(str(row["InvoiceNo"]), int(row["Quantity"]), invoice_date, max_date),
            )
        )
    return rows
