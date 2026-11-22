'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Globe, Search } from 'lucide-react';
import { MAIN_CATEGORIES } from '@/data/navigation';
import { useStore } from '@/context/StoreContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { market, setMarket, cartCount, setCartOpen } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  const activeCollectionSlug = pathname?.startsWith('/collections/')
    ? pathname.replace('/collections/', '').split('/')[0]
    : null;

  const navItems = [
    { href: '/shop', label: 'Shop All', active: pathname === '/shop' },
    ...MAIN_CATEGORIES.map((cat) => ({
      href: cat.href,
      label: cat.label,
      active: activeCollectionSlug
        ? cat.subcategorySlugs.includes(activeCollectionSlug)
        : false,
    })),
    {
      href: '/care-guide',
      label: 'Care Guide',
      active: pathname === '/care-guide',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ivory/95 backdrop-blur-md">
      {/* Row 1: Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-1.5 text-espresso hover:bg-studio lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brass/50 bg-espresso text-brass transition group-hover:border-brass">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-none stroke-current"
                strokeWidth="1.6"
              >
                <path d="M12 3C7.5 6.5 5 11.2 5 16c3.8-.3 7-1.9 9.5-4.5C17 9 18 5.5 19 3c-2.5 0-4.8.4-7 0z" />
                <path d="M5 20c3-3 6.5-6 10-9" />
              </svg>
            </div>
            <div>
              <span className="block font-serif text-xl font-semibold tracking-tight text-espresso sm:text-2xl">
                PremiumLeaf
              </span>
              <span className="block text-[9px] uppercase tracking-[0.24em] text-taupe">
                Cigar Lounge &amp; Vault
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative whitespace-nowrap text-xs font-medium uppercase tracking-[0.12em] transition ${
                item.active
                  ? 'text-mahogany font-semibold'
                  : 'text-espresso/80 hover:text-espresso'
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-brass" />
              )}
            </Link>
          ))}
        </nav>

        {/* Region / Currency Toggle */}
        <div className="flex items-center gap-2">
          <Globe className="hidden h-3.5 w-3.5 text-brass sm:block" />
          <div className="inline-flex rounded-full border border-hairline bg-studio p-0.5">
            <button
              type="button"
              onClick={() => setMarket('EU')}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
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
              className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
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

      {/* Row 2: Wide Search Bar + Bag underneath Main Navigation */}
      <div className="border-t border-hairline bg-studio/70">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex flex-1 items-center"
          >
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-taupe" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cigar humidors, cases, V-cutters, SKUs (e.g. Hum-001), or finishes..."
              className="w-full rounded-full border border-hairline bg-ivory py-2 pl-10 pr-24 text-xs text-espresso outline-none transition placeholder:text-taupe/75 focus:border-brass sm:text-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 cursor-pointer rounded-full bg-espresso px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-ivory transition hover:bg-mahogany"
            >
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-espresso px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-mahogany sm:px-5"
          >
            <ShoppingBag className="h-4 w-4 text-brass" />
            <span>Bag</span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1.5 font-mono text-[11px] font-semibold text-espresso">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-hairline bg-ivory lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    item.active
                      ? 'bg-espresso text-ivory'
                      : 'text-espresso hover:bg-studio'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-taupe hover:bg-studio"
              >
                About &amp; Trade
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
