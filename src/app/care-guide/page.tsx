import React from 'react';
import Link from 'next/link';
import { Droplets, Scissors, ThermometerSun } from 'lucide-react';

export default function CareGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        Lounge Craftsmanship &amp; Preservation
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-espresso sm:text-5xl">
        Humidor Seasoning &amp; Care Guide
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-taupe">
        Proper humidification protects wrapper oils, draw burn consistency, and
        flavor nuance. Follow these steps when unboxing a new cedar humidor.
      </p>

      <div className="mt-10 space-y-6">
        <section className="rounded-2xl border border-hairline bg-studio/70 p-6">
          <div className="flex items-center gap-2.5">
            <Droplets className="h-5 w-5 text-mahogany" />
            <h2 className="font-serif text-2xl font-semibold text-espresso">
              1. Seasoning Spanish Cedar (72 Hours)
            </h2>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-espresso/80">
            Never place dry cigars directly into an unseasoned wooden humidor—dry
            cedar absorbs moisture out of the wrappers within hours. Place an
            84% RH seasoning pack (`Hyd-003`) or a small dish of distilled water
            inside the closed humidor for 3 to 5 days until the calibrated
            hygrometer stabilizes around 68%–70% RH.
          </p>
        </section>

        <section className="rounded-2xl border border-hairline bg-studio/70 p-6">
          <div className="flex items-center gap-2.5">
            <ThermometerSun className="h-5 w-5 text-mahogany" />
            <h2 className="font-serif text-2xl font-semibold text-espresso">
              2. Choosing Two-Way RH Packs (`Hyd-003`)
            </h2>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-espresso/80">
            Use <strong>65% RH</strong> for Cuban cigars and tight ring gauges
            for a crisp draw; use <strong>69% RH</strong> for airtight acrylic
            or travel cases; and choose <strong>72% RH</strong> for traditional
            wooden boxes in dry Nordic winter heating climates.
          </p>
        </section>

        <section className="rounded-2xl border border-hairline bg-studio/70 p-6">
          <div className="flex items-center gap-2.5">
            <Scissors className="h-5 w-5 text-mahogany" />
            <h2 className="font-serif text-2xl font-semibold text-espresso">
              3. Straight Guillotine vs. Deep V-Cut
            </h2>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-espresso/80">
            A double-blade guillotine (`Cut-006`, `Cut-014`) delivers maximum
            airflow across torpedo or parejo heads. A spring-loaded V-cutter
            (`Cut-012`) preserves shoulder integrity and concentrates the draw
            without risk of unraveling the cap.
          </p>
        </section>
      </div>

      <div className="mt-10">
        <Link
          href="/collections/humidity-storage"
          className="inline-flex rounded-full bg-espresso px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-mahogany"
        >
          Shop Hygrometers &amp; RH Packs
        </Link>
      </div>
    </div>
  );
}
