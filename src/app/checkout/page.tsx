import React, { Suspense } from 'react';
import { CheckoutClient } from '@/components/cart/CheckoutClient';

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-sm text-taupe">
          Loading checkout...
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
