#!/usr/bin/env python3
"""
Extract all 116 products, variant-matched photos, dimension diagrams, and specs
from Chartogi_Complete_Product_Catalogue.pdf into WebP assets and structured TypeScript/JSON data.
"""

from __future__ import annotations

import csv
import io
import json
import re
from pathlib import Path
from typing import Any

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "Chartogi_Complete_Product_Catalogue.pdf"
PUBLIC_IMG_DIR = ROOT / "public" / "images" / "catalog"
DATA_DIR = ROOT / "data"
DOCS_DIR = ROOT / "docs"
SRC_DATA_DIR = ROOT / "src" / "data"

COLLECTION_MAP: dict[str, dict[str, str]] = {
    "CIGAR CABINETS": {
        "slug": "cigar-cabinets",
        "name": "Cigar Cabinets",
        "prefix": "Cab",
        "tagline": "Climate-controlled glass and Spanish cedar showcase cabinets.",
    },
    "HUMIDORS & CASES": {
        "slug": "humidors",
        "name": "Humidors",
        "prefix": "Hum",
        "tagline": "Desktop cedar humidors and sealed travel humidor boxes.",
    },
    "CIGAR CASES": {
        "slug": "cigar-cases",
        "name": "Cigar Cases",
        "prefix": "Cas",
        "tagline": "Leather, carbon-fibre, and brushed steel carry cases.",
    },
    "CUTTERS & ACCESSORIES": {
        "slug": "cutters-accessories",
        "name": "Cutters & Lighters",
        "prefix": "Cut",
        "tagline": "Precision guillotine blades, V-cutters, jet lighters, and gift sets.",
    },
    "HUMIDITY & STORAGE": {
        "slug": "humidity-storage",
        "name": "Humidity Care",
        "prefix": "Hyd",
        "tagline": "Hygrometers, two-way humidity packs, humidifiers, and tubes.",
    },
    "CIGAR RESTS": {
        "slug": "cigar-rests",
        "name": "Cigar Rests",
        "prefix": "Rst",
        "tagline": "Sculpted metal, ceramic, glass, and stone table rests.",
    },
    "CIGAR ASHTRAYS": {
        "slug": "cigar-ashtrays",
        "name": "Cigar Ashtrays",
        "prefix": "Ash",
        "tagline": "Walnut-tone, wood-and-metal, and glazed ceramic ashtrays.",
    },
    "DECOR & GIFTS": {
        "slug": "decor-gifts",
        "name": "Lounge Decor & Gifts",
        "prefix": "Dec",
        "tagline": "Band jars, display shadow boxes, cufflinks, and lounge pieces.",
    },
    "IN-HOUSE COLLECTION": {
        "slug": "signature-collection",
        "name": "Reserve Editions",
        "prefix": "Sig",
        "tagline": "Small-batch journals, leather tubes, and collector editions.",
    },
    "OTHER ACCESSORIES": {
        "slug": "other-accessories",
        "name": "Specialty Accessories",
        "prefix": "Acc",
        "tagline": "Manual rollers, mouthpieces, and specialty workshop tools.",
    },
}

# Curated 52 parcel-dropship-ready accessories (status = "ready").
# Remaining 64 products (including all 5 cabinets, multi-kg sets, spray, rolling items, and specialty decor)
# default to status = "inquiry" (requires sent inquiry approval).
READY_PDF_PAGES = {
    # Humidors (12)
    8, 9, 11, 13, 15, 16, 17, 18, 19, 24, 25, 27,
    # Cigar Cases (10)
    28, 29, 30, 31, 32, 34, 36, 37, 38, 39,
    # Cutters & Lighters (12)
    41, 42, 43, 44, 46, 47, 48, 50, 52, 54, 55, 56,
    # Humidity & Storage (8)
    58, 59, 60, 63, 64, 65, 66, 68,
    # Cigar Rests (5)
    73, 74, 75, 77, 79,
    # Cigar Ashtrays (5)
    81, 82, 84, 85, 87,
}

FEATURED_PDF_PAGES = {8, 24, 30, 32, 41, 52, 66, 81, 3, 5}

