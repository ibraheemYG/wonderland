'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  originalPrice?: number;
  category?: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/products?limit=4', { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'تعذر تحميل المنتجات المميزة');
        }
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        setProducts(list.slice(0, 4));
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'حدث خطأ غير متوقع');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, []);

  const skeletons = useMemo(() => Array.from({ length: 4 }), []);

  if (error) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">المنتجات المميزة</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              نختار لك باقة من أفضل المنتجات التي نعتقد أنك ستحبها.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {skeletons.map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
                <div className="aspect-[4/5] rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-100 dark:bg-gray-700/60 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">المنتجات المميزة</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اكتشف تشكيلتنا المختارة بعناية لتمنح منزلك مظهراً جديداً.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            تصفح كل المنتجات
          </Link>
        </div>
      </div>
    </section>
  );
}
