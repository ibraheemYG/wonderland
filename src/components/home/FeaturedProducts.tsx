'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatIQDFromUSD } from '@/utils/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  originalPrice?: number;
  category?: string;
  threeD?: string;
  discount?: number;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/products?limit=8', { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'تعذر تحميل المنتجات المميزة');
        }
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        // ترتيب عشوائي للمنتجات
        const shuffled = list.sort(() => Math.random() - 0.5);
        setProducts(shuffled.slice(0, 8));
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

  if (error || (!loading && products.length === 0)) {
    return null;
  }

  // تخطيطات الكولاج العشوائية
  const collageLayouts = [
    'col-span-2 row-span-2', // كبير
    'col-span-1 row-span-1', // صغير
    'col-span-1 row-span-2', // طويل
    'col-span-2 row-span-1', // عريض
  ];

  // توزيع المنتجات على الكولاج
  const getLayoutClass = (index: number) => {
    if (index === 0) return 'col-span-2 row-span-2'; // أول منتج كبير
    if (index === 3) return 'col-span-2 row-span-1'; // الرابع عريض
    if (index === 5) return 'col-span-1 row-span-2'; // السادس طويل
    return 'col-span-1 row-span-1'; // الباقي عادي
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-14 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المنتجات المميزة</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[200px]">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700 ${getLayoutClass(idx)}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المنتجات المميزة</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">اكتشف تشكيلتنا المختارة</p>
          </div>
          <Link
            href="/products"
            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            عرض الكل
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Collage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[180px]">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 ${getLayoutClass(index)}`}
            >
              {/* صورة المنتج */}
              <div className="absolute inset-0">
                <Image
                  src={product.images?.[0] || product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* تدرج للقراءة */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* الوسوم */}
              <div className="absolute top-2 right-2 flex flex-wrap gap-1.5 z-10">
                {product.threeD && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    3D
                  </span>
                )}
                {(product.discount && product.discount > 0) || product.originalPrice ? (
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                    {product.discount 
                      ? `${product.discount}%-` 
                      : product.originalPrice 
                        ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%-`
                        : ''
                    }
                  </span>
                ) : null}
              </div>

              {/* معلومات المنتج */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm md:text-lg">
                    {formatIQDFromUSD(product.price)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        ...product,
                        imageUrl: product.images?.[0] || product.imageUrl || '/placeholder.png'
                      });
                    }}
                    className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
