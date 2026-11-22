#!/usr/bin/env python3
"""Verify integrity of extracted catalog data, pricing, and Vercel Blob URLs."""

from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "chartogi_extracted.json"
SRC_CATALOG = ROOT / "src" / "data" / "catalog.ts"
BLOB_MAP_FILE = ROOT / "data" / "blob-urls.json"


def main() -> None:
    payload = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    products = payload["products"]
    assert len(products) == 116, f"Expected 116 products, got {len(products)}"

    ready = [p for p in products if p["status"] == "ready"]
    inquiry = [p for p in products if p["status"] == "inquiry"]
    assert 40 <= len(ready) <= 60, f"Expected 40-60 ready products, got {len(ready)}"

    blob_map = json.loads(BLOB_MAP_FILE.read_text(encoding="utf-8")) if BLOB_MAP_FILE.exists() else {}
    non_blob_urls = []
    zero_prices = []
    option_fallbacks = []
    empty_specs = []
    empty_highlights = []
    seen_skus = set()

    for p in products:
        assert p["sku"] not in seen_skus, f"Duplicate SKU: {p['sku']}"
        seen_skus.add(p["sku"])

        if p["priceUsd"] <= 0 or p["priceEur"] <= 0:
            zero_prices.append(p["sku"])

        for img_url in [p["heroImage"], p["dimensionImage"], *[v["image"] for v in p["variants"]]]:
            if not img_url.startswith("https://") or "blob.vercel-storage.com" not in img_url:
                non_blob_urls.append((p["sku"], img_url))

        for v in p["variants"]:
            if v["label"].startswith("Option "):
                option_fallbacks.append((p["sku"], p["title"], v["label"]))

        if not p["specs"]:
            empty_specs.append((p["sku"], p["title"]))
        if not p["highlights"]:
            empty_highlights.append((p["sku"], p["title"]))

    catalog_text = SRC_CATALOG.read_text(encoding="utf-8").lower()
    body_start = catalog_text.find("export const base_products")
    public_body = catalog_text[body_start:]
    leaked_chartogi = "chartogi" in public_body
    leaked_steven = "steven tang" in public_body

    # Live HTTP HEAD spot check on 3 Vercel Blob image URLs
    sample_urls = [
        products[0]["heroImage"],
        products[27]["variants"][0]["image"],
        products[50]["dimensionImage"],
    ]
    http_statuses = []
    for url in sample_urls:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=10) as resp:
            http_statuses.append((url.split("/")[-2] + "/" + url.split("/")[-1], resp.status))

    print(f"Total products: {len(products)} | Ready: {len(ready)} | Inquiry: {len(inquiry)}")
    print(f"Blob URL map entries: {len(blob_map)} | Non-Blob image URLs: {len(non_blob_urls)}")
    print(f"Zero prices: {len(zero_prices)} | Option fallbacks: {len(option_fallbacks)}")
    print(f"Empty specs: {len(empty_specs)} | Empty highlights: {len(empty_highlights)}")
    print(f"Leaked supplier names in public catalog: chartogi={leaked_chartogi}, steven={leaked_steven}")
    print(f"Live Blob HTTP checks: {http_statuses}")

    assert not non_blob_urls, f"Non-blob URLs found: {non_blob_urls[:5]}"
    assert not zero_prices, f"Zero prices found: {zero_prices}"
    assert not leaked_chartogi and not leaked_steven


if __name__ == "__main__":
    main()
