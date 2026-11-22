import React from 'react';
import Link from 'next/link';
import { Plane, ShieldAlert, Scale, PackageCheck } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        China Fulfillment &amp; Customs
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-espresso sm:text-5xl">
        Air Freight &amp; Delivery Architecture
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-taupe">
        Every PremiumLeaf parcel ships directly from our consolidated Shenzhen
        &amp; Hong Kong export hub to Sweden / EU and the United States using
        tracked international air lanes.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-studio/70 p-6">
          <Plane className="h-6 w-6 text-mahogany" />
          <h2 className="mt-3 font-serif text-2xl font-semibold text-espresso">
            Express Air Freight (4–7 Business Days)
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-taupe">
            Operated via DHL Express &amp; FedEx International Priority. Because
            the first kilogram carries a fixed export air waybill fee, combining
            items in one carton lowers per-unit freight dramatically:
          </p>
          <ul className="mt-4 space-y-2 border-t border-hairline pt-4 font-mono text-xs text-espresso">
            <li className="flex justify-between">
              <span>Small accessory (0–0.5 kg)</span>
              <span>$32 USD / €33 EUR</span>
            </li>
            <li className="flex justify-between">
              <span>1 Wooden Humidor (~2.5 kg)</span>
              <span>~$50 USD / €50 EUR</span>
            </li>
            <li className="flex justify-between">
              <span>2 Humidors Consolidated (~5.0 kg)</span>
              <span>~$65 USD / €64 EUR</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-hairline bg-studio/70 p-6">
          <Scale className="h-6 w-6 text-mahogany" />
          <h2 className="mt-3 font-serif text-2xl font-semibold text-espresso">
            Direct China Air Line — DDP (8–14 Business Days)
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-taupe">
            Operated via YunExpress / 4PX tracked special line with customs
            pre-clearance (EU IOSS &amp; US Section 321 friendly) to reduce
            unexpected local courier handling fees:
          </p>
          <ul className="mt-4 space-y-2 border-t border-hairline pt-4 font-mono text-xs text-espresso">
            <li className="flex justify-between">
              <span>Cutters / Cases (&lt; 0.45 kg)</span>
              <span>$14 USD / €16 EUR</span>
            </li>
            <li className="flex justify-between">
              <span>1 Wooden Humidor (~2.5 kg)</span>
              <span>$34 USD / €34 EUR</span>
            </li>
            <li className="flex justify-between">
              <span>Orders above $240 / €220</span>
              <span className="font-semibold text-mahogany">FREE</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-ivory p-6">
          <ShieldAlert className="h-5 w-5 text-brass" />
          <h3 className="mt-2 font-serif text-xl font-semibold text-espresso">
            Jet Lighters &amp; Air Cargo Rules
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-taupe">
            Under IATA dangerous-goods regulations, all refillable torch
            lighters and combination cutter-lighters dispatch completely empty
            without butane fuel. Fill with refined butane gas upon delivery.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-ivory p-6">
          <PackageCheck className="h-5 w-5 text-brass" />
          <h3 className="mt-2 font-serif text-xl font-semibold text-espresso">
            Climate Cabinets (Inquiry Approval)
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-taupe">
            Cabinets ranging from 5 kg to 185 kg require sent-inquiry approval so
            we can confirm regional electrical specs (EU 220V vs US 110V) and
            dedicated insured freight quotes before billing.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href="/shop"
          className="inline-flex rounded-full bg-espresso px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-mahogany"
        >
          Calculate Shipping in Bag
        </Link>
      </div>
    </div>
  );
}
