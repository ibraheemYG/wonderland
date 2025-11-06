import React from 'react';
import Link from 'next/link';
import { baseProducts } from '@/data/products';
import ProductGallery from '@/components/ProductGallery';
import { formatIQDFromUSD } from '@/utils/currency';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function getProduct(id: number) {
  return baseProducts.find((p) => p.id === id);
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idString } = await params;
  const id = Number(idString);
  const product = getProduct(id);
  if (!product) return notFound();

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
            <Link
              href={`/try-3d?productId=${product.id}`}
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              🎯 جرب في 3D
            </Link>
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
