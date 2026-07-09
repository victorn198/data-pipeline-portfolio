from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "diagrams"
W, H = 1600, 900

BG = "#041021"
SURFACE_DEEP = "#0a1d35"
PANEL = "#142f52"
PANEL_2 = "#1a426c"
BORDER = "#477eaf"
TEXT = "#dce9ff"
MUTED = "#9cb4d7"
ACCENT = "#f7b267"
BLUE = "#67b8ff"
GREEN = "#69d4b4"


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


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str, outline: str = BORDER, radius: int = 16) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def arrow(draw: ImageDraw.ImageDraw, x1: int, y: int, x2: int) -> None:
    draw.line((x1, y, x2 - 14, y), fill=BLUE, width=4)
    draw.polygon([(x2 - 14, y - 11), (x2 - 14, y + 11), (x2 + 8, y)], fill=BLUE)


@dataclass
class FlowBox:
    title: str
    body: list[str]


def draw_header(
    draw: ImageDraw.ImageDraw,
    eyebrow: str,
    title: str,
    subtitle: str,
    tag: str,
) -> None:
    draw.text((60, 54), eyebrow, font=font(15, True), fill=BLUE)
    draw.text((60, 82), title, font=font(40, True), fill=TEXT)
    draw_fit_text(draw, (60, 134), (1160, 34), subtitle, 21, MUTED)
    rounded(draw, (1322, 52, 1540, 96), "#102a49", BLUE, 14)
    tag_w, _ = text_size(draw, tag, font(15, True))
    draw.text((1431 - tag_w // 2, 66), tag, font=font(15, True), fill=BLUE)


def draw_flow_box(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    item: FlowBox,
    fill: str,
    stage: str,
) -> None:
    x1, y1, x2, y2 = box
    rounded(draw, box, fill, radius=16)
    draw.text((x1 + 18, y1 + 16), stage, font=font(13, True), fill=BLUE)
    draw_fit_text(draw, (x1 + 18, y1 + 42), (x2 - x1 - 36, 36), item.title, 20, TEXT, True, 15)
    y = y1 + 94
    body_h = y2 - y - 20
    line_budget = max(1, body_h // max(1, len(item.body)))
    for line in item.body:
        draw_fit_text(draw, (x1 + 18, y), (x2 - x1 - 36, line_budget - 4), line, 17, "#d3e2f7", False, 13)
        y += line_budget


def render_architecture() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_header(
        draw,
        "DATA PRODUCT ARCHITECTURE",
        "NextGen Analytics Architecture",
        "From source ingestion to governed metrics and decision-ready desktop workflows.",
        "END-TO-END FLOW",
    )

    boxes = [
        FlowBox("Source ingestion", ["UCI retail sample", "CRM, billing, support", "CSV / JSON / API feeds"]),
        FlowBox("Raw landing", ["PostgreSQL raw schema", "batch metadata", "source profiling"]),
        FlowBox("dbt standardization", ["staging contracts", "clean source tables", "snapshot state"]),
        FlowBox("Core metrics", ["enhanced orders", "sales fact", "account + marketing marts"]),
        FlowBox("Semantic API", ["metric definitions", "dashboard payloads", "governed contracts"]),
        FlowBox("Decision desktop", ["Account Health", "Source Health", "drilldown workflows"]),
    ]
    x, y, bw, bh, gap = 60, 220, 220, 178, 28
    for idx, item in enumerate(boxes):
        x1 = x + idx * (bw + gap)
        draw_flow_box(
            draw,
            (x1, y, x1 + bw, y + bh),
            item,
            PANEL_2 if idx >= 3 else PANEL,
            f"STAGE {idx + 1:02d}",
        )
        if idx < len(boxes) - 1:
            arrow(draw, x1 + bw + 3, y + bh // 2, x1 + bw + gap - 5)

    rounded(draw, (60, 458, 770, 822), SURFACE_DEEP, BORDER, 16)
    draw.text((88, 492), "Trust controls", font=font(21, True), fill=TEXT)
    draw.text((88, 526), "Visible quality signals before a metric reaches a decision screen.", font=font(16), fill=MUTED)
    proof = [
        "Source batches and profiling are visible in the product",
        "dbt tests and snapshots protect model contracts",
        "Semantic API keeps metric definitions consistent",
        "Mutations stay disabled unless explicitly reviewed",
    ]
    py = 584
    for item in proof:
        draw.ellipse((90, py + 4, 104, py + 18), fill=GREEN)
        draw_fit_text(draw, (124, py), (610, 27), item, 17, TEXT, False, 14)
        py += 52

    rounded(draw, (800, 458, 1540, 822), PANEL, BORDER, 16)
    draw.text((828, 492), "Decision-ready outputs", font=font(21, True), fill=TEXT)
    draw.text((828, 526), "The project is organized around questions a business team can act on.", font=font(16), fill=MUTED)
    scale = [
        ("REVENUE", "trends, concentration, ticket, and channel reading"),
        ("RETENTION", "RFM segments, cohorts, and customer behavior"),
        ("ACCOUNT HEALTH", "billing, support, CRM, and ecommerce context"),
        ("SOURCE HEALTH", "load metadata, nulls, duplicates, and reliability"),
    ]
    sy = 584
    for number, label in scale:
        draw_fit_text(draw, (830, sy), (180, 26), number, 16, ACCENT, True, 13)
        draw_fit_text(draw, (1038, sy), (460, 28), label, 17, TEXT, False, 14)
        sy += 53

    rounded(draw, (60, 850, 1540, 880), "#0b2340", "#214d78", 12)
    draw.text((82, 857), "SOURCE  ->  RAW  ->  DBT  ->  SEMANTIC API  ->  DESKTOP DECISION WORKFLOW", font=font(14, True), fill=BLUE)

    img.save(OUT / "architecture-overview.png")


def draw_layer(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, items: list[str], title_color: str = BLUE) -> None:
    x1, y1, x2, y2 = box
    rounded(draw, box, PANEL, BORDER, 16)
    draw_fit_text(draw, (x1 + 20, y1 + 22), (x2 - x1 - 40, 32), title, 21, title_color, True, 16)
    draw.line((x1 + 20, y1 + 64, x2 - 20, y1 + 64), fill="#315f8d", width=2)
    y = y1 + 88
    for item in items:
        pill = (x1 + 18, y, x2 - 18, y + 52)
        rounded(draw, pill, SURFACE_DEEP, "#3e79ad", 12)
        draw_fit_text(draw, (pill[0] + 14, pill[1] + 14), (pill[2] - pill[0] - 28, 24), item, 17, TEXT, False, 13)
        y += 76


def render_warehouse() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_header(
        draw,
        "WAREHOUSE AND OBSERVABILITY",
        "Warehouse Model and Database Layers",
        "A governed route from source landing to business marts, service contracts, and reliability signals.",
        "MODEL LINEAGE",
    )

    layers = [
        ("RAW", ["orders_raw", "customers_raw", "products_raw"], BLUE),
        ("STAGING", ["stg_orders", "stg_customers", "stg_products", "stg_customer_snapshot"], BLUE),
        ("INTERMEDIATE", ["int_orders_enhanced"], BLUE),
        ("MARTS", ["dim_customer", "dim_product", "fct_sales", "mart_account_health", "mart_marketing_efficiency"], BLUE),
        ("OBSERVABILITY", ["quality audit", "alerts", "operational views", "source health"], ACCENT),
    ]
    x, y, bw, bh, gap = 60, 220, 264, 540, 26
    for idx, (title, items, color) in enumerate(layers):
        x1 = x + idx * (bw + gap)
        draw_layer(draw, (x1, y, x1 + bw, y + bh), title, items, color)
        if idx < len(layers) - 1:
            arrow(draw, x1 + bw + 3, y + bh // 2, x1 + bw + gap - 5)

    rounded(draw, (60, 800, 1540, 870), SURFACE_DEEP, BORDER, 16)
    draw.text((82, 818), "MODEL CONTRACT", font=font(14, True), fill=ACCENT)
    draw_fit_text(
        draw,
        (82, 842),
        (1380, 24),
        "Raw landing in PostgreSQL -> dbt standardization -> marts for BI and API -> observable quality controls.",
        17,
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
