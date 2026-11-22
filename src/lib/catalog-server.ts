import fs from 'fs';
import path from 'path';
import { BASE_PRODUCTS, COLLECTIONS } from '@/data/catalog';
import type {
  CatalogOverride,
  CollectionMeta,
  InquiryRecord,
  OrderRecord,
  Product,
  PublicProduct,
} from '@/types/catalog';

const DATA_DIR = path.join(process.cwd(), 'data');
const OVERRIDES_FILE = path.join(DATA_DIR, 'catalog-overrides.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SUPPLIER_EXTRACTED_FILE = path.join(DATA_DIR, 'chartogi_extracted.json');

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
}

export function getCatalogOverrides(): Record<string, CatalogOverride> {
  return readJsonSafe<Record<string, CatalogOverride>>(OVERRIDES_FILE, {});
}

export function getAllMergedProducts(): Product[] {
  const overrides = getCatalogOverrides();
  return BASE_PRODUCTS.map((base) => {
    const ov = overrides[base.sku];
    if (!ov) return base;
    return {
      ...base,
      priceUsd: typeof ov.priceUsd === 'number' ? ov.priceUsd : base.priceUsd,
      priceEur: typeof ov.priceEur === 'number' ? ov.priceEur : base.priceEur,
      estimatedCostUsd:
        typeof ov.estimatedCostUsd === 'number'
          ? ov.estimatedCostUsd
          : base.estimatedCostUsd,
      status: ov.status ?? base.status,
      featured: typeof ov.featured === 'boolean' ? ov.featured : base.featured,
    };
  });
}

export function stripSupplierCosts(p: Product): PublicProduct {
  const { estimatedCostUsd: _ignored, ...rest } = p;
  void _ignored;
  return rest;
}

export function getPublicProducts(): PublicProduct[] {
  return getAllMergedProducts()
    .filter((p) => p.status !== 'hidden')
    .map(stripSupplierCosts);
}

export function getPublicProductBySlug(slug: string): PublicProduct | null {
  const found = getAllMergedProducts().find(
    (p) => p.slug === slug && p.status !== 'hidden'
  );
  return found ? stripSupplierCosts(found) : null;
}

export function getPublicCollections(): CollectionMeta[] {
  const products = getPublicProducts();
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.collectionSlug] = (counts[p.collectionSlug] || 0) + 1;
  }
  return COLLECTIONS.map((c) => ({
    ...c,
    count: counts[c.slug] ?? 0,
  }));
}

export function saveCatalogOverrides(
  updates: Record<string, CatalogOverride>
): Record<string, CatalogOverride> {
  const current = getCatalogOverrides();
  const next: Record<string, CatalogOverride> = { ...current };
  const now = new Date().toISOString();

  for (const [sku, patch] of Object.entries(updates)) {
    next[sku] = {
      ...(current[sku] || {}),
      ...patch,
      updatedAt: now,
    };
  }
  writeJsonAtomic(OVERRIDES_FILE, next);
  return next;
}

export interface SupplierRefRow {
  sku: string;
  pdf_page: number;
  chartogi_collection: string;
  chartogi_ref: string;
  fulfillment_type: string;
}

export function getSupplierMappingBySku(): Record<string, SupplierRefRow> {
  const extracted = readJsonSafe<{ supplierMatrix?: SupplierRefRow[] }>(
    SUPPLIER_EXTRACTED_FILE,
    {}
  );
  const map: Record<string, SupplierRefRow> = {};
  for (const row of extracted.supplierMatrix ?? []) {
    map[row.sku] = row;
  }
  return map;
}

export function getInquiries(): InquiryRecord[] {
  return readJsonSafe<InquiryRecord[]>(INQUIRIES_FILE, []);
}

export function appendInquiry(record: InquiryRecord): InquiryRecord {
  const list = getInquiries();
  list.unshift(record);
  writeJsonAtomic(INQUIRIES_FILE, list);
  return record;
}

export function updateInquiry(
  id: string,
  patch: Partial<Pick<InquiryRecord, 'status' | 'quotedPriceUsd'>>
): InquiryRecord | null {
  const list = getInquiries();
  const idx = list.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  writeJsonAtomic(INQUIRIES_FILE, list);
  return list[idx];
}

export function getOrders(): OrderRecord[] {
  return readJsonSafe<OrderRecord[]>(ORDERS_FILE, []);
}

export function appendOrder(record: OrderRecord): OrderRecord {
  const list = getOrders();
  list.unshift(record);
  writeJsonAtomic(ORDERS_FILE, list);
  return record;
}
