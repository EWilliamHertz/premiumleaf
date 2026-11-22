'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Lock,
  Plane,
  Package,
  ArrowLeft,
  Scale,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatMoney } from '@/lib/shipping';
import type { OrderRecord } from '@/types/catalog';

const EU_COUNTRIES = [
  'Sweden',
  'Denmark',
  'Norway',
  'Finland',
  'Germany',
  'Netherlands',
  'France',
  'Spain',
  'Italy',
  'United Kingdom',
];

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const stripeSuccess = searchParams.get('success') === '1';
  const stripeOrderParam = searchParams.get('order');

  const {
    market,
    currency,
    setMarket,
    cart,
    cartSubtotal,
    shippingMethodId,
    setShippingMethodId,
    shippingEstimate,
    clearCart,
  } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState(
    market === 'EU' ? 'Sweden' : 'United States'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(
    null
  );

  const selectedShipping =
    shippingEstimate.options.find((o) => o.id === shippingMethodId) ||
    shippingEstimate.options[0];
  const shippingCost = selectedShipping ? selectedShipping.cost : 0;
  const total = cartSubtotal + shippingCost;

  const switchMarket = (m: 'EU' | 'US') => {
    setMarket(m);
    setCountry(m === 'EU' ? 'Sweden' : 'United States');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market,
          shippingMethodId: selectedShipping?.id || 'direct-air',
          items: cart.map((item) => ({
            sku: item.sku,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
          })),
          customer: {
            name,
            email,
            address,
            city,
            postalCode,
            country,
          },
        }),
      });

      const data = (await res.json()) as {
        mode?: 'stripe' | 'simulated';
        checkoutUrl?: string;
        order?: OrderRecord;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error || 'Checkout failed.');
      } else if (data.mode === 'stripe' && data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
      } else if (data.order) {
        clearCart();
        setCompletedOrder(data.order);
      }
    } catch {
      setError('Network error communicating with checkout server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (stripeSuccess || completedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-hairline bg-studio/70 p-8 sm:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-brass" />
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-mahogany">
            Order Logged · {completedOrder?.id || stripeOrderParam || 'CONFIRMED'}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-espresso">
            Thank You for Your Order
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-taupe">
            {completedOrder?.paymentMode === 'simulated'
              ? 'Stripe keys are not active yet in .env.local, so this order was recorded cleanly in Checkout Preview Mode (/admin -> Orders). Add STRIPE_SECRET_KEY to enable live card redirects.'
              : 'Your payment session completed and your parcel dispatch record has been queued for Shenzhen air consolidation.'}
          </p>

          {completedOrder && (
            <div className="mt-6 rounded-2xl border border-hairline bg-ivory p-5 text-left text-xs">
              <div className="flex justify-between border-b border-hairline pb-2.5">
                <span className="text-taupe">Air Method</span>
                <span className="font-semibold text-espresso">
                  {completedOrder.shippingMethodName} (
                  {completedOrder.chargeableWeightKg} kg)
                </span>
              </div>
              <div className="flex justify-between border-b border-hairline py-2.5">
                <span className="text-taupe">Destination</span>
                <span className="text-espresso">
                  {completedOrder.customer.city},{' '}
                  {completedOrder.customer.country}
                </span>
              </div>
              <div className="flex justify-between pt-2.5 text-sm font-semibold text-espresso">
                <span>Total</span>
                <span className="font-mono">
                  {formatMoney(completedOrder.total, completedOrder.currency)}
                </span>
              </div>
            </div>
          )}

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-espresso px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory hover:bg-mahogany"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <Package className="mx-auto h-12 w-12 text-brass" />
        <h1 className="mt-4 font-serif text-3xl font-semibold text-espresso">
          Your Parcel Is Empty
        </h1>
        <p className="mt-2 text-sm text-taupe">
          Add ready-to-order humidors, cases, or cutters to calculate
          consolidated China air shipping.
        </p>
        <Link
          href="/shop?mode=ready"
          className="mt-6 inline-flex rounded-full bg-espresso px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory"
        >
          Explore Ready Accessories
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-taupe hover:text-espresso"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return to Shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left: Shipping Address & Air Method */}
        <form
          onSubmit={handlePlaceOrder}
          className="space-y-6 lg:col-span-7"
        >
          <div className="rounded-3xl border border-hairline bg-ivory p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-espresso">
                  Air Freight Checkout
                </h1>
                <p className="text-xs text-taupe">
                  Consolidated China dispatch to Sweden/EU or United States
                </p>
              </div>
              <div className="inline-flex rounded-full border border-hairline bg-studio p-1">
                <button
                  type="button"
                  onClick={() => switchMarket('EU')}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    market === 'EU'
                      ? 'bg-espresso text-ivory'
                      : 'text-taupe hover:text-espresso'
                  }`}
                >
                  Sweden / EU (€)
                </button>
                <button
                  type="button"
                  onClick={() => switchMarket('US')}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    market === 'US'
                      ? 'bg-espresso text-ivory'
                      : 'text-taupe hover:text-espresso'
                  }`}
                >
                  USA ($)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-espresso">
                  Full Name *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Johan Andersson"
                  className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-espresso">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johan@example.se"
                  className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-brass"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-espresso">
                  Street Address *
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Strandvägen 14"
                  className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-espresso">
                  City *
                </label>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={market === 'EU' ? 'Stockholm' : 'Austin, TX'}
                  className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-espresso">
                  Postal / ZIP Code *
                </label>
                <input
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={market === 'EU' ? '114 56' : '78701'}
                  className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-brass"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-espresso">
                  Destination Country *
                </label>
                {market === 'EU' ? (
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-brass"
                  >
                    {EU_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-espresso outline-none focus:border-brass"
                  />
                )}
              </div>
            </div>
          </div>

          {/* China Air Freight Alternative Selector */}
          <div className="rounded-3xl border border-hairline bg-studio/70 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 font-serif text-2xl font-semibold text-espresso">
                <Plane className="h-5 w-5 text-brass" />
                China Air Freight Method
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-ivory px-3 py-1 font-mono text-[11px] text-taupe">
                <Scale className="h-3 w-3 text-brass" />
                Gross {shippingEstimate.actualBoxedKg} kg · Vol{' '}
                {shippingEstimate.volumetricKg} kg →{' '}
                <strong className="text-espresso">
                  {shippingEstimate.chargeableKg} kg
                </strong>
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {shippingEstimate.options.map((opt) => {
                const selected = opt.id === selectedShipping?.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setShippingMethodId(opt.id)}
                    className={`flex w-full items-start justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? 'border-espresso bg-ivory shadow-sm'
                        : 'border-hairline bg-ivory/60 hover:border-brass'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3.5 w-3.5 rounded-full border ${
                            selected
                              ? 'border-4 border-espresso bg-brass'
                              : 'border-taupe'
                          }`}
                        />
                        <p className="text-sm font-semibold text-espresso">
                          {opt.name}
                        </p>
                      </div>
                      <p className="mt-1 pl-5 text-xs font-medium text-mahogany">
                        {opt.carrier} · {opt.eta}
                      </p>
                      <p className="mt-1 pl-5 text-xs leading-relaxed text-taupe">
                        {opt.description}
                      </p>
                    </div>

                    <span className="shrink-0 font-mono text-base font-semibold text-espresso">
                      {opt.isFree ? 'FREE' : formatMoney(opt.cost, currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-mahogany disabled:opacity-60"
          >
            <Lock className="h-4 w-4 text-brass" />
            {submitting
              ? 'Preparing Air Dispatch...'
              : `Complete Order · ${formatMoney(total, currency)}`}
          </button>
        </form>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-hairline bg-studio/70 p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-espresso">
              Parcel Summary
            </h2>

            <div className="mt-5 divide-y divide-hairline">
              {cart.map((item) => {
                const price = currency === 'EUR' ? item.priceEur : item.priceUsd;
                return (
                  <div
                    key={`${item.sku}-${item.variantId}`}
                    className="flex items-center gap-3.5 py-3.5"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ivory">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] text-taupe">
                        {item.sku} × {item.quantity}
                      </p>
                      <p className="truncate text-sm font-medium text-espresso">
                        {item.title}
                      </p>
                      <p className="text-xs text-taupe">{item.variantLabel}</p>
                    </div>
                    <span className="font-mono text-sm font-medium text-espresso">
                      {formatMoney(price * item.quantity, currency)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-hairline pt-4 text-xs">
              <div className="flex justify-between text-taupe">
                <span>Subtotal</span>
                <span className="font-mono text-espresso">
                  {formatMoney(cartSubtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>{selectedShipping?.name}</span>
                <span className="font-mono text-espresso">
                  {shippingCost === 0
                    ? 'FREE'
                    : formatMoney(shippingCost, currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-hairline pt-3 text-base font-semibold text-espresso">
                <span>Total ({currency})</span>
                <span className="font-mono">{formatMoney(total, currency)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
