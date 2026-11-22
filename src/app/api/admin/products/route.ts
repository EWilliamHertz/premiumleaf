import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  getAllMergedProducts,
  getInquiries,
  getOrders,
  getSupplierMappingBySku,
  saveCatalogOverrides,
  updateInquiry,
} from '@/lib/catalog-server';
import type { CatalogOverride, ProductStatus } from '@/types/catalog';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    products: getAllMergedProducts(),
    supplierMap: getSupplierMappingBySku(),
    inquiries: getInquiries(),
    orders: getOrders(),
  });
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      updates?: Record<string, CatalogOverride>;
      inquiryUpdate?: {
        id: string;
        status: 'pending' | 'approved' | 'declined';
        quotedPriceUsd?: number;
      };
    };

    if (body.inquiryUpdate) {
      const updated = updateInquiry(body.inquiryUpdate.id, {
        status: body.inquiryUpdate.status,
        quotedPriceUsd: body.inquiryUpdate.quotedPriceUsd,
      });
      if (!updated) {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
      }
      return NextResponse.json({ inquiry: updated });
    }

    if (body.updates && typeof body.updates === 'object') {
      const sanitized: Record<string, CatalogOverride> = {};
      const allowedStatuses: ProductStatus[] = ['ready', 'inquiry', 'hidden'];

      for (const [sku, patch] of Object.entries(body.updates)) {
        const clean: CatalogOverride = {};
        if (typeof patch.priceUsd === 'number' && Number.isFinite(patch.priceUsd) && patch.priceUsd >= 0) {
          clean.priceUsd = Math.round(patch.priceUsd * 100) / 100;
        }
        if (typeof patch.priceEur === 'number' && Number.isFinite(patch.priceEur) && patch.priceEur >= 0) {
          clean.priceEur = Math.round(patch.priceEur * 100) / 100;
        }
        if (typeof patch.estimatedCostUsd === 'number' && Number.isFinite(patch.estimatedCostUsd) && patch.estimatedCostUsd >= 0) {
          clean.estimatedCostUsd = Math.round(patch.estimatedCostUsd * 100) / 100;
        }
        if (patch.status && allowedStatuses.includes(patch.status)) {
          clean.status = patch.status;
        }
        if (typeof patch.featured === 'boolean') {
          clean.featured = patch.featured;
        }
        sanitized[sku] = clean;
      }

      saveCatalogOverrides(sanitized);
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/collections/[slug]', 'page');
      revalidatePath('/products/[slug]', 'page');

      return NextResponse.json({
        ok: true,
        products: getAllMergedProducts(),
      });
    }

    return NextResponse.json({ error: 'No valid update payload' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
