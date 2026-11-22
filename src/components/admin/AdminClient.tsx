'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  LogOut,
  Save,
  Search,
  CheckCircle2,
  Package,
  FileCheck2,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import type { SupplierRefRow } from '@/lib/catalog-server';
import { calculateAirShipping } from '@/lib/shipping';
import type {
  CatalogOverride,
  CollectionMeta,
  InquiryRecord,
  OrderRecord,
  Product,
  ProductStatus,
} from '@/types/catalog';

interface AdminClientProps {
  initialAuthenticated: boolean;
  initialProducts: Product[];
  initialSupplierMap: Record<string, SupplierRefRow>;
  initialInquiries: InquiryRecord[];
  initialOrders: OrderRecord[];
  collections: CollectionMeta[];
}

export function AdminClient({
  initialAuthenticated,
  initialProducts,
  initialSupplierMap,
  initialInquiries,
  initialOrders,
  collections,
}: AdminClientProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [supplierMap, setSupplierMap] = useState(initialSupplierMap);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(initialInquiries);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);

  const [tab, setTab] = useState<'pricing' | 'inquiries' | 'orders'>('pricing');
  const [search, setSearch] = useState('');
  const [colFilter, setColFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [autoSyncEur, setAutoSyncEur] = useState(true);

  const [dirtyMap, setDirtyMap] = useState<Record<string, CatalogOverride>>({});
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const loadAdminData = async () => {
    const res = await fetch('/api/admin/products');
    if (res.ok) {
      const data = (await res.json()) as {
        products: Product[];
        supplierMap: Record<string, SupplierRefRow>;
        inquiries: InquiryRecord[];
        orders: OrderRecord[];
      };
      setProducts(data.products);
      setSupplierMap(data.supplierMap);
      setInquiries(data.inquiries);
      setOrders(data.orders);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setLoginError(d.error || 'Incorrect password.');
      } else {
        setAuthenticated(true);
        setPassword('');
        await loadAdminData();
      }
    } catch {
      setLoginError('Network error authenticating.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setProducts([]);
  };

  const patchProductLocal = (sku: string, patch: CatalogOverride) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku !== sku) return p;
        return {
          ...p,
          priceUsd: patch.priceUsd ?? p.priceUsd,
          priceEur: patch.priceEur ?? p.priceEur,
          estimatedCostUsd: patch.estimatedCostUsd ?? p.estimatedCostUsd,
          status: patch.status ?? p.status,
          featured: patch.featured ?? p.featured,
        };
      })
    );
    setDirtyMap((prev) => ({
      ...prev,
      [sku]: {
        ...(prev[sku] || {}),
        ...patch,
      },
    }));
  };

  const handleSaveChanges = async () => {
    const keys = Object.keys(dirtyMap);
    if (keys.length === 0) return;
    setSaving(true);
    setSaveToast(null);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: dirtyMap }),
      });
      if (res.ok) {
        const data = (await res.json()) as { products: Product[] };
        setProducts(data.products);
        setDirtyMap({});
        setSaveToast(
          `Saved ${keys.length} SKU update${keys.length === 1 ? '' : 's'} — storefront updated live.`
        );
      } else {
        setSaveToast('Error saving updates.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInquiryAction = async (
    id: string,
    status: 'approved' | 'declined',
    quotedPriceUsd?: number
  ) => {
    const res = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inquiryUpdate: { id, status, quotedPriceUsd },
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { inquiry: InquiryRecord };
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? data.inquiry : item))
      );
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (colFilter !== 'all' && p.collectionSlug !== colFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      const sup = supplierMap[p.sku];
      return (
        p.sku.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.collectionName.toLowerCase().includes(q) ||
        (sup && `p${sup.pdf_page}`.includes(q))
      );
    });
  }, [products, search, colFilter, statusFilter, supplierMap]);

  const stats = useMemo(() => {
    const ready = products.filter((p) => p.status === 'ready').length;
    const inquiry = products.filter((p) => p.status === 'inquiry').length;
    const avgMargin =
      products.length > 0
        ? products.reduce((sum, p) => {
            if (p.priceUsd <= 0) return sum;
            return sum + ((p.priceUsd - p.estimatedCostUsd) / p.priceUsd) * 100;
          }, 0) / products.length
        : 0;
    const pendingInquiries = inquiries.filter(
      (i) => i.status === 'pending'
    ).length;
    return {
      ready,
      inquiry,
      avgMargin: Math.round(avgMargin),
      pendingInquiries,
      ordersCount: orders.length,
    };
  }, [products, inquiries, orders]);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-espresso px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-brass/30 bg-ivory p-8 shadow-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-taupe hover:text-espresso"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Storefront
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-espresso text-brass">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
                premiumleaf.shop
              </p>
              <h1 className="font-serif text-3xl font-semibold text-espresso">
                Merchant Admin
              </h1>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-taupe">
            Enter your `.env.local` merchant password to manage retail USD/EUR
            pricings, SKU ready-vs-inquiry statuses, Chartogi supplier
            mappings, and customer approvals.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-espresso">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-hairline bg-white px-4 py-3 font-mono text-sm text-espresso outline-none focus:border-brass"
              />
            </div>

            {loginError && (
              <p className="text-xs font-medium text-red-700">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-full bg-espresso py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-mahogany disabled:opacity-60"
            >
              {loggingIn ? 'Verifying...' : 'Unlock Operations Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const dirtyCount = Object.keys(dirtyMap).length;

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-espresso text-ivory">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs text-ivory/80 hover:border-brass hover:text-ivory"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Storefront
            </Link>
            <div>
              <span className="font-serif text-xl font-semibold">
                PremiumLeaf Admin
              </span>
              <span className="ml-2 rounded-full bg-brass/20 px-2 py-0.5 font-mono text-[10px] text-brass">
                116 SKUs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dirtyCount > 0 && (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-brass px-4 py-2 text-xs font-semibold uppercase tracking-wider text-espresso transition hover:bg-brass-light"
              >
                <Save className="h-3.5 w-3.5" />
                {saving
                  ? 'Saving...'
                  : `Save Changes (${dirtyCount})`}
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-xs text-ivory/80 hover:border-red-400 hover:text-ivory"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-hairline bg-studio/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-taupe">
              Ready-to-Order SKUs
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-espresso">
              {stats.ready}
            </p>
            <p className="mt-0.5 text-[11px] text-taupe">
              Target launch parcel assortment: 40–60
            </p>
          </div>
          <div className="rounded-2xl border border-hairline bg-studio/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-taupe">
              Inquiry-Approval SKUs
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-mahogany">
              {stats.inquiry}
            </p>
            <p className="mt-0.5 text-[11px] text-taupe">
              Cabinets &amp; approval-gated pieces
            </p>
          </div>
          <div className="rounded-2xl border border-hairline bg-studio/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-taupe">
              Avg Gross Margin (ex-freight)
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-3xl font-semibold text-espresso">
              {stats.avgMargin}%
              <TrendingUp className="h-5 w-5 text-brass" />
            </p>
            <p className="mt-0.5 text-[11px] text-taupe">
              Based on Est. China EXW vs Retail USD
            </p>
          </div>
          <div className="rounded-2xl border border-hairline bg-studio/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-taupe">
              Pending Inquiries / Orders
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-espresso">
              {stats.pendingInquiries}{' '}
              <span className="text-base font-normal text-taupe">
                / {stats.ordersCount} orders
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-taupe">
              Stored in data/inquiries.json &amp; orders.json
            </p>
          </div>
        </div>

        {saveToast && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-brass/50 bg-brass/15 px-4 py-3 text-xs font-medium text-espresso">
            <CheckCircle2 className="h-4 w-4 text-mahogany" />
            {saveToast}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('pricing')}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                tab === 'pricing'
                  ? 'bg-espresso text-ivory'
                  : 'bg-studio text-espresso hover:bg-hairline'
              }`}
            >
              SKU Pricing &amp; Status ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('inquiries')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                tab === 'inquiries'
                  ? 'bg-espresso text-ivory'
                  : 'bg-studio text-espresso hover:bg-hairline'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5 text-brass" />
              Inquiries ({inquiries.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('orders')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                tab === 'orders'
                  ? 'bg-espresso text-ivory'
                  : 'bg-studio text-espresso hover:bg-hairline'
              }`}
            >
              <Package className="h-3.5 w-3.5 text-brass" />
              Orders ({orders.length})
            </button>
          </div>

          <button
            type="button"
            onClick={loadAdminData}
            className="inline-flex items-center gap-1.5 text-xs text-taupe hover:text-espresso"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Data
          </button>
        </div>

        {/* TAB 1: Pricing & SKU Management */}
        {tab === 'pricing' && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-studio/70 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter SKU (Hum-001), product name, or PDF page (p8)..."
                  className="w-full rounded-full border border-hairline bg-ivory py-2 pl-10 pr-4 text-xs text-espresso outline-none focus:border-brass"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <select
                  value={colFilter}
                  onChange={(e) => setColFilter(e.target.value)}
                  className="rounded-full border border-hairline bg-ivory px-3 py-2 text-xs text-espresso outline-none"
                >
                  <option value="all">All Collections</option>
                  {collections.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.prefix})
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'all' | ProductStatus)
                  }
                  className="rounded-full border border-hairline bg-ivory px-3 py-2 text-xs text-espresso outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="ready">Ready to Order</option>
                  <option value="inquiry">Inquiry Approval</option>
                  <option value="hidden">Hidden</option>
                </select>

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline bg-ivory px-3 py-2">
                  <input
                    type="checkbox"
                    checked={autoSyncEur}
                    onChange={(e) => setAutoSyncEur(e.target.checked)}
                    className="accent-espresso"
                  />
                  <span>Auto-sync EUR (0.92×)</span>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-hairline bg-ivory">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-studio text-[10px] font-semibold uppercase tracking-wider text-taupe">
                  <tr>
                    <th className="px-4 py-3">SKU &amp; Product</th>
                    <th className="px-3 py-3">Chartogi Ref</th>
                    <th className="px-3 py-3">Order Mode</th>
                    <th className="px-3 py-3">Est. EXW ($)</th>
                    <th className="px-3 py-3">Retail USD ($)</th>
                    <th className="px-3 py-3">Retail EUR (€)</th>
                    <th className="px-3 py-3">Margin</th>
                    <th className="px-3 py-3">1pc Express Air</th>
                    <th className="px-3 py-3 text-center">Featured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredProducts.map((p) => {
                    const sup = supplierMap[p.sku];
                    const marginPct =
                      p.priceUsd > 0
                        ? Math.round(
                            ((p.priceUsd - p.estimatedCostUsd) / p.priceUsd) * 100
                          )
                        : 0;
                    const shipEst = calculateAirShipping(
                      [
                        {
                          weightGrams: p.weightGrams,
                          dimensionsMm: p.dimensionsMm,
                          quantity: 1,
                          priceUsd: p.priceUsd,
                          priceEur: p.priceEur,
                        },
                      ],
                      'US'
                    );
                    const express1pc = shipEst.options[1]?.cost ?? 0;
                    const isDirty = Boolean(dirtyMap[p.sku]);

                    return (
                      <tr
                        key={p.sku}
                        className={isDirty ? 'bg-brass/10' : 'hover:bg-studio/40'}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-studio">
                              <Image
                                src={p.heroImage}
                                alt={p.title}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-mono text-[11px] font-semibold text-mahogany">
                                {p.sku}
                              </span>
                              <p className="max-w-[210px] truncate font-medium text-espresso">
                                {p.title}
                              </p>
                              <p className="text-[10px] text-taupe">
                                {p.collectionName} ·{' '}
                                {p.weightGrams >= 1000
                                  ? `${(p.weightGrams / 1000).toFixed(1)} kg`
                                  : `${p.weightGrams} g`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 font-mono text-[11px] text-taupe">
                          {sup ? (
                            <div>
                              <span className="text-espresso">
                                P.{sup.pdf_page}
                              </span>
                              <p className="text-[10px]">{sup.chartogi_ref}</p>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <select
                            value={p.status}
                            onChange={(e) =>
                              patchProductLocal(p.sku, {
                                status: e.target.value as ProductStatus,
                              })
                            }
                            className={`rounded-lg border px-2 py-1 text-[11px] font-medium outline-none ${
                              p.status === 'ready'
                                ? 'border-emerald-700/30 bg-emerald-50 text-emerald-900'
                                : p.status === 'inquiry'
                                ? 'border-amber-700/30 bg-amber-50 text-amber-900'
                                : 'border-hairline bg-studio text-taupe'
                            }`}
                          >
                            <option value="ready">Ready to Order</option>
                            <option value="inquiry">Inquiry Approval</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={p.estimatedCostUsd}
                            onChange={(e) =>
                              patchProductLocal(p.sku, {
                                estimatedCostUsd: Number(e.target.value) || 0,
                              })
                            }
                            className="w-20 rounded-lg border border-hairline bg-white px-2 py-1 font-mono text-xs outline-none focus:border-brass"
                          />
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={p.priceUsd}
                            onChange={(e) => {
                              const usd = Number(e.target.value) || 0;
                              patchProductLocal(p.sku, {
                                priceUsd: usd,
                                ...(autoSyncEur
                                  ? { priceEur: Math.round(usd * 0.92) }
                                  : {}),
                              });
                            }}
                            className="w-20 rounded-lg border border-hairline bg-white px-2 py-1 font-mono text-xs font-semibold outline-none focus:border-brass"
                          />
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={p.priceEur}
                            onChange={(e) =>
                              patchProductLocal(p.sku, {
                                priceEur: Number(e.target.value) || 0,
                              })
                            }
                            className="w-20 rounded-lg border border-hairline bg-white px-2 py-1 font-mono text-xs font-semibold outline-none focus:border-brass"
                          />
                        </td>

                        <td className="px-3 py-3 font-mono">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              marginPct >= 65
                                ? 'bg-emerald-100 text-emerald-900'
                                : marginPct >= 45
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {marginPct}%
                          </span>
                        </td>

                        <td className="px-3 py-3 font-mono text-[11px] text-taupe">
                          {p.weightGrams >= 5000 ? 'Freight Quote' : `$${express1pc}`}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.featured}
                            onChange={(e) =>
                              patchProductLocal(p.sku, {
                                featured: e.target.checked,
                              })
                            }
                            className="h-4 w-4 accent-espresso"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Customer Inquiries */}
        {tab === 'inquiries' && (
          <div className="mt-6 space-y-3">
            {inquiries.length === 0 ? (
              <div className="rounded-2xl border border-hairline bg-studio/50 py-14 text-center text-sm text-taupe">
                No inquiries submitted yet. Inquiries submitted for Cabinets or
                approval-gated items appear here.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-hairline bg-studio/60 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-mahogany">
                        {inq.id}
                      </span>
                      <span className="rounded-full bg-ivory px-2.5 py-0.5 font-mono text-[10px] uppercase text-espresso">
                        {inq.status}
                      </span>
                      <span className="font-mono text-[11px] text-taupe">
                        {inq.sku} · Qty {inq.quantity}
                      </span>
                    </div>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-espresso">
                      {inq.productTitle} ({inq.variantLabel})
                    </h3>
                    <p className="mt-1 text-xs text-taupe">
                      {inq.customerName} ({inq.customerEmail}) · {inq.country}
                      {inq.company ? ` · ${inq.company}` : ''}
                    </p>
                    {inq.notes && (
                      <p className="mt-1.5 text-xs italic text-espresso/80">
                        “{inq.notes}”
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInquiryAction(inq.id, 'approved')}
                      className="rounded-full bg-espresso px-4 py-2 text-xs font-semibold text-ivory hover:bg-mahogany"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInquiryAction(inq.id, 'declined')}
                      className="rounded-full border border-hairline bg-ivory px-4 py-2 text-xs font-medium text-taupe hover:text-espresso"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Orders */}
        {tab === 'orders' && (
          <div className="mt-6 space-y-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-hairline bg-studio/50 py-14 text-center text-sm text-taupe">
                No orders logged yet. Complete a test checkout at /checkout to
                verify air shipping and order capture.
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-2xl border border-hairline bg-studio/60 p-5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-semibold text-espresso">
                        {ord.id}
                      </span>
                      <span className="rounded-full bg-ivory px-2.5 py-0.5 font-mono text-[10px] uppercase text-mahogany">
                        {ord.status}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-espresso">
                      {ord.currency} {ord.total} ({ord.chargeableWeightKg} kg ·{' '}
                      {ord.shippingMethodName})
                    </span>
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-espresso">
                        {ord.customer.name} ({ord.customer.email})
                      </p>
                      <p className="text-taupe">
                        {ord.customer.address}, {ord.customer.postalCode}{' '}
                        {ord.customer.city}, {ord.customer.country}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {ord.items.map((item, idx) => (
                        <p key={`${item.sku}-${idx}`} className="font-mono">
                          {item.quantity}× {item.sku} — {item.title} (
                          {item.variantLabel})
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