# Realistic placeholder retail USD pricing & estimated China EXW costs by PDF page or collection fallback
CUSTOM_PRICES_USD: dict[int, tuple[int, int]] = {
    # Cabinets (Retail USD, Est EXW USD)
    3: (1890, 620),
    4: (490, 145),
    5: (2890, 980),
    6: (1190, 390),
    7: (1390, 460),
    # Humidors
    8: (129, 34),
    9: (98, 26),
    10: (169, 46),
    11: (89, 24),
    12: (149, 42),
    13: (69, 18),
    14: (189, 52),
    15: (64, 17),
    16: (58, 15),
    17: (109, 29),
    18: (79, 21),
    19: (59, 16),
    20: (119, 32),
    21: (139, 38),
    22: (179, 49),
    23: (94, 25),
    24: (135, 36),
    25: (84, 22),
    26: (124, 34),
    27: (68, 18),
    # Cases
    28: (74, 19),
    29: (44, 11),
    30: (48, 12),
    31: (46, 12),
    32: (49, 13),
    33: (89, 24),
    34: (54, 14),
    35: (64, 17),
    36: (52, 13),
    37: (68, 18),
    38: (56, 15),
    39: (24, 5),
    40: (79, 21),
    # Cutters & Sets
    41: (89, 24),
    42: (98, 27),
    43: (58, 15),
    44: (52, 14),
    45: (249, 72),
    46: (29, 7),
    47: (79, 21),
    48: (64, 17),
    49: (58, 15),
    50: (94, 25),
    51: (89, 24),
    52: (54, 14),
    53: (32, 8),
    54: (34, 9),
    55: (49, 13),
    56: (46, 12),
    57: (84, 22),
    # Humidity & Storage
    58: (18, 4),
    59: (22, 5),
    60: (19, 5),
    61: (89, 24),
    62: (119, 32),
    63: (24, 6),
    64: (39, 10),
    65: (44, 11),
    66: (38, 10),
    67: (22, 5),
    68: (69, 18),
    69: (29, 7),
    70: (16, 4),
    71: (19, 5),
    72: (24, 6),
    # Rests
    73: (34, 9),
    74: (39, 10),
    75: (29, 7),
    76: (49, 13),
    77: (26, 6),
    78: (48, 12),
    79: (36, 9),
    80: (58, 15),
    # Ashtrays
    81: (84, 22),
    82: (94, 25),
    83: (119, 33),
    84: (68, 18),
    85: (68, 18),
    86: (64, 17),
    87: (74, 20),
    88: (79, 21),
    89: (89, 24),
    90: (129, 36),
    # Decor & Gifts
    91: (189, 52),
    92: (18, 4),
    93: (24, 6),
    94: (169, 48),
    95: (58, 15),
    96: (44, 11),
    97: (48, 12),
    98: (64, 17),
    99: (78, 21),
    100: (24, 6),
    101: (24, 6),
    102: (24, 6),
    103: (32, 8),
    104: (54, 14),
    105: (109, 30),
    # In-House / Reserve
    106: (49, 13),
    107: (39, 10),
    108: (29, 7),
    109: (44, 11),
    110: (19, 5),
    111: (64, 17),
    112: (59, 16),
    113: (54, 14),
    114: (89, 24),
    # Other Accessories
    115: (48, 12),
    116: (69, 18),
    117: (42, 11),
    118: (56, 15),
}


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def save_webp_from_xref(
    doc: pymupdf.Document,
    xref: int,
    dest: Path,
    quality: int = 86,
    max_dim: int = 1000,
    force: bool = False,
) -> None:
    if dest.exists() and dest.stat().st_size > 0 and not force:
        return
    raw = doc.extract_image(xref)
    im = Image.open(io.BytesIO(raw["image"])).convert("RGB")
    if im.width > max_dim or im.height > max_dim:
        im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="WEBP", quality=quality, method=6)


def parse_weight_grams(specs: list[dict[str, str]], collection_key: str, page_no: int) -> int:
    for s in specs:
        k = s["key"].upper()
        v = s["value"]
        if "WEIGHT" in k or "DESIGN" in k:
            m = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*(kg|g)\b", v, re.I)
            if m:
                num = float(m.group(1))
                unit = m.group(2).lower()
                return int(round(num * 1000 if unit == "kg" else num))
    # Sensible defaults for items whose PDF says "To be confirmed" or dual sizing
    if page_no == 7:
        return 42000
    if page_no == 12:
        return 3500
    if page_no == 60:
        return 180
    if collection_key == "IN-HOUSE COLLECTION":
        return 220
    return 350


