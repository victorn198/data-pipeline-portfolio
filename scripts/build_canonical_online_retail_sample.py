from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path

import pandas as pd
import requests

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = "https://archive.ics.uci.edu/static/public/352/online+retail.zip"
DEFAULT_CACHE_DIR = PROJECT_ROOT / ".tmp_data" / "online_retail"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "canonical" / "online_retail_uci_sample.csv"
TARGET_ROWS = 100_000
DATE_SHIFT_YEARS = 14
RANDOM_STATE = 20250527


def _download_workbook(cache_dir: Path) -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    archive_path = cache_dir / "online_retail.zip"
    workbook_path = cache_dir / "Online Retail.xlsx"
    if workbook_path.exists():
        return workbook_path

    response = requests.get(SOURCE_URL, timeout=60)
    response.raise_for_status()
    archive_path.write_bytes(response.content)
    with zipfile.ZipFile(archive_path) as archive:
        archive.extract("Online Retail.xlsx", cache_dir)
    return workbook_path


def _allocate_monthly_rows(frame: pd.DataFrame, target_rows: int) -> pd.Series:
    counts = frame["month"].value_counts().sort_index()
    raw_alloc = counts / counts.sum() * target_rows
    alloc = raw_alloc.astype(int)
    remainder = target_rows - int(alloc.sum())
    for month in (raw_alloc - alloc).sort_values(ascending=False).index[:remainder]:
        alloc.loc[month] += 1
    return alloc


def build_sample(workbook_path: Path, output_path: Path, target_rows: int) -> None:
    frame = pd.read_excel(workbook_path, engine="openpyxl")
    frame.columns = [str(col).strip() for col in frame.columns]
    frame = frame.dropna(
        subset=["InvoiceNo", "StockCode", "Description", "CustomerID", "InvoiceDate"]
    ).copy()
    frame = frame[
        (frame["UnitPrice"] > 0)
        & (frame["UnitPrice"].round(2) > 0)
        & (frame["Quantity"] != 0)
    ].copy()
    if len(frame) < target_rows:
        raise ValueError(
            f"Source has only {len(frame)} valid rows after cleaning; need {target_rows}."
        )

    frame["InvoiceDate"] = pd.to_datetime(frame["InvoiceDate"])
    frame["month"] = frame["InvoiceDate"].dt.to_period("M").astype(str)
    alloc = _allocate_monthly_rows(frame, target_rows)

    parts = []
    for month, row_count in alloc.items():
        group = frame[frame["month"] == month]
        parts.append(
            group.sample(n=int(row_count), random_state=RANDOM_STATE, replace=False)
        )

    sample = (
        pd.concat(parts)
        .sort_values(["InvoiceDate", "InvoiceNo", "StockCode"])
        .reset_index(drop=True)
    )
    sample["InvoiceDate"] = sample["InvoiceDate"] + pd.DateOffset(years=DATE_SHIFT_YEARS)
    sample["CustomerID"] = sample["CustomerID"].astype(int).astype(str)
    sample["Quantity"] = sample["Quantity"].astype(int)
    sample["UnitPrice"] = sample["UnitPrice"].round(2)
    sample["LineAmount"] = (sample["Quantity"].abs() * sample["UnitPrice"]).round(2)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    columns = [
        "InvoiceNo",
        "StockCode",
        "Description",
        "Quantity",
        "InvoiceDate",
        "UnitPrice",
        "LineAmount",
        "CustomerID",
        "Country",
    ]
    sample[columns].to_csv(output_path, index=False)
    print(
        f"Wrote {len(sample)} rows to {output_path} "
        f"({sample['InvoiceDate'].min()} -> {sample['InvoiceDate'].max()})"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build the canonical UCI Online Retail sample used by the portfolio."
    )
    parser.add_argument("--workbook", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--target-rows", type=int, default=TARGET_ROWS)
    args = parser.parse_args()

    workbook_path = args.workbook or _download_workbook(DEFAULT_CACHE_DIR)
    if not workbook_path.exists():
        raise FileNotFoundError(workbook_path)
    build_sample(workbook_path, args.output, args.target_rows)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Failed to build canonical sample: {exc}", file=sys.stderr)
        raise
