from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "diagrams"
W, H = 1600, 900

BG = "#0b1830"
PANEL = "#173763"
PANEL_2 = "#1f5f93"
BORDER = "#3f7fc2"
TEXT = "#eef5ff"
MUTED = "#9fb2ce"
ACCENT = "#ffb75c"
BLUE = "#82c5ff"
GREEN = "#8bdcb8"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    fnt: ImageFont.ImageFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_size(draw, candidate, fnt)[0] <= max_width:
            current = candidate
            continue
        if current:
            lines.append(current)
        if text_size(draw, word, fnt)[0] <= max_width:
            current = word
            continue
        current = ""
        chunk = ""
        for char in word:
            candidate_chunk = chunk + char
            if text_size(draw, candidate_chunk, fnt)[0] <= max_width:
                chunk = candidate_chunk
            else:
                if chunk:
                    lines.append(chunk)
                chunk = char
        current = chunk
    if current:
        lines.append(current)
    return lines


def fit_lines(
    draw: ImageDraw.ImageDraw,
    text: str,
    max_width: int,
    max_height: int,
    start_size: int,
    min_size: int = 15,
    bold: bool = False,
) -> tuple[ImageFont.ImageFont, list[str], int]:
    for size in range(start_size, min_size - 1, -1):
        fnt = font(size, bold)
        lines = wrap_text(draw, text, fnt, max_width)
        line_h = int(size * 1.34)
        if len(lines) * line_h <= max_height:
            return fnt, lines, line_h
    fnt = font(min_size, bold)
    lines = wrap_text(draw, text, fnt, max_width)
    line_h = int(min_size * 1.28)
    max_lines = max(1, max_height // line_h)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        while lines and text_size(draw, lines[-1] + "...", fnt)[0] > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] = lines[-1].rstrip() + "..."
    return fnt, lines, line_h


def draw_fit_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    box: tuple[int, int],
    text: str,
    size: int,
    color: str = TEXT,
    bold: bool = False,
    min_size: int = 15,
    anchor: str = "la",
) -> None:
    max_w, max_h = box
    fnt, lines, line_h = fit_lines(draw, text, max_w, max_h, size, min_size, bold)
    x, y = xy
    for idx, line in enumerate(lines):
        draw.text((x, y + idx * line_h), line, font=fnt, fill=color, anchor=anchor)


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str, outline: str = BORDER, radius: int = 22) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def arrow(draw: ImageDraw.ImageDraw, x1: int, y: int, x2: int) -> None:
    draw.line((x1, y, x2 - 14, y), fill=BLUE, width=4)
    draw.polygon([(x2 - 14, y - 11), (x2 - 14, y + 11), (x2 + 8, y)], fill=BLUE)


@dataclass
class FlowBox:
    title: str
    body: list[str]


