'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, FileCheck2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatMoney } from '@/lib/shipping';
import type { PublicProduct } from '@/types/catalog';

export function ProductCard({
  product,
}: {
  product: PublicProduct;
  index?: number;
}) {
  const { currency, addToCart, openInquiry } = useStore();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeVariant = product.variants[selectedIdx] || product.variants[0];
  const price = currency === 'EUR' ? product.priceEur : product.priceUsd;
  const isReady = product.status === 'ready';

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-ivory transition hover:border-brass/60 hover:shadow-lg"
    >
      {/* Studio Image Canvas (#F0EFEA seamlessly matches extracted photography) */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-studio"
      >
        <Image
          src={activeVariant?.image || product.heroImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
        />

        {/* Top badges */}
        <div className="pointer-events-none absolute left-3 top-3 right-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-ivory/90 px-2.5 py-0.5 font-mono text-[10px] font-medium text-espresso shadow-2xs backdrop-blur-xs">
            {product.sku}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              isReady
                ? 'bg-espresso text-ivory'
                : 'border border-brass/50 bg-ivory/95 text-mahogany'
            }`}
          >
            {isReady ? 'Ready to Order' : 'Inquiry Approval'}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-taupe">
            {product.collectionName}
          </p>
          <span className="font-mono text-[10px] text-taupe">
            {product.weightGrams >= 1000
              ? `${(product.weightGrams / 1000).toFixed(1)} kg`
              : `${product.weightGrams} g`}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-1 font-serif text-xl font-semibold leading-snug text-espresso transition group-hover:text-mahogany"
        >
          {product.title}
        </Link>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-taupe">
          {product.subtitle}
        </p>

        {/* Variant Switcher Strip */}
        {product.variants.length > 1 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {product.variants.slice(0, 6).map((v, idx) => (
              <button
                key={v.id}
                type="button"
                title={v.label}
                onClick={() => setSelectedIdx(idx)}
                className={`cursor-pointer rounded-md border px-1.5 py-0.5 text-[10px] transition ${
                  idx === selectedIdx
                    ? 'border-espresso bg-espresso text-ivory'
                    : 'border-hairline bg-studio text-espresso/75 hover:border-brass'
                }`}
              >
                {v.label.length > 14 ? `${v.label.slice(0, 12)}…` : v.label}
              </button>
            ))}
            {product.variants.length > 6 && (
              <span className="text-[10px] text-taupe">
                +{product.variants.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Price + Action */}
        <div className="mt-auto flex items-center justify-between border-t border-hairline pt-3.5 mt-4">
          <div>
            <span className="font-mono text-lg font-semibold text-espresso">
              {formatMoney(price, currency)}
            </span>
            {!isReady && (
              <span className="ml-1.5 text-[10px] text-taupe">
                guide price
              </span>
            )}
          </div>

          {isReady ? (
            <button
              type="button"
              onClick={() => addToCart(product, activeVariant.id, 1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-espresso px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-ivory transition hover:bg-mahogany"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-brass" />
              Add
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openInquiry(product, activeVariant?.label)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-espresso px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-espresso transition hover:bg-espresso hover:text-ivory"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-brass" />
              Inquire
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
