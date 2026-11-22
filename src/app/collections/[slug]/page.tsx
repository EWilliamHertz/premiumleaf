import React from 'react';
import { notFound } from 'next/navigation';
import { getMainCategoryForCollection } from '@/data/navigation';
import { getPublicCollections, getPublicProducts } from '@/lib/catalog-server';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';

export const dynamic = 'force-dynamic';

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collections = getPublicCollections();
  const current = collections.find((c) => c.slug === slug);
  if (!current) notFound();

  const lockedCategory = getMainCategoryForCollection(current.slug);
  const products = getPublicProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 border-b border-hairline pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
          {lockedCategory ? `${lockedCategory.label} · ` : ''}
          {current.prefix}-Series · {current.count} Products
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold text-espresso sm:text-5xl">
          {lockedCategory && lockedCategory.subcategorySlugs.length > 1
            ? lockedCategory.label
            : current.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          {lockedCategory ? lockedCategory.description : current.tagline}
        </p>
      </div>

      <CatalogBrowser
        key={current.slug}
        products={products}
        collections={collections}
        lockedCategory={lockedCategory}
        initialCollection={current.slug}
      />
    </div>
  );
}
