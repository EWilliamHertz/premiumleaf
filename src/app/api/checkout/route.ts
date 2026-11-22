import crypto from 'crypto';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { appendOrder, getAllMergedProducts } from '@/lib/catalog-server';
import { calculateAirShipping, getCurrencyForMarket } from '@/lib/shipping';
import type { MarketRegion, OrderRecord } from '@/types/catalog';

interface CheckoutItemInput {
  sku: string;
  variantLabel: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      items?: CheckoutItemInput[];
      market?: MarketRegion;
      shippingMethodId?: 'direct-air' | 'express-air';
      customer?: {
        name?: string;
        email?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
    };

    const market: MarketRegion = body.market === 'EU' ? 'EU' : 'US';
    const currency = getCurrencyForMarket(market);
    const reqItems = Array.isArray(body.items) ? body.items : [];

    if (reqItems.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    const customer = {
      name: (body.customer?.name || '').trim(),
      email: (body.customer?.email || '').trim(),
      address: (body.customer?.address || '').trim(),
      city: (body.customer?.city || '').trim(),
      postalCode: (body.customer?.postalCode || '').trim(),
      country: (body.customer?.country || '').trim(),
    };

    if (
      !customer.name ||
      !customer.email ||
      !customer.address ||
      !customer.city ||
      !customer.postalCode ||
      !customer.country
    ) {
      return NextResponse.json(
        { error: 'Please complete all shipping address fields.' },
        { status: 400 }
      );
    }

    const catalogBySku = new Map(
      getAllMergedProducts().map((p) => [p.sku.toLowerCase(), p])
    );

    const validatedItems: {
      sku: string;
      title: string;
      variantLabel: string;
      quantity: number;
      unitPrice: number;
      priceUsd: number;
      priceEur: number;
      weightGrams: number;
      dimensionsMm: { length: number; width: number; height: number };
    }[] = [];

    for (const item of reqItems) {
      const prod = catalogBySku.get((item.sku || '').toLowerCase());
      if (!prod || prod.status !== 'ready') {
        return NextResponse.json(
          {
            error: `SKU ${item.sku} is not available for instant checkout (requires inquiry approval).`,
          },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.min(25, Math.floor(Number(item.quantity) || 1)));
      const unitPrice = currency === 'EUR' ? prod.priceEur : prod.priceUsd;

      validatedItems.push({
        sku: prod.sku,
        title: prod.title,
        variantLabel: item.variantLabel || prod.variants[0]?.label || 'Standard',
        quantity: qty,
        unitPrice,
        priceUsd: prod.priceUsd,
        priceEur: prod.priceEur,
        weightGrams: prod.weightGrams,
        dimensionsMm: prod.dimensionsMm,
      });
    }

    const estimate = calculateAirShipping(validatedItems, market);
    const chosenShipping =
      estimate.options.find((opt) => opt.id === body.shippingMethodId) ||
      estimate.options[0];

    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const total = Number((subtotal + chosenShipping.cost).toFixed(2));
    const orderId = `PL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    if (stripeKey && stripeKey.startsWith('sk_')) {
      const stripe = new Stripe(stripeKey);
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        validatedItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(item.unitPrice * 100),
            product_data: {
              name: `${item.title} (${item.sku})`,
              description: `Finish: ${item.variantLabel}`,
            },
          },
        }));

      if (chosenShipping.cost > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(chosenShipping.cost * 100),
            product_data: {
              name: `${chosenShipping.name} — ${chosenShipping.carrier}`,
              description: `${estimate.chargeableKg} kg consolidated air freight (${chosenShipping.eta})`,
            },
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customer.email,
        line_items: lineItems,
        metadata: {
          orderId,
          market,
          shippingMethodId: chosenShipping.id,
        },
        success_url: `${origin}/checkout?success=1&order=${orderId}`,
        cancel_url: `${origin}/checkout?canceled=1`,
      });

      const order: OrderRecord = {
        id: orderId,
        items: validatedItems.map((i) => ({
          sku: i.sku,
          title: i.title,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        market,
        currency,
        subtotal,
        shippingMethodId: chosenShipping.id,
        shippingMethodName: chosenShipping.name,
        shippingCost: chosenShipping.cost,
        total,
        chargeableWeightKg: estimate.chargeableKg,
        customer,
        paymentMode: 'stripe',
        status: 'awaiting_stripe',
        createdAt: new Date().toISOString(),
      };
      appendOrder(order);

      return NextResponse.json({
        mode: 'stripe',
        checkoutUrl: session.url,
        order,
      });
    }

    // Simulated checkout when STRIPE_SECRET_KEY is not configured yet
    const order: OrderRecord = {
      id: orderId,
      items: validatedItems.map((i) => ({
        sku: i.sku,
        title: i.title,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      market,
      currency,
      subtotal,
      shippingMethodId: chosenShipping.id,
      shippingMethodName: chosenShipping.name,
      shippingCost: chosenShipping.cost,
      total,
      chargeableWeightKg: estimate.chargeableKg,
      customer,
      paymentMode: 'simulated',
      status: 'confirmed_demo',
      createdAt: new Date().toISOString(),
    };
    appendOrder(order);

    return NextResponse.json({
      mode: 'simulated',
      order,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Unable to process checkout at this time.' },
      { status: 500 }
    );
  }
}
