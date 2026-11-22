import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        Concierge &amp; Inquiries
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-espresso sm:text-5xl">
        Contact PremiumLeaf
      </h1>
      <p className="mt-3 text-sm text-taupe">
        Need approval on a climate cabinet, custom corporate gift order, or EU
        vs US freight consolidation? Open any inquiry-marked product and submit
        an Approval Request, or reach us directly:
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-hairline bg-studio/70 p-6 text-sm">
        <div className="flex justify-between border-b border-hairline pb-3">
          <span className="text-taupe">Storefront</span>
          <span className="font-mono font-medium text-espresso">
            premiumleaf.shop
          </span>
        </div>
        <div className="flex justify-between border-b border-hairline pb-3">
          <span className="text-taupe">Concierge Email</span>
          <span className="font-mono font-medium text-espresso">
            concierge@premiumleaf.shop
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-taupe">Regions Served</span>
          <span className="font-medium text-espresso">
            Sweden &amp; EU (EUR €) · United States (USD $)
          </span>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/shop?mode=inquiry"
          className="inline-flex rounded-full bg-espresso px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-mahogany"
        >
          Browse Inquiry-Approval Pieces
        </Link>
      </div>
    </div>
  );
}
