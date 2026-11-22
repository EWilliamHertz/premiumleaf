'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FileCheck2,
  Sparkles,
  Ruler,
  Layers,
  Award,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatMoney } from '@/lib/shipping';
import { ProductCard } from '@/components/catalog/ProductCard';
import { getMainCategoryForCollection } from '@/data/navigation';
import type { CollectionMeta, PublicProduct } from '@/types/catalog';

interface HomeClientProps {
  featuredReady: PublicProduct[];
  featuredCabinets: PublicProduct[];
  collections: CollectionMeta[];
  readyCount: number;
  inquiryCount: number;
}

export function HomeClient({
  featuredReady,
  featuredCabinets,
  collections,
  readyCount,
  inquiryCount,
}: HomeClientProps) {
  const { market, currency } = useStore();

  const heroPreview = featuredReady.slice(0, 3);

  return (
    <div>
      {/* Editorial Hero */}
      <section className="relative overflow-hidden bg-espresso text-ivory">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,141,68,0.18),transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-24">
          <motion.div
            initial={false}
            className="space-y-6 lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-white/5 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
              <Sparkles className="h-3.5 w-3.5" />
              Curated Cigar Craftsmanship · Launching June
            </div>

            <h1 className="font-serif text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">
              Spanish Cedar, Brushed Steel &amp;{' '}
              <span className="italic text-brass">Precision Ritual.</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-ivory/75 sm:text-base">
              {readyCount} ready-to-order humidors, travel cases, V-cutters,
              hygrometers, and wood ashtrays priced in{' '}
              <strong className="text-ivory">
                {market === 'EU' ? 'EUR (€) for Sweden & Europe' : 'USD ($) for the United States'}
              </strong>
              —plus {inquiryCount} climate cabinets and bespoke editions
              available by sent-inquiry approval.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/shop?mode=ready"
                className="inline-flex items-center gap-2 rounded-full bg-brass px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-espresso transition hover:bg-brass-light"
              >
                Shop Ready Accessories ({readyCount})
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/collections/cigar-cabinets"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition hover:border-brass hover:text-brass"
              >
                <FileCheck2 className="h-4 w-4 text-brass" />
                Inquire Cabinets
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs">
              <div>
                <p className="font-mono text-lg font-semibold text-brass">
                  {readyCount} SKUs
                </p>
                <p className="text-ivory/65">
                  Ready for immediate order
                </p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-ivory">
                  {inquiryCount} SKUs
                </p>
                <p className="text-ivory/65">
                  Approval &amp; custom cabinets
                </p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-ivory">
                  10 Series
                </p>
                <p className="text-ivory/65">
                  Full blueprints &amp; specs
                </p>
              </div>
            </div>
          </motion.div>

          {/* Studio Photo Trio */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            {heroPreview.map((item, idx) => (
              <motion.div
                key={item.sku}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={idx === 0 ? 'col-span-2' : 'col-span-1'}
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-brass/25 bg-studio p-4 transition hover:border-brass"
                >
                  <div className="z-10 max-w-[55%]">
                    <span className="font-mono text-[10px] uppercase text-mahogany">
                      {item.sku}
                    </span>
                    <h2 className="mt-0.5 font-serif text-xl font-semibold text-espresso sm:text-2xl">
                      {item.title}
                    </h2>
                    <p className="mt-1 font-mono text-sm font-semibold text-espresso">
                      {formatMoney(
                        currency === 'EUR' ? item.priceEur : item.priceUsd,
                        currency
                      )}
                    </p>
                  </div>
                  <div
                    className={`relative shrink-0 ${
                      idx === 0 ? 'h-40 w-44 sm:h-48 sm:w-52' : 'h-28 w-28'
                    }`}
                  >
                    <Image
                      src={item.heroImage}
                      alt={item.title}
                      fill
                      priority
                      className="object-contain transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship & Materials Strip */}
      <section className="border-b border-hairline bg-studio">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-5 w-5 shrink-0 text-mahogany" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-espresso">
                Cedar, Leather &amp; Brushed Metal
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-taupe">
                Every desktop humidor, slide case, and ash vessel is selected
                for material finish, seal integrity, and balanced hand feel.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-mahogany" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-espresso">
                Verified Dimension Schematics
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-taupe">
                Inspect exact millimeter dimensions, net weights, and technical
                drawings on every product sheet before ordering.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-mahogany" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-espresso">
                Concierge Cabinet Approval
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-taupe">
                Climate cabinets and specialty collector pieces are confirmed
                individually via sent inquiry prior to dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready-to-Order Featured Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
              Ready to Order
            </p>
            <h2 className="mt-1 font-serif text-4xl font-semibold text-espresso">
              Curated Essential Accessories
            </h2>
          </div>
          <Link
            href="/shop?mode=ready"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-mahogany hover:underline"
          >
            Browse All {readyCount} Ready SKUs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredReady.map((prod, idx) => (
            <ProductCard key={prod.sku} product={prod} index={idx} />
          ))}
        </div>
      </section>

      {/* 10 Collections Grid */}
      <section className="border-y border-hairline bg-studio/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
              Complete Range
            </p>
            <h2 className="mt-1 font-serif text-4xl font-semibold text-espresso">
              Explore by Collection
            </h2>
            <p className="mt-2 text-sm text-taupe">
              Every piece includes verified specifications, finish photography,
              and engineering dimension drawings.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {collections.map((col) => {
              const parentCat = getMainCategoryForCollection(col.slug);
              return (
                <motion.div
                  key={col.slug}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/collections/${col.slug}`}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-hairline bg-ivory p-5 transition hover:border-brass hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-[10px] uppercase tracking-wider text-brass">
                          {parentCat ? parentCat.label : `${col.prefix}-Series`}
                        </span>
                        <span className="shrink-0 rounded-full bg-studio px-2 py-0.5 font-mono text-[10px] text-espresso">
                          {col.count}
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-xl font-semibold text-espresso group-hover:text-mahogany">
                        {col.name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-taupe">
                        {col.tagline}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-mahogany">
                      Explore
                      <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cigar Cabinets — Inquiry Approval Showcase */}
      {featuredCabinets.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
                By Approval
              </p>
              <h2 className="mt-1 font-serif text-4xl font-semibold text-espresso">
                Climate Cigar Cabinets
              </h2>
              <p className="mt-1 max-w-xl text-sm text-taupe">
                Full-height and dual-door cedar cabinets (up to 185 kg) require
                sent-inquiry approval to confirm electrical configuration (220V
                EU / 110V US) and delivery scheduling.
              </p>
            </div>
            <Link
              href="/collections/cigar-cabinets"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-mahogany hover:underline"
            >
              View All Cabinets
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featuredCabinets.map((cab, idx) => (
              <ProductCard key={cab.sku} product={cab} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
