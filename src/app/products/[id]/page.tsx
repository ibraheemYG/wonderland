import React from 'react';
import ProductDetailsClient from '@/components/ProductDetailsClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idString } = await params;
  
  return <ProductDetailsClient productId={idString} />;
}
