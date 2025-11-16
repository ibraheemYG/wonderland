'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ProductDetailsClient = dynamic(() => import('@/components/product/ProductDetailsClient')); // defer load

export default function ProductDetailsPageWrapper({ id }: { id: string }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-foreground/60">جاري تحميل التفاصيل...</div>}>
      <ProductDetailsClient productId={id} />
    </Suspense>
  );
}
