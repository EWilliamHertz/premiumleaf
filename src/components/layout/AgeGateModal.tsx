'use client';

import React, { useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const AGE_GATE_KEY = 'premiumleaf_age_verified_v1';
const AGE_EVENT = 'premiumleaf-age-change';

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(AGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(AGE_EVENT, callback);
  };
}

function getClientVerified(): boolean {
  try {
    return Boolean(localStorage.getItem(AGE_GATE_KEY));
  } catch {
    return true;
  }
}

export function AgeGateModal() {
  const verified = useSyncExternalStore(
    subscribe,
    getClientVerified,
    () => true
  );
  const open = !verified;

  const confirmAge = () => {
    try {
      localStorage.setItem(AGE_GATE_KEY, '1');
      window.dispatchEvent(new Event(AGE_EVENT));
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/85 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-brass/40 bg-espresso p-7 text-center text-ivory shadow-2xl"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brass/50 bg-mahogany/40 text-brass">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-brass">
              PremiumLeaf · Age Verification
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-ivory">
              Adult Lounge Accessories
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-ivory/75">
              PremiumLeaf supplies cigar humidors, cutters, cases, and lounge
              craftsmanship accessories (no tobacco leaf is sold). By entering
              you confirm you are at least 18 years old in Sweden/EU or 21 in
              the United States.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={confirmAge}
                className="flex-1 rounded-full bg-brass px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-espresso transition hover:bg-brass-light"
              >
                I Confirm (18+ / 21+)
              </button>
              <a
                href="https://www.google.com"
                className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-medium text-ivory/75 transition hover:border-white/40 hover:text-ivory"
              >
                Leave Site
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
