import type {
  CurrencyCode,
  DimensionsMm,
  MarketRegion,
  ShippingEstimate,
  ShippingOption,
} from '@/types/catalog';

export interface ShippableItemInput {
  weightGrams: number;
  dimensionsMm: DimensionsMm;
  quantity: number;
  priceUsd: number;
  priceEur: number;
}

export function getCurrencyForMarket(market: MarketRegion): CurrencyCode {
  return market === 'EU' ? 'EUR' : 'USD';
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const symbol = currency === 'EUR' ? '€' : '$';
  const rounded = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return `${symbol}${rounded}`;
}

/**
 * Calculates China air shipping options using consolidated parcel gross vs volumetric weight:
 * - Gross boxed weight accounts for internal cushioning + outer export carton.
 * - Volumetric weight uses standard international courier divisor (L*W*H cm / 5000).
 * - Multi-item orders consolidate into one master carton so adding a 2nd humidor adds ~$15
 *   instead of doubling the base air waybill fee (~$50 for 1 humidor -> ~$65 for 2 humidors).
 */
export function calculateAirShipping(
  items: ShippableItemInput[],
  market: MarketRegion
): ShippingEstimate {
  const currency = getCurrencyForMarket(market);

  let rawGrossKg = 0;
  let rawVolKg = 0;
  let totalUnits = 0;
  let subtotal = 0;

  for (const item of items) {
    const qty = Math.max(0, item.quantity);
    if (qty === 0) continue;

    totalUnits += qty;
    subtotal += (currency === 'EUR' ? item.priceEur : item.priceUsd) * qty;

    const unitNetKg = Math.max(0.05, item.weightGrams / 1000);
    // Protective inner sleeve/foam (~15%) + inner gift box (~0.06kg)
    const unitPackagedKg = unitNetKg * 1.15 + 0.06;
    rawGrossKg += unitPackagedKg * qty;

    // Padded parcel dimensions in cm (+2.5cm box clearance per side)
    const lCm = (item.dimensionsMm.length + 25) / 10;
    const wCm = (item.dimensionsMm.width + 25) / 10;
    const hCm = (item.dimensionsMm.height + 25) / 10;
    const unitVolKg = (lCm * wCm * hCm) / 5000;
    rawVolKg += unitVolKg * qty;
  }

  // Consolidated master export carton overhead (~0.18 kg for parcels)
  const masterPadding = totalUnits > 0 ? 0.18 : 0;
  const actualBoxedKg = Number((rawGrossKg + masterPadding).toFixed(2));
  const volumetricKg = Number((rawVolKg + masterPadding).toFixed(2));
  const chargeableKg = Number(Math.max(actualBoxedKg, volumetricKg).toFixed(2));

  if (totalUnits === 0) {
    return {
      actualBoxedKg: 0,
      volumetricKg: 0,
      chargeableKg: 0,
      totalUnits: 0,
      options: [],
    };
  }

  // Express Air Freight (DHL / FedEx International Priority out of Shenzhen / HK)
  let expressUsd = 32;
  if (chargeableKg <= 0.5) expressUsd = 32;
  else if (chargeableKg <= 1.5) expressUsd = 42;
  else if (chargeableKg <= 3.6) expressUsd = 50; // ~1 wooden humidor
  else if (chargeableKg <= 7.2) expressUsd = 65; // ~2 wooden humidors consolidated
  else if (chargeableKg <= 11.0) expressUsd = 82;
  else expressUsd = 82 + Math.ceil(chargeableKg - 11.0) * 7;

  // Direct China Air Line (YunExpress / 4PX Tracked DDP)
  let directUsd = 14;
  if (chargeableKg <= 0.45) directUsd = 14;
  else if (chargeableKg <= 1.1) directUsd = 21;
  else if (chargeableKg <= 2.1) directUsd = 28;
  else if (chargeableKg <= 3.6) directUsd = 34; // ~1 humidor
  else if (chargeableKg <= 7.2) directUsd = 47; // ~2 humidors consolidated
  else if (chargeableKg <= 11.0) directUsd = 61;
  else directUsd = 61 + Math.ceil(chargeableKg - 11.0) * 6;

  // Sweden / EU DDP conversion (EUR rate + IOSS/DDP pre-clearance)
  const expressCost =
    currency === 'EUR' ? Math.round(expressUsd * 0.92 + 4) : expressUsd;
  const directBaseCost =
    currency === 'EUR' ? Math.round(directUsd * 0.92 + 3) : directUsd;

  const freeThreshold = currency === 'EUR' ? 220 : 240;
  const isDirectFree = subtotal >= freeThreshold;
  const directCost = isDirectFree ? 0 : directBaseCost;

  const options: ShippingOption[] = [
    {
      id: 'direct-air',
      name: 'Direct China Air Line (DDP)',
      carrier: 'YunExpress / 4PX Tracked Air',
      eta: market === 'EU' ? '8–13 business days to Sweden / EU' : '7–12 business days to USA',
      description:
        market === 'EU'
          ? 'Customs pre-cleared DDP parcel line (no unexpected PostNord import delays on standard orders).'
          : 'Consolidated air line with US Section 321 customs pre-clearance and door-to-door tracking.',
      cost: directCost,
      currency,
      isFree: isDirectFree,
    },
    {
      id: 'express-air',
      name: 'Express Air Freight',
      carrier: 'DHL Express / FedEx Priority',
      eta: '4–7 business days worldwide',
      description:
        'Priority air waybill from Shenzhen/Hong Kong hub. Consolidated master carton reduces per-humidor air freight (~$50 for 1 humidor, ~$65 for 2).',
      cost: expressCost,
      currency,
      isFree: false,
    },
  ];

  return {
    actualBoxedKg,
    volumetricKg,
    chargeableKg,
    totalUnits,
    options,
  };
}
