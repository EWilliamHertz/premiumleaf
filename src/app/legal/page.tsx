import React from 'react';

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        Compliance &amp; Terms
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-espresso">
        Legal, Privacy &amp; Age Policy
      </h1>
      <div className="mt-6 space-y-4 text-xs leading-relaxed text-taupe">
        <p>
          <strong className="text-espresso">Accessories Only:</strong>{' '}
          PremiumLeaf sells storage humidors, cutters, travel cases, ashtrays,
          and climate cabinets. We do not sell tobacco leaf, cigars, nicotine,
          or e-liquids.
        </p>
        <p>
          <strong className="text-espresso">Age Restriction:</strong> Storefront
          access and orders are intended for adults aged 18+ in Sweden and the
          European Union or 21+ in the United States.
        </p>
        <p>
          <strong className="text-espresso">Customs &amp; Air Freight:</strong>{' '}
          Direct Air Line DDP options pre-clear duties/VAT on eligible standard
          parcels; heavy cabinets and commercial orders require written inquiry
          approval prior to payment.
        </p>
      </div>
    </div>
  );
}
