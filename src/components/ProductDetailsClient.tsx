'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import { formatIQDFromUSD } from '@/utils/currency';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
  originalPrice?: number;
  category: string;
  description?: string;
  images?: string[];
}

interface ProductDetailsClientProps {
  productId: string;
}

export default function ProductDetailsClient({ productId }: ProductDetailsClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProduct = () => {
      try {
        const stored = localStorage.getItem('wonderland_custom_products');
        console.log('📦 Loading product with ID:', productId);
        
        if (stored) {
          const products: Product[] = JSON.parse(stored);
          const found = products.find((p) => p.id === productId);
          
          if (found) {
            console.log('✅ Product found:', found);
            setProduct(found);
          } else {
            console.log('⚠️ Product not found with ID:', productId);
            setProduct(null);
          }
        } else {
          console.log('⚠️ No products in localStorage');
          setProduct(null);
        }
      } catch (error) {
        console.error('❌ Failed to load product:', error);
        setProduct(null);
      }
      setIsLoading(false);
    };

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-12">
          <p className="text-foreground/60">جاري التحميل...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">المنتج غير موجود</h1>
          <p className="text-foreground/70 mb-6">عذراً، لم نتمكن من العثور على هذا المنتج.</p>
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

  const gallery = product.images?.length ? product.images : [
    product.imageUrl,
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
    'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800',
  ];

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
