import React from 'react';
import { notFound } from 'next/navigation';
import { getPublicProductBySlug, getPublicProducts } from '@/lib/catalog-server';
import { ProductDetailClient } from '@/components/catalog/ProductDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getPublicProductBySlug(slug);
  if (!product) notFound();

  const related = getPublicProducts()
    .filter(
      (p) =>
        p.collectionSlug === product.collectionSlug && p.sku !== product.sku
    )
    .slice(0, 3);

  return <ProductDetailClient product={product} related={related} />;
}
