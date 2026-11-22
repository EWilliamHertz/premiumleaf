import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { appendInquiry, getAllMergedProducts } from '@/lib/catalog-server';
import type { MarketRegion } from '@/types/catalog';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      sku?: string;
      variantLabel?: string;
      quantity?: number;
      market?: MarketRegion;
      customerName?: string;
      customerEmail?: string;
      company?: string;
      country?: string;
      notes?: string;
    };

    const sku = (body.sku || '').trim();
    const customerName = (body.customerName || '').trim();
    const customerEmail = (body.customerEmail || '').trim();
    const country = (body.country || '').trim();

    if (!sku || !customerName || !customerEmail || !country) {
      return NextResponse.json(
        { error: 'Please provide product SKU, name, email, and destination country.' },
        { status: 400 }
      );
    }

    const product = getAllMergedProducts().find(
      (p) => p.sku.toLowerCase() === sku.toLowerCase() && p.status !== 'hidden'
    );
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const record = appendInquiry({
      id: `INQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      sku: product.sku,
      productTitle: product.title,
      variantLabel: body.variantLabel?.trim() || product.variants[0]?.label || 'Standard',
      quantity: Math.max(1, Math.min(500, Number(body.quantity) || 1)),
      market: body.market === 'EU' ? 'EU' : 'US',
      customerName,
      customerEmail,
      company: body.company?.trim() || undefined,
      country,
      notes: body.notes?.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, inquiry: record });
  } catch {
    return NextResponse.json({ error: 'Failed to submit inquiry.' }, { status: 400 });
  }
}
