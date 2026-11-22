import React from 'react';
import { getPublicCollections, getPublicProducts } from '@/lib/catalog-server';
import { HomeClient } from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getPublicProducts();
  const collections = getPublicCollections();

  const readyProducts = products.filter((p) => p.status === 'ready');
  const inquiryProducts = products.filter((p) => p.status === 'inquiry');

  const featuredReady = readyProducts
    .filter((p) => p.featured)
    .slice(0, 6);
  const displayReady =
    featuredReady.length >= 6
      ? featuredReady
      : [
          ...featuredReady,
          ...readyProducts.filter((p) => !p.featured),
        ].slice(0, 6);

  const featuredCabinets = products
    .filter((p) => p.collectionSlug === 'cigar-cabinets')
    .slice(0, 2);

  return (
    <HomeClient
      featuredReady={displayReady}
      featuredCabinets={featuredCabinets}
      collections={collections}
      readyCount={readyProducts.length}
      inquiryCount={inquiryProducts.length}
    />
  );
}
