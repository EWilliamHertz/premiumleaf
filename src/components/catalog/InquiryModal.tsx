'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Send, ShieldAlert } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatMoney } from '@/lib/shipping';

export function InquiryModal() {
  const { inquiryTarget, closeInquiry, market, currency } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState(
    market === 'EU' ? 'Sweden' : 'United States'
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleClose = () => {
    setSubmittedId(null);
    setError(null);
    closeInquiry();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryTarget) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: inquiryTarget.product.sku,
          variantLabel: inquiryTarget.variantLabel,
          quantity,
          market,
          customerName,
          customerEmail,
          company,
          country,
          notes,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        inquiry?: { id: string };
      };
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not submit inquiry.');
      } else {
        setSubmittedId(data.inquiry?.id || 'INQ-CONFIRMED');
      }
    } catch {
      setError('Network error submitting inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {inquiryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-espresso/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-hairline bg-ivory p-6 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close inquiry modal"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-taupe hover:bg-studio hover:text-espresso"
            >
              <X className="h-5 w-5" />
            </button>

            {submittedId ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-brass" />
                <h3 className="mt-4 font-serif text-3xl font-semibold text-espresso">
                  Approval Request Received
                </h3>
                <p className="mt-2 text-xs text-taupe">
                  Reference:{' '}
                  <span className="font-mono font-semibold text-espresso">
                    {submittedId}
                  </span>
                </p>
                <p className="mt-3 text-sm text-espresso/80">
                  Our concierge logistics desk will verify China freight
                  routing, electrical/customs specs (where applicable), and send
                  your confirmed invoice for{' '}
                  <strong>{inquiryTarget.product.title}</strong> ({quantity}×)
                  within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 rounded-full bg-espresso px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory hover:bg-mahogany"
                >
                  Back to Store
                </button>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
                  Approval Required · {inquiryTarget.product.sku}
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-espresso">
                  Request Order Approval
                </h3>
                <p className="mt-1 text-xs text-taupe">
                  This item ships via special air/sea freight or custom
                  allocation. Submit your destination below for quick approval
                  and landed-freight confirmation.
                </p>

                <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-hairline bg-studio p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ivory">
                    <Image
                      src={inquiryTarget.product.heroImage}
                      alt={inquiryTarget.product.title}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-espresso">
                      {inquiryTarget.product.title}
                    </p>
                    <p className="text-xs text-taupe">
                      Finish: {inquiryTarget.variantLabel}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-mahogany">
                      Guide price:{' '}
                      {formatMoney(
                        currency === 'EUR'
                          ? inquiryTarget.product.priceEur
                          : inquiryTarget.product.priceUsd,
                        currency
                      )}{' '}
                      · {(inquiryTarget.product.weightGrams / 1000).toFixed(2)} kg
                    </p>
                  </div>
                </div>

                {inquiryTarget.product.complianceNote && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-brass/30 bg-brass/10 px-3 py-2 text-[11px] text-espresso/85">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mahogany" />
                    <span>{inquiryTarget.product.complianceNote}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-espresso">
                        Full Name *
                      </label>
                      <input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Erik Lindqvist"
                        className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-espresso outline-none focus:border-brass"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-espresso">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="erik@lounge.se"
                        className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-espresso outline-none focus:border-brass"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-espresso">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-full rounded-lg border border-hairline bg-white px-3 py-2 font-mono text-xs text-espresso outline-none focus:border-brass"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-[11px] font-medium text-espresso">
                        Destination Country *
                      </label>
                      <input
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Sweden / United States"
                        className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-espresso outline-none focus:border-brass"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-espresso">
                      Company / Lounge (Optional)
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Private collector or hospitality venue"
                      className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-espresso outline-none focus:border-brass"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-espresso">
                      Voltage / Delivery Notes
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify EU 220V vs US 110V (for cabinets), custom branding interest, or preferred delivery window..."
                      className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-espresso outline-none focus:border-brass"
                    />
                  </div>

                  {error && (
                    <p className="text-xs font-medium text-red-700">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition hover:bg-mahogany disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5 text-brass" />
                    {submitting ? 'Submitting...' : 'Submit Inquiry for Approval'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
