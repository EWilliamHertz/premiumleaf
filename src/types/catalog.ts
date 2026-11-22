export type MarketRegion = 'EU' | 'US';
export type CurrencyCode = 'EUR' | 'USD';
export type ProductStatus = 'ready' | 'inquiry' | 'hidden';

export interface ProductVariant {
  id: string;
  label: string;
  image: string;
}

export interface ProductHighlight {
  label: string;
  description: string;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface DimensionsMm {
  length: number;
  width: number;
  height: number;
}

export interface Product {
  sku: string;
  slug: string;
  title: string;
  subtitle: string;
  collectionSlug: string;
  collectionName: string;
  status: ProductStatus;
  featured: boolean;
  priceUsd: number;
  priceEur: number;
  estimatedCostUsd: number;
  weightGrams: number;
  dimensionsMm: DimensionsMm;
  heroImage: string;
  dimensionImage: string;
  variants: ProductVariant[];
  highlights: ProductHighlight[];
  specs: ProductSpec[];
  specNote: string | null;
  complianceNote: string | null;
}

export type PublicProduct = Omit<Product, 'estimatedCostUsd'>;

export interface CollectionMeta {
  slug: string;
  name: string;
  prefix: string;
  tagline: string;
  count: number;
}

export interface CatalogOverride {
  priceUsd?: number;
  priceEur?: number;
  estimatedCostUsd?: number;
  status?: ProductStatus;
  featured?: boolean;
  updatedAt?: string;
}

export interface CartItem {
  sku: string;
  slug: string;
  title: string;
  variantId: string;
  variantLabel: string;
  image: string;
  priceUsd: number;
  priceEur: number;
  weightGrams: number;
  dimensionsMm: DimensionsMm;
  quantity: number;
}

export interface ShippingOption {
  id: 'direct-air' | 'express-air';
  name: string;
  carrier: string;
  eta: string;
  description: string;
  cost: number;
  currency: CurrencyCode;
  isFree: boolean;
}

export interface ShippingEstimate {
  actualBoxedKg: number;
  volumetricKg: number;
  chargeableKg: number;
  totalUnits: number;
  options: ShippingOption[];
}

export interface InquiryRecord {
  id: string;
  sku: string;
  productTitle: string;
  variantLabel: string;
  quantity: number;
  market: MarketRegion;
  customerName: string;
  customerEmail: string;
  company?: string;
  country: string;
  notes?: string;
  status: 'pending' | 'approved' | 'declined';
  quotedPriceUsd?: number;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  items: {
    sku: string;
    title: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
  }[];
  market: MarketRegion;
  currency: CurrencyCode;
  subtotal: number;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingCost: number;
  total: number;
  chargeableWeightKg: number;
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMode: 'stripe' | 'simulated';
  status: 'paid' | 'awaiting_stripe' | 'confirmed_demo';
  createdAt: string;
}
