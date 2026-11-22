'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatMoney } from '@/lib/shipping';

export function CartDrawer() {
  const {
    market,
    currency,
    setMarket,
    cart,
    cartSubtotal,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
  } = useStore();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-espresso/55 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-espresso">
                  Your Bag
                </h2>
                <p className="text-xs text-taupe">
                  {market === 'EU' ? 'Sweden / EU (EUR €)' : 'United States (USD $)'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close bag"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-espresso/70 hover:bg-studio hover:text-espresso"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Region toggle */}
            <div className="border-b border-hairline bg-studio/70 px-5 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-taupe">Region &amp; Currency</span>
                <div className="inline-flex rounded-full border border-hairline bg-ivory p-0.5">
                  <button
                    type="button"
                    onClick={() => setMarket('EU')}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                      market === 'EU'
                        ? 'bg-espresso text-ivory'
                        : 'text-taupe hover:text-espresso'
                    }`}
                  >
                    SE / EU (€)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarket('US')}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                      market === 'US'
                        ? 'bg-espresso text-ivory'
                        : 'text-taupe hover:text-espresso'
                    }`}
                  >
                    USA ($)
                  </button>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Package className="h-10 w-10 text-brass/70" />
                  <p className="mt-3 font-serif text-xl text-espresso">
                    Your bag is empty
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-taupe">
                    Browse our ready-to-order humidors, cutters, and cases, or
                    request approval on climate cabinets.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setCartOpen(false)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-xs font-medium text-ivory hover:bg-mahogany"
                  >
                    Explore Accessories
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const unitPrice =
                      currency === 'EUR' ? item.priceEur : item.priceUsd;
                    return (
                      <div
                        key={`${item.sku}-${item.variantId}`}
                        className="flex gap-3.5 border-b border-hairline pb-4"
                      >
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-studio"
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-contain p-1"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-mono text-[10px] uppercase text-taupe">
                                {item.sku}
                              </p>
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={() => setCartOpen(false)}
                                className="line-clamp-1 text-sm font-medium text-espresso hover:text-mahogany"
                              >
                                {item.title}
                              </Link>
                              <p className="text-xs text-taupe">
                                {item.variantLabel}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label="Remove item"
                              onClick={() =>
                                removeFromCart(item.sku, item.variantId)
                              }
                              className="text-taupe hover:text-mahogany"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-full border border-hairline bg-studio">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  updateQuantity(
                                    item.sku,
                                    item.variantId,
                                    item.quantity - 1
                                  )
                                }
                                className="px-2 py-1 text-espresso/75 hover:text-espresso"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 font-mono text-xs text-espresso">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  updateQuantity(
                                    item.sku,
                                    item.variantId,
                                    item.quantity + 1
                                  )
                                }
                                className="px-2 py-1 text-espresso/75 hover:text-espresso"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <span className="font-mono text-sm font-medium text-espresso">
                              {formatMoney(unitPrice * item.quantity, currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-hairline bg-ivory px-5 py-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-taupe">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-espresso">
                      {formatMoney(cartSubtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-taupe">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition hover:bg-mahogany"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 text-brass" />
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