def draw_flow_box(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], item: FlowBox, fill: str) -> None:
    x1, y1, x2, y2 = box
    rounded(draw, box, fill, radius=22)
    draw_fit_text(draw, (x1 + 20, y1 + 22), (x2 - x1 - 40, 34), item.title, 19, TEXT, True, 15)
    y = y1 + 68
    body_h = y2 - y - 18
    line_budget = max(1, body_h // max(1, len(item.body)))
    for line in item.body:
        draw_fit_text(draw, (x1 + 20, y), (x2 - x1 - 40, line_budget - 4), line, 20, "#d8e6f7", False, 14)
        y += line_budget


def render_architecture() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw.text((56, 52), "NextGen Analytics Architecture", font=font(42, True), fill=TEXT)
    draw_fit_text(
        draw,
        (56, 104),
        (1050, 34),
        "End-to-end analytics engineering portfolio: ingestion, warehouse, BI, API, and desktop-first analytics UX.",
        23,
        MUTED,
    )
    rounded(draw, (1340, 34, 1545, 86), "#12345b", BLUE, 18)
    draw.text((1364, 53), "Portfolio-ready stack", font=font(16), fill=BLUE)

    boxes = [
        FlowBox("1. Extractors", ["Python simulators", "Fake Store API seeds", "scaled ecommerce data"]),
        FlowBox("2. Raw Layer", ["PostgreSQL raw schema", "orders_raw", "customers_raw", "products_raw"]),
        FlowBox("3. dbt Staging", ["stg_orders", "stg_customers", "stg_products", "stg_snapshot_current"]),
        FlowBox("4. dbt Core", ["int_orders_enhanced", "dim_customer", "dim_product", "fct_sales"]),
        FlowBox("5. Semantic + BI", ["Measure dictionary", "Dashboard model", "API payload contracts"]),
        FlowBox("6. Delivery", ["FastAPI + Desktop BI", "Spotlight windows", "Compare + bookmarks"]),
    ]
    x, y, bw, bh, gap = 60, 210, 220, 180, 30
    for idx, item in enumerate(boxes):
        x1 = x + idx * (bw + gap)
        draw_flow_box(draw, (x1, y, x1 + bw, y + bh), item, PANEL_2 if idx >= 3 else PANEL)
        if idx < len(boxes) - 1:
            arrow(draw, x1 + bw + 7, y + bh // 2, x1 + bw + gap - 8)

    rounded(draw, (60, 470, 760, 820), "#132d54", BORDER, 24)
    draw.text((90, 506), "What the repository proves", font=font(18, True), fill=TEXT)
    proof = [
        "Real analytics layers instead of a single dashboard artifact",
        "dbt tests, snapshots, monitoring objects, and benchmark tooling",
        "Desktop-first BI UX with Spotlight, Compare, bookmarks, and actions",
        "Security hardening around agent workflows and mutable dashboard state",
    ]
    py = 568
    for item in proof:
        draw.ellipse((91, py + 3, 107, py + 19), fill=GREEN)
        draw_fit_text(draw, (124, py), (590, 28), item, 19, TEXT, False, 14)
        py += 56

    rounded(draw, (810, 470, 1540, 820), "#183765", BORDER, 24)
    draw.text((840, 506), "Current scale", font=font(18, True), fill=TEXT)
    scale = [
        ("100k+", "simulated order lines in the standard project load"),
        ("10k", "customers generated for portfolio-scale slicing"),
        ("2k", "products generated for Pareto / ABC / mix analysis"),
        ("7+", "analytics pages in the desktop dashboard experience"),
        ("26", "API, source, and semantic tests passing in the suite"),
    ]
    sy = 560
    for number, label in scale:
        draw.text((850, sy), number, font=font(30, True), fill=ACCENT)
        draw_fit_text(draw, (955, sy + 5), (500, 30), label, 20, TEXT, False, 14)
        sy += 54

    img.save(OUT / "architecture-overview.png")


def draw_layer(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, items: list[str], title_color: str = BLUE) -> None:
    x1, y1, x2, y2 = box
    rounded(draw, box, "#162f56", BORDER, 24)
    draw_fit_text(draw, (x1 + 22, y1 + 32), (x2 - x1 - 44, 34), title, 25, title_color, True, 18)
    y = y1 + 90
    for item in items:
        pill = (x1 + 18, y, x2 - 18, y + 58)
        rounded(draw, pill, "#10233f", BORDER, 16)
        draw_fit_text(draw, (pill[0] + 16, pill[1] + 16), (pill[2] - pill[0] - 32, 24), item, 20, TEXT, False, 13)
        y += 88


def render_warehouse() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw.text((56, 52), "Warehouse Model and Database Layers", font=font(42, True), fill=TEXT)
    draw_fit_text(
        draw,
        (56, 104),
        (1280, 34),
        "Generated from the repository structure: raw ingestion, dbt transformations, marts, monitoring, and dashboard-facing semantics.",
        23,
        MUTED,
    )
    rounded(draw, (1340, 34, 1545, 86), "#12345b", BLUE, 18)
    draw.text((1364, 53), "Portfolio-ready stack", font=font(16), fill=BLUE)

    layers = [
        ("RAW", ["raw.orders_raw", "raw.customers_raw", "raw.products_raw"], BLUE),
        ("STAGING", ["stg_orders", "stg_customers", "stg_products", "stg_customer_snapshot"], BLUE),
        ("INTERMEDIATE", ["int_orders_enhanced"], BLUE),
        ("MARTS", ["dim_customer", "dim_product", "fct_sales", "mart_account_health"], BLUE),
        ("MONITORING", ["data_quality_audit", "alerts", "operational_views", "source_health"], ACCENT),
    ]
    x, y, bw, bh, gap = 52, 190, 250, 570, 54
    for idx, (title, items, color) in enumerate(layers):
        x1 = x + idx * (bw + gap)
        draw_layer(draw, (x1, y, x1 + bw, y + bh), title, items, color)
        if idx < len(layers) - 1:
            arrow(draw, x1 + bw + 8, y + 280, x1 + bw + gap - 16)

    rounded(draw, (52, 790, 1492, 852), "#132d54", BORDER, 20)
    draw_fit_text(
        draw,
        (78, 817),
        (1365, 28),
        "Warehouse story: raw landing in PostgreSQL -> dbt standardization -> marts for BI/API -> monitoring objects for trust and observability.",
        20,
        TEXT,
        False,
        14,
    )
    img.save(OUT / "warehouse-model.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    render_architecture()
    render_warehouse()


if __name__ == "__main__":
    main()