def parse_dimensions_mm(specs: list[dict[str, str]], page_no: int) -> dict[str, int]:
    length = width = height = 0
    for s in specs:
        k = s["key"].upper()
        v = s["value"]
        # Handle "330 x 255 x 180 mm" format (page 12)
        triple = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*x\s*([0-9]+(?:\.[0-9]+)?)\s*x\s*([0-9]+(?:\.[0-9]+)?)\s*mm", v, re.I)
        if triple and length == 0:
            length = round(float(triple.group(1)))
            width = round(float(triple.group(2)))
            height = round(float(triple.group(3)))
            continue
        m = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*mm\b", v, re.I)
        if not m:
            continue
        val = round(float(m.group(1)))
        if any(tok in k for tok in ["LENGTH", "DIAMETER", "OUTER DIAMETER"]):
            length = val
        elif any(tok in k for tok in ["WIDTH", "DEPTH", "PIECE WIDTH"]):
            if width == 0:
                width = val
            else:
                height = val
        elif any(tok in k for tok in ["HEIGHT", "THICKNESS", "DEPTH"]):
            height = val
    if length == 0:
        length = 160
    if width == 0:
        width = 110 if page_no != 115 else 50
    if height == 0:
        height = 45
    return {"length": length, "width": width, "height": height}


def extract_highlights(page: pymupdf.Page) -> list[dict[str, str]]:
    blocks = page.get_text("blocks")
    right_blocks = [
        b for b in sorted(blocks, key=lambda x: (round(x[1], 1), round(x[0], 1)))
        if b[0] >= 375 and 140 <= b[1] <= 340
    ]
    highlights: list[dict[str, str]] = []
    i = 0
    while i < len(right_blocks):
        txt = " ".join(right_blocks[i][4].split())
        if txt.isupper() and len(txt) < 40 and i + 1 < len(right_blocks):
            desc = " ".join(right_blocks[i + 1][4].split())
            highlights.append({"label": txt.title(), "description": desc})
            i += 2
        else:
            i += 1
    return highlights


def extract_specs_and_note(page: pymupdf.Page) -> tuple[list[dict[str, str]], str | None]:
    blocks = page.get_text("blocks")
    spec_blocks = [
        b for b in sorted(blocks, key=lambda x: (round(x[1], 1), round(x[0], 1)))
        if b[0] >= 345 and b[1] >= 520 and b[1] < 805
    ]
    specs: list[dict[str, str]] = []
    note_parts: list[str] = []

    for b in spec_blocks:
        raw = b[4].strip()
        if not raw or raw == "SPECIFICATIONS":
            continue
        lines = [l.strip() for l in raw.splitlines() if l.strip()]
        # Standard spec block has line 0 = ALL CAPS KEY, line 1+ = value, and y < 755
        if b[1] < 752 and len(lines) >= 2 and lines[0].isupper():
            specs.append({
                "key": lines[0].title(),
                "value": " ".join(lines[1:]),
            })
        elif b[1] >= 752:
            note_parts.append(" ".join(lines))

    # Special case: Page 12 has YACHT DESIGN / DRAGON DESIGN under the dual diagrams (y ~ 768..800)
    if not specs:
        dual_blocks = [
            b for b in sorted(blocks, key=lambda x: (round(x[0], 1), round(x[1], 1)))
            if 760 <= b[1] <= 802 and b[0] < 500
        ]
        i = 0
        while i < len(dual_blocks) - 1:
            k_txt = " ".join(dual_blocks[i][4].split())
            v_txt = " ".join(dual_blocks[i + 1][4].split())
            if k_txt.isupper():
                specs.append({"key": k_txt.title(), "value": v_txt})
                i += 2
            else:
                i += 1

    note = " ".join(note_parts).strip() or None
    if note:
        note = re.sub(r"\bChartogi\b", "our workshop", note, flags=re.I)
    return specs, note


