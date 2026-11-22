'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  FileCheck2,
  Ruler,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatMoney } from '@/lib/shipping';
import { ProductCard } from '@/components/catalog/ProductCard';
import type { PublicProduct } from '@/types/catalog';

export function ProductDetailClient({
  product,
  related,
}: {
  product: PublicProduct;
  related: PublicProduct[];
}) {
  const { currency, addToCart, openInquiry } = useStore();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [showDimLightbox, setShowDimLightbox] = useState(false);

  const activeVariant = product.variants[selectedIdx] || product.variants[0];
  const price = currency === 'EUR' ? product.priceEur : product.priceUsd;
  const isReady = product.status === 'ready';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-taupe">
        <Link href="/" className="hover:text-espresso">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-espresso">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/collections/${product.collectionSlug}`}
          className="hover:text-espresso"
        >
          {product.collectionName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-mono text-espresso">{product.sku}</span>
      </nav>

      {/* Main Split Showcase */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left: Studio Photography + Variant Thumbnails */}
        <div className="space-y-4 lg:col-span-7">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-hairline bg-studio">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeVariant?.image || product.heroImage}
                initial={{ opacity: 0.4, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4 }}
                transition={{ duration: 0.22 }}
                className="relative h-full w-full"
              >
                <Image
                  src={activeVariant?.image || product.heroImage}
                  alt={`${product.title} — ${activeVariant?.label || ''}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain p-8"
                />
              </motion.div>
            </AnimatePresence>

            <span className="absolute left-5 top-5 rounded-full bg-ivory/95 px-3 py-1 font-mono text-xs font-medium text-espresso shadow-2xs">
              SKU: {product.sku}
            </span>
          </div>

          {/* Thumbnail Strip */}
          {product.variants.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {product.variants.map((v, idx) => {
                const active = idx === selectedIdx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`group overflow-hidden rounded-xl border bg-studio p-1.5 text-left transition ${
                      active
                        ? 'border-espresso ring-1 ring-espresso'
                        : 'border-hairline hover:border-brass'
                    }`}
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={v.image}
                        alt={v.label}
                        fill
                        sizes="120px"
                        className="object-contain"
                      />
                    </div>
                    <p className="mt-1 truncate text-center text-[10px] font-medium text-espresso">
                      {v.label}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Info, Variants, Action */}
        <div className="space-y-6 lg:col-span-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
                {product.collectionName}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  isReady
                    ? 'bg-espresso text-ivory'
                    : 'border border-brass/50 bg-brass/10 text-mahogany'
                }`}
              >
                {isReady ? 'Ready to Order' : 'Requires Inquiry Approval'}
              </span>
            </div>

            <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-espresso">
              {product.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-taupe">
              {product.subtitle}
            </p>
          </div>

          <div className="flex items-baseline gap-3 border-y border-hairline py-4">
            <span className="font-mono text-3xl font-semibold text-espresso">
              {formatMoney(price, currency)}
            </span>
            <span className="text-xs text-taupe">
              {isReady
                ? 'Shipping calculated at checkout'
                : 'Guide price · Confirmed upon inquiry approval'}
            </span>
          </div>

          {/* Finish / Option Selector */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-espresso">
              Finish / Option:{' '}
              <span className="font-normal text-mahogany">
                {activeVariant?.label}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    idx === selectedIdx
                      ? 'border-espresso bg-espresso text-ivory'
                      : 'border-hairline bg-studio text-espresso hover:border-brass'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + CTA */}
          {isReady ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-hairline bg-studio px-1 py-1">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="rounded-full p-2 text-espresso hover:bg-ivory"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-mono text-sm font-medium">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(25, q + 1))}
                  className="rounded-full p-2 text-espresso hover:bg-ivory"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => addToCart(product, activeVariant.id, qty)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition hover:bg-mahogany"
              >
                <ShoppingBag className="h-4 w-4 text-brass" />
                Add to Bag · {formatMoney(price * qty, currency)}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openInquiry(product, activeVariant?.label)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition hover:bg-mahogany"
            >
              <FileCheck2 className="h-4 w-4 text-brass" />
              Request Order Approval
            </button>
          )}

          {product.complianceNote && (
            <div className="flex items-start gap-2.5 rounded-xl border border-brass/40 bg-brass/10 p-3.5 text-xs text-espresso/85">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-mahogany" />
              <span>{product.complianceNote}</span>
            </div>
          )}

          {/* Craftsmanship Highlights */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-espresso">
              Craftsmanship &amp; Highlights
            </h2>
            <div className="grid gap-3">
              {product.highlights.map((h) => (
                <div
                  key={h.label}
                  className="rounded-xl border border-hairline bg-ivory p-3.5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-mahogany">
                    {h.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/80">
                    {h.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions & Technical Specs Section */}
      <div className="mt-14 grid gap-8 rounded-3xl border border-hairline bg-studio/60 p-6 sm:p-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 font-serif text-2xl font-semibold text-espresso">
              <Ruler className="h-5 w-5 text-brass" />
              Technical Drawing &amp; Dimensions
            </h2>
            <button
              type="button"
              onClick={() => setShowDimLightbox(true)}
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-ivory px-3 py-1 text-[11px] font-medium text-espresso hover:border-brass"
            >
              <Maximize2 className="h-3 w-3 text-brass" />
              Expand
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDimLightbox(true)}
            className="relative mt-4 block aspect-square w-full overflow-hidden rounded-2xl border border-hairline bg-studio"
          >
            <Image
              src={product.dimensionImage}
              alt={`${product.title} technical dimensions`}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain p-3"
            />
          </button>
        </div>

        <div className="flex flex-col justify-center lg:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
            Engineering Specifications
          </p>
          <h3 className="mt-1 font-serif text-3xl font-semibold text-espresso">
            Construction &amp; Weight
          </h3>

          <dl className="mt-6 divide-y divide-hairline border-y border-hairline">
            {product.specs.map((spec) => (
              <div
                key={spec.key}
                className="flex items-center justify-between py-3.5 text-sm"
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-taupe">
                  {spec.key}
                </dt>
                <dd className="font-mono text-sm font-medium text-espresso">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          {product.specNote && (
            <p className="mt-4 text-xs leading-relaxed text-taupe">
              Note: {product.specNote}
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">
                From the Same Collection
              </p>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-espresso">
                More in {product.collectionName}
              </h2>
            </div>
            <Link
              href={`/collections/${product.collectionSlug}`}
              className="text-xs font-semibold uppercase tracking-wider text-mahogany hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, idx) => (
              <ProductCard key={item.sku} product={item} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Dimension Lightbox Modal */}
      <AnimatePresence>
        {showDimLightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDimLightbox(false)}
              className="fixed inset-0 bg-espresso/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-studio p-4 shadow-2xl"
            >
              <button
                type="button"
                aria-label="Close diagram"
                onClick={() => setShowDimLightbox(false)}
                className="absolute right-3 top-3 z-20 rounded-full bg-ivory p-2 text-espresso shadow hover:bg-brass"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative aspect-square w-full">
                <Image
                  src={product.dimensionImage}
                  alt={`${product.title} technical schematic`}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
