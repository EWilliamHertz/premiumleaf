'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';
import type { MainCategoryGroup } from '@/data/navigation';
import type { CollectionMeta, PublicProduct } from '@/types/catalog';

interface CatalogBrowserProps {
  products: PublicProduct[];
  collections: CollectionMeta[];
  lockedCategory?: MainCategoryGroup;
  initialCollection?: string;
  initialMode?: 'all' | 'ready' | 'inquiry';
  initialQuery?: string;
}

export function CatalogBrowser({
  products,
  collections,
  lockedCategory,
  initialCollection = 'all',
  initialMode = 'all',
  initialQuery = '',
}: CatalogBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const [collection, setCollection] = useState(initialCollection);
  const [mode, setMode] = useState<'all' | 'ready' | 'inquiry'>(initialMode);
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'weight-asc'
  >('featured');

  // When locked to a navbar main category, scope products & visible subcategories strictly to that group
  const scopedProducts = useMemo(() => {
    if (!lockedCategory) return products;
    return products.filter((p) =>
      lockedCategory.subcategorySlugs.includes(p.collectionSlug)
    );
  }, [products, lockedCategory]);

  const visibleSubcollections = useMemo(() => {
    if (!lockedCategory) return collections;
    return collections.filter((c) =>
      lockedCategory.subcategorySlugs.includes(c.slug)
    );
  }, [collections, lockedCategory]);

  const readyCount = useMemo(
    () => scopedProducts.filter((p) => p.status === 'ready').length,
    [scopedProducts]
  );
  const inquiryCount = useMemo(
    () => scopedProducts.filter((p) => p.status === 'inquiry').length,
    [scopedProducts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scopedProducts.filter((p) => {
      if (collection !== 'all' && p.collectionSlug !== collection) return false;
      if (mode === 'ready' && p.status !== 'ready') return false;
      if (mode === 'inquiry' && p.status !== 'inquiry') return false;
      if (!q) return true;
      const variantText = p.variants.map((v) => v.label.toLowerCase()).join(' ');
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.collectionName.toLowerCase().includes(q) ||
        variantText.includes(q)
      );
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.priceUsd - b.priceUsd);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.priceUsd - a.priceUsd);
    }
    if (sortBy === 'weight-asc') {
      return [...list].sort((a, b) => a.weightGrams - b.weightGrams);
    }
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'ready' ? -1 : 1;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.sku.localeCompare(b.sku);
    });
  }, [scopedProducts, query, collection, mode, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search + Order Mode + Sort Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-studio/75 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lockedCategory
                ? `Filter within ${lockedCategory.label} by SKU, name, or finish...`
                : 'Filter by SKU (Hum-001), product, finish, or material...'
            }
            className="w-full rounded-full border border-hairline bg-ivory py-2.5 pl-10 pr-4 text-xs text-espresso outline-none transition focus:border-brass"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-hairline bg-ivory p-1">
            <button
              type="button"
              onClick={() => setMode('all')}
              className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-medium transition ${
                mode === 'all'
                  ? 'bg-espresso text-ivory'
                  : 'text-taupe hover:text-espresso'
              }`}
            >
              All ({scopedProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setMode('ready')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                mode === 'ready'
                  ? 'bg-espresso text-ivory'
                  : 'text-taupe hover:text-espresso'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-brass" />
              Ready ({readyCount})
            </button>
            <button
              type="button"
              onClick={() => setMode('inquiry')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                mode === 'inquiry'
                  ? 'bg-espresso text-ivory'
                  : 'text-taupe hover:text-espresso'
              }`}
            >
              <FileCheck2 className="h-3 w-3 text-brass" />
              Inquiry ({inquiryCount})
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-ivory px-3 py-1.5 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-taupe" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'featured'
                    | 'price-asc'
                    | 'price-desc'
                    | 'weight-asc'
                )
              }
              className="cursor-pointer bg-transparent text-xs font-medium text-espresso outline-none"
            >
              <option value="featured">Curated &amp; Ready First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="weight-asc">Weight: Lightest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subcategory Pills — Strictly Scoped to Active Main Category */}
      {visibleSubcollections.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCollection('all')}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              collection === 'all'
                ? 'border-espresso bg-espresso text-ivory'
                : 'border-hairline bg-ivory text-espresso/80 hover:border-brass'
            }`}
          >
            {lockedCategory ? `All ${lockedCategory.label}` : 'All Collections'}
          </button>
          {visibleSubcollections.map((c) => {
            const active = collection === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCollection(c.slug)}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-espresso bg-espresso text-ivory'
                    : 'border-hairline bg-ivory text-espresso/80 hover:border-brass'
                }`}
              >
                {c.name}{' '}
                <span className="ml-1 font-mono text-[10px] opacity-65">
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : lockedCategory ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-studio/70 px-3.5 py-1.5 text-xs text-taupe">
          <Lock className="h-3.5 w-3.5 text-brass" />
          <span>
            Category locked to{' '}
            <strong className="text-espresso">{lockedCategory.label}</strong> —
            switch main categories from the header navigation.
          </span>
        </div>
      ) : null}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-taupe">
        <span>
          Showing <strong className="text-espresso">{filtered.length}</strong>{' '}
          pieces
        </span>
        {mode === 'inquiry' && (
          <span>
            Inquiry items require sent-inquiry approval (cabinets, oversized
            vessels &amp; specialty editions).
          </span>
        )}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-studio/50 py-16 text-center">
          <p className="font-serif text-2xl text-espresso">
            No matching accessories found
          </p>
          <p className="mt-1 text-xs text-taupe">
            Try clearing your search filter or switching between Ready and
            Inquiry tabs.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCollection(lockedCategory ? initialCollection : 'all');
              setMode('all');
            }}
            className="mt-4 cursor-pointer rounded-full bg-espresso px-5 py-2 text-xs font-semibold text-ivory"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
