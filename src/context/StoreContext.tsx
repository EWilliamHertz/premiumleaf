'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { calculateAirShipping, getCurrencyForMarket } from '@/lib/shipping';
import type {
  CartItem,
  CurrencyCode,
  MarketRegion,
  PublicProduct,
  ShippingEstimate,
} from '@/types/catalog';

interface InquiryTarget {
  product: PublicProduct;
  variantLabel: string;
}

interface StoreContextValue {
  market: MarketRegion;
  currency: CurrencyCode;
  setMarket: (m: MarketRegion) => void;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  shippingMethodId: 'direct-air' | 'express-air';
  setShippingMethodId: (id: 'direct-air' | 'express-air') => void;
  shippingEstimate: ShippingEstimate;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: PublicProduct, variantId: string, quantity?: number) => void;
  updateQuantity: (sku: string, variantId: string, quantity: number) => void;
  removeFromCart: (sku: string, variantId: string) => void;
  clearCart: () => void;
  inquiryTarget: InquiryTarget | null;
  openInquiry: (product: PublicProduct, variantLabel?: string) => void;
  closeInquiry: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = 'premiumleaf_cart_v1';
const MARKET_STORAGE_KEY = 'premiumleaf_market_v1';
const STORE_EVENT = 'premiumleaf-store-sync';

const EMPTY_CART: CartItem[] = [];
let cachedCartRaw: string | null = null;
let cachedCartParsed: CartItem[] = EMPTY_CART;

function subscribeStore(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(STORE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORE_EVENT, callback);
  };
}

function getMarketSnapshot(): MarketRegion {
  try {
    const val = localStorage.getItem(MARKET_STORAGE_KEY);
    return val === 'US' ? 'US' : 'EU';
  } catch {
    return 'EU';
  }
}

function getCartSnapshot(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw === cachedCartRaw) return cachedCartParsed;
    cachedCartRaw = raw;
    if (!raw) {
      cachedCartParsed = EMPTY_CART;
      return EMPTY_CART;
    }
    const parsed = JSON.parse(raw) as CartItem[];
    cachedCartParsed = Array.isArray(parsed) ? parsed : EMPTY_CART;
    return cachedCartParsed;
  } catch {
    return EMPTY_CART;
  }
}

function writeCartStorage(next: CartItem[]) {
  try {
    const raw = JSON.stringify(next);
    cachedCartRaw = raw;
    cachedCartParsed = next;
    localStorage.setItem(CART_STORAGE_KEY, raw);
    window.dispatchEvent(new Event(STORE_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const market = useSyncExternalStore<MarketRegion>(
    subscribeStore,
    getMarketSnapshot,
    () => 'EU'
  );
  const cart = useSyncExternalStore(
    subscribeStore,
    getCartSnapshot,
    () => EMPTY_CART
  );

  const [shippingMethodId, setShippingMethodId] = useState<
    'direct-air' | 'express-air'
  >('direct-air');
  const [isCartOpen, setCartOpen] = useState(false);
  const [inquiryTarget, setInquiryTarget] = useState<InquiryTarget | null>(null);

  const setMarket = (m: MarketRegion) => {
    try {
      localStorage.setItem(MARKET_STORAGE_KEY, m);
      window.dispatchEvent(new Event(STORE_EVENT));
    } catch {
      // ignore
    }
  };

  const currency = getCurrencyForMarket(market);

  const openInquiry = (product: PublicProduct, variantLabel?: string) => {
    setInquiryTarget({
      product,
      variantLabel: variantLabel || product.variants[0]?.label || 'Standard',
    });
  };

  const closeInquiry = () => setInquiryTarget(null);

  const addToCart = (
    product: PublicProduct,
    variantId: string,
    quantity = 1
  ) => {
    if (product.status !== 'ready') {
      openInquiry(
        product,
        product.variants.find((v) => v.id === variantId)?.label
      );
      return;
    }

    const variant =
      product.variants.find((v) => v.id === variantId) || product.variants[0];

    const current = getCartSnapshot();
    const idx = current.findIndex(
      (item) => item.sku === product.sku && item.variantId === variant.id
    );
    let next: CartItem[];
    if (idx !== -1) {
      next = [...current];
      next[idx] = {
        ...next[idx],
        quantity: Math.min(25, next[idx].quantity + quantity),
      };
    } else {
      next = [
        ...current,
        {
          sku: product.sku,
          slug: product.slug,
          title: product.title,
          variantId: variant.id,
          variantLabel: variant.label,
          image: variant.image,
          priceUsd: product.priceUsd,
          priceEur: product.priceEur,
          weightGrams: product.weightGrams,
          dimensionsMm: product.dimensionsMm,
          quantity,
        },
      ];
    }
    writeCartStorage(next);
    setCartOpen(true);
  };

  const updateQuantity = (sku: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sku, variantId);
      return;
    }
    const next = getCartSnapshot().map((item) =>
      item.sku === sku && item.variantId === variantId
        ? { ...item, quantity: Math.min(25, quantity) }
        : item
    );
    writeCartStorage(next);
  };

  const removeFromCart = (sku: string, variantId: string) => {
    const next = getCartSnapshot().filter(
      (item) => !(item.sku === sku && item.variantId === variantId)
    );
    writeCartStorage(next);
  };

  const clearCart = () => writeCartStorage([]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + (currency === 'EUR' ? item.priceEur : item.priceUsd) * item.quantity,
        0
      ),
    [cart, currency]
  );

  const shippingEstimate = useMemo(
    () => calculateAirShipping(cart, market),
    [cart, market]
  );

  return (
    <StoreContext.Provider
      value={{
        market,
        currency,
        setMarket,
        cart,
        cartCount,
        cartSubtotal,
        shippingMethodId,
        setShippingMethodId,
        shippingEstimate,
        isCartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        inquiryTarget,
        openInquiry,
        closeInquiry,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
