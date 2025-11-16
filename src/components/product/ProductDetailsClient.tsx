'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductGallery from '@/components/product/ProductGallery';
import { formatIQDFromUSD } from '@/utils/currency';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  originalPrice?: number;
  category: string;
  description?: string;
  images?: string[];
  videos?: string[];
  threeD?: string;
}

interface ProductDetailsClientProps {
  productId: string;
}

export default function ProductDetailsClient({ productId }: ProductDetailsClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products?id=${productId}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'لم يتم العثور على المنتج');
        }
        const json = await res.json();
        setProduct(json.data ?? null);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'تعذر تحميل المنتج');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [productId]);

  const gallery = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    if (product?.imageUrl) {
      return [product.imageUrl];
    }
    return [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800',
    ];
  }, [product]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-foreground/60">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto text-center bg-secondary/40 border border-secondary/60 rounded-2xl p-10">
          <h1 className="text-3xl font-bold text-foreground mb-4">المنتج غير متوفر</h1>
          <p className="text-foreground/70 mb-6">{error ?? 'عذراً، لم نتمكن من العثور على هذا المنتج.'}</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg"
          >
            العودة إلى المنتجات
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-6 text-sm text-foreground/70">
        <Link href="/">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`}>المنتجات</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={gallery} name={product.name} />

        <section>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          {product.rating && (
            <p className="mb-2 text-foreground/70">تقييم: {product.rating} / 5</p>
          )}
          <div className="mb-6">
            <p className="text-3xl font-extrabold text-primary">{formatIQDFromUSD(product.price)}</p>
            {product.originalPrice && (
              <p className="text-sm line-through text-foreground/60 mt-1">
                {formatIQDFromUSD(product.originalPrice)}
              </p>
            )}
          </div>

          <p className="text-foreground/80 leading-8 mb-8">
            {product.description ?? 'منتج عالي الجودة بتفاصيل عصرية وخامات مختارة بعناية ليمنح منزلك مظهراً أنيقاً ووظائف عملية.'}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push(`/try-3d?productId=${product.id}`)}
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              🎯 جرب في 3D
            </button>
            <Link
              href="/products"
              className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg"
            >
              متابعة التسوق
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