def match_variants(
    doc: pymupdf.Document,
    page: pymupdf.Page,
    page_no: int,
    slug: str,
    hero_xref: int,
) -> list[dict[str, str]]:
    infos = page.get_image_info(xrefs=True)
    thumbs = sorted(
        [im for im in infos if 320 < im["bbox"][1] < 495],
        key=lambda im: (round(im["bbox"][1] / 20), im["bbox"][0]),
    )

    # Extract individual lines from text dict in the variant caption area
    d = page.get_text("dict")
    label_lines: list[tuple[float, float, str]] = []
    for b in d["blocks"]:
        if b.get("type") != 0:
            continue
        for line in b["lines"]:
            txt = " ".join("".join(s["text"] for s in line["spans"]).split()).strip()
            if not txt:
                continue
            x0, y0, x1, y1 = line["bbox"]
            if 403 <= y0 <= 505 and x0 < 560:
                label_lines.append(((x0 + x1) / 2.0, y0, txt))

    variants: list[dict[str, str]] = []

    # Special case: Page 60 (Two-Way Humidity Packs) lists 8 RH options as text without separate thumbnails
    if page_no == 60:
        rh_options = ["32% RH", "49% RH", "62% RH", "65% RH", "69% RH", "72% RH", "75% RH", "84% RH"]
        for idx, label in enumerate(rh_options, start=1):
            variants.append({
                "id": f"v{idx}",
                "label": label,
                "image": f"/images/catalog/{slug}/hero.webp",
            })
        return variants

    used_labels: set[int] = set()
    for idx, im in enumerate(thumbs, start=1):
        ix_mid = (im["bbox"][0] + im["bbox"][2]) / 2.0
        iy_bot = im["bbox"][3]

        best_i = -1
        best_dist = 1e9
        for li, (lx_mid, ly0, _) in enumerate(label_lines):
            if li in used_labels:
                continue
            if ly0 < iy_bot - 4 or ly0 > iy_bot + 26:
                continue
            dist = abs(lx_mid - ix_mid) + abs(ly0 - iy_bot) * 0.5
            if dist < best_dist:
                best_dist = dist
                best_i = li

        label = f"Option {idx}"
        if best_i != -1:
            used_labels.add(best_i)
            label = label_lines[best_i][2]
            # Strip numeric prefix like "01 / " if present? Keep clean readable form
            label = re.sub(r"^\d{2}\s*/\s*", "", label).strip()

        xref = im["xref"]
        if xref == hero_xref:
            img_rel = f"/images/catalog/{slug}/hero.webp"
        else:
            img_rel = f"/images/catalog/{slug}/variant-{idx}.webp"
            save_webp_from_xref(doc, xref, PUBLIC_IMG_DIR / slug / f"variant-{idx}.webp")

        variants.append({
            "id": f"v{idx}",
            "label": label,
            "image": img_rel,
        })

    if not variants:
        variants.append({
            "id": "v1",
            "label": "Standard Finish",
            "image": f"/images/catalog/{slug}/hero.webp",
        })

    return variants


def get_compliance_note(page_no: int, title: str, weight_grams: int, status: str) -> str | None:
    lower = title.lower()
    if weight_grams >= 5000 or page_no in {3, 4, 5, 6, 7}:
        return "Oversized / electrical cabinet — requires freight approval & voltage confirmation before dispatch."
    if "lighter" in lower:
        return "Ships unfilled without butane fuel to comply with international air cargo safety regulations."
    if "spray" in lower:
        return "Liquid vessel — fill formulation and carrier approval confirmed upon inquiry."
    if status == "inquiry":
        return "Available via direct concierge inquiry approval for individual or trade dispatch."
    return None


