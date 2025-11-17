'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function Try3DContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-6 text-sm text-foreground/70">
        <Link href="/">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">تجربة 3D</span>
      </nav>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">تجربة المنتج بتقنية 3D</h1>

        <div className="bg-secondary/40 border border-secondary/60 rounded-2xl p-10 text-center mb-8">
          <p className="text-foreground/70 mb-6">
            تقنية العرض ثلاثي الأبعاد قيد التطوير حالياً.
          </p>
          {productId && (
            <p className="text-sm text-foreground/50 mb-6">
              معرّف المنتج: {productId}
            </p>
          )}
          <Link
            href="/products"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg"
          >
            العودة إلى المنتجات
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function Try3DPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12">جاري التحميل...</div>}>
      <Try3DContent />
    </Suspense>
  );
}
