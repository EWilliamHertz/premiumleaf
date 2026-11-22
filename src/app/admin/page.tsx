import React from 'react';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  getAllMergedProducts,
  getInquiries,
  getOrders,
  getPublicCollections,
  getSupplierMappingBySku,
} from '@/lib/catalog-server';
import { AdminClient } from '@/components/admin/AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  const collections = getPublicCollections();

  return (
    <AdminClient
      initialAuthenticated={authed}
      initialProducts={authed ? getAllMergedProducts() : []}
      initialSupplierMap={authed ? getSupplierMappingBySku() : {}}
      initialInquiries={authed ? getInquiries() : []}
      initialOrders={authed ? getOrders() : []}
      collections={collections}
    />
  );
}
