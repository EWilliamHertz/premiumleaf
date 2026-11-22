import React from 'react';
import { getPublicCollections, getPublicProducts } from '@/lib/catalog-server';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';

export const dynamic = 'force-dynamic';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; collection?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const products = getPublicProducts();
  const collections = getPublicCollections();

  const initialMode =
    sp.mode === 'ready' || sp.mode === 'inquiry' ? sp.mode : 'all';
  const initialCollection = sp.collection || 'all';
  const initialQuery = sp.q || '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 border-b border-hairline pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
          Complete Archive · {products.length} Pieces
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold text-espresso sm:text-5xl">
          The Cigar Accessories Catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Browse ready-to-order accessories alongside inquiry-approved cabinets,
          heavy display vessels, and bespoke pieces.
        </p>
      </div>

      <CatalogBrowser
        key={`${initialCollection}-${initialMode}-${initialQuery}`}
        products={products}
        collections={collections}
        initialCollection={initialCollection}
        initialMode={initialMode}
        initialQuery={initialQuery}
      />
    </div>
  );
}