def main() -> None:
    doc = pymupdf.open(PDF_PATH)
    PUBLIC_IMG_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    SRC_DATA_DIR.mkdir(parents=True, exist_ok=True)

    col_counters: dict[str, int] = {}
    products: list[dict[str, Any]] = []
    supplier_rows: list[dict[str, Any]] = []

    blob_map_file = DATA_DIR / "blob-urls.json"
    blob_map: dict[str, str] = {}
    if blob_map_file.exists():
        blob_map = json.loads(blob_map_file.read_text(encoding="utf-8"))

    def resolve_img(rel_path: str) -> str:
        return blob_map.get(rel_path, rel_path)

    for pno in range(2, 118):
        page_no = pno + 1
        page = doc[pno]
        lines = [l.strip() for l in page.get_text("text").splitlines() if l.strip()]

        raw_col = lines[1]
        col_meta = COLLECTION_MAP[raw_col]
        col_slug = col_meta["slug"]
        col_counters[col_slug] = col_counters.get(col_slug, 0) + 1
        sku = f"{col_meta['prefix']}-{col_counters[col_slug]:03d}"

        supplier_product_code = lines[2]
        title = lines[3]
        subtitle = lines[4]
        slug = slugify(f"{sku}-{title}")

        # Hero & Dimension images
        infos = page.get_image_info(xrefs=True)
        top_heroes = [im for im in infos if im["bbox"][1] < 200 and (im["bbox"][2] - im["bbox"][0]) > 180]
        bottom_dims = [im for im in infos if im["bbox"][1] > 490 and im["bbox"][0] < 100]

        hero_xref = top_heroes[0]["xref"]
        dim_xref = bottom_dims[0]["xref"]

        save_webp_from_xref(doc, hero_xref, PUBLIC_IMG_DIR / slug / "hero.webp")
        save_webp_from_xref(doc, dim_xref, PUBLIC_IMG_DIR / slug / "dimensions.webp")

        variants = match_variants(doc, page, page_no, slug, hero_xref)
        highlights = extract_highlights(page)
        specs, spec_note = extract_specs_and_note(page)
        weight_grams = parse_weight_grams(specs, raw_col, page_no)
        dimensions_mm = parse_dimensions_mm(specs, page_no)

        status = "ready" if page_no in READY_PDF_PAGES else "inquiry"
        featured = page_no in FEATURED_PDF_PAGES
        price_usd, est_cost_usd = CUSTOM_PRICES_USD[page_no]
        price_eur = int(round(price_usd * 0.92))

        compliance_note = get_compliance_note(page_no, title, weight_grams, status)

        # Clean public product entry (zero Chartogi branding)
        product = {
            "sku": sku,
            "slug": slug,
            "title": title,
            "subtitle": subtitle,
            "collectionSlug": col_slug,
            "collectionName": col_meta["name"],
            "status": status,
            "featured": featured,
            "priceUsd": price_usd,
            "priceEur": price_eur,
            "estimatedCostUsd": est_cost_usd,
            "weightGrams": weight_grams,
            "dimensionsMm": dimensions_mm,
            "heroImage": resolve_img(f"/images/catalog/{slug}/hero.webp"),
            "dimensionImage": resolve_img(f"/images/catalog/{slug}/dimensions.webp"),
            "variants": [
                {**v, "image": resolve_img(v["image"])} for v in variants
            ],
            "highlights": highlights,
            "specs": specs,
            "specNote": spec_note,
            "complianceNote": compliance_note,
        }
        products.append(product)

        supplier_rows.append({
            "sku": sku,
            "title": title,
            "collection": col_meta["name"],
            "status": status,
            "pdf_page": page_no,
            "chartogi_collection": raw_col,
            "chartogi_ref": supplier_product_code,
            "variant_count": len(variants),
            "net_weight_g": weight_grams,
            "dimensions_mm": f"{dimensions_mm['length']}x{dimensions_mm['width']}x{dimensions_mm['height']}",
            "est_exw_usd": est_cost_usd,
            "retail_usd": price_usd,
            "retail_eur": price_eur,
            "est_margin_pct": round((price_usd - est_cost_usd) / price_usd * 100, 1),
            "fulfillment_type": "freight_inquiry" if weight_grams >= 5000 else ("inquiry_approval" if status == "inquiry" else "china_air_parcel"),
        })

    # Write raw extracted JSON (includes supplier mapping)
    with open(DATA_DIR / "chartogi_extracted.json", "w", encoding="utf-8") as f:
        json.dump({"products": products, "supplierMatrix": supplier_rows}, f, indent=2)

    # Write supplier SKU matrix CSV
    with open(DOCS_DIR / "supplier-sku-matrix.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(supplier_rows[0].keys()))
        writer.writeheader()
        writer.writerows(supplier_rows)

    # Initialize runtime JSON stores if they don't exist
    for fname, default_val in [
        ("catalog-overrides.json", {}),
        ("inquiries.json", []),
        ("orders.json", []),
    ]:
        fpath = DATA_DIR / fname
        if not fpath.exists():
            with open(fpath, "w", encoding="utf-8") as f:
                json.dump(default_val, f, indent=2)

    # Write src/data/collections.ts & src/data/catalog.ts
    collections_list = [
        {
            "slug": v["slug"],
            "name": v["name"],
            "prefix": v["prefix"],
            "tagline": v["tagline"],
            "count": col_counters.get(v["slug"], 0),
        }
        for v in COLLECTION_MAP.values()
    ]

    catalog_ts = (
        "// AUTO-GENERATED BY scripts/extract_catalog.py — DO NOT EDIT DIRECTLY.\n"
        "// Runtime price/status edits from /admin are stored in data/catalog-overrides.json.\n"
        "import type { Product, CollectionMeta } from '@/types/catalog';\n\n"
        f"export const COLLECTIONS: CollectionMeta[] = {json.dumps(collections_list, indent=2)};\n\n"
        f"export const BASE_PRODUCTS: Product[] = {json.dumps(products, indent=2)};\n"
    )
    with open(SRC_DATA_DIR / "catalog.ts", "w", encoding="utf-8") as f:
        f.write(catalog_ts)

    ready_count = sum(1 for p in products if p["status"] == "ready")
    inquiry_count = sum(1 for p in products if p["status"] == "inquiry")
    print(f"Extracted {len(products)} products ({ready_count} ready-to-order, {inquiry_count} inquiry-approval).")
    print(f"Total variants: {sum(len(p['variants']) for p in products)}")


if __name__ == "__main__":
    main()
