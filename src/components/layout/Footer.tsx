'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, FileCheck2, Award } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-hairline bg-espresso text-ivory/85">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="font-serif text-2xl font-semibold text-ivory">
              PremiumLeaf
            </span>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-brass">
              premiumleaf.shop
            </p>
            <p className="mt-4 text-xs leading-relaxed text-ivory/65">
              Curated Spanish cedar humidors, precision blades, leather travel
              cases, and lounge cabinets crafted for enthusiasts across Sweden,
              Europe, and North America.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">
              Collections
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-ivory/75">
              <li>
                <Link href="/collections/humidors" className="hover:text-ivory">
                  Desktop &amp; Travel Humidors
                </Link>
              </li>
              <li>
                <Link href="/collections/cigar-cases" className="hover:text-ivory">
                  Leather &amp; Carbon Cases
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/cutters-accessories"
                  className="hover:text-ivory"
                >
                  V-Cutters &amp; Lighters
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/humidity-storage"
                  className="hover:text-ivory"
                >
                  Hygrometers &amp; 2-Way Packs
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/cigar-cabinets"
                  className="hover:text-ivory"
                >
                  Climate Cabinets (Inquiry)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">
              Company &amp; Care
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-ivory/75">
              <li>
                <Link href="/care-guide" className="hover:text-ivory">
                  Humidor Seasoning Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-ivory">
                  About PremiumLeaf
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ivory">
                  Concierge &amp; Trade Inquiries
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-ivory">
                  Terms, Privacy &amp; Age Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">
              Atelier Standards
            </h3>
            <div className="space-y-3 text-xs text-ivory/70">
              <div className="flex items-start gap-2.5">
                <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                <span>
                  Cabinets &amp; collector pieces confirmed individually via
                  sent-inquiry approval.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                <span>
                  Shipping options and delivery rates calculated at checkout.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                <span>
                  18+/21+ Cigar Accessories Only — zero tobacco leaf sold.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] text-ivory/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} PremiumLeaf (premiumleaf.shop). All
            rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <span>Sweden / EU (EUR) · USA (USD)</span>
            <Link
              href="/admin"
              className="text-ivory/40 underline-offset-4 hover:text-brass hover:underline"
            >
              Merchant Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
