import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        About premiumleaf.shop
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-espresso sm:text-5xl">
        Built for Cigar Ritual Across Europe &amp; North America
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-taupe">
        <p>
          PremiumLeaf curates functional, design-led cigar accessories—from
          cedar-lined desktop humidors and travel cases to precision V-cutters,
          digital hygrometers, and climate-controlled lounge cabinets.
        </p>
        <p>
          By partnering directly with specialist manufacturing workshops in
          China, we dispatch parcel-ready accessories worldwide via tracked
          YunExpress DDP and DHL/FedEx Express air freight, while coordinating
          individual approvals and voltage customization for architectural
          cabinets.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-espresso px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-mahogany"
        >
          Explore the Collection
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-espresso px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-espresso hover:bg-studio"
        >
          Trade &amp; Lounge Concierge
        </Link>
      </div>
    </div>
  );
}
