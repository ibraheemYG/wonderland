'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Rating from '@/components/common/Rating';
import Link from 'next/link';
import { formatIQDFromUSD } from '@/utils/currency';

interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  category?: string;
}

const categoryNames: Record<string, string> = {
  'living-room': 'غرف المعيشة',
  kitchen: 'المطابخ',
  bedroom: 'غرف النوم',
  bathroom: 'الحمامات',
  decor: 'الديكور',
  appliances: 'الأجهزة',
  furnishings: 'المفروشات',
  sale: 'عروض خاصة',
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
          <Image
            src={product.images?.[0] || product.imageUrl || '/placeholder.png'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            priority
          />
        </Link>
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            خصم
          </div>
        )}
      </div>
      <div className="p-4">
        {product.category && (
          <Link
            href={`/products?category=${product.category}`}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-1 inline-block"
          >
            {categoryNames[product.category] ?? product.category}
          </Link>
        )}
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2 h-12 line-clamp-2">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        
        <div className="flex justify-between items-baseline mb-3">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatIQDFromUSD(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-sm line-through text-gray-500 dark:text-gray-400">
                {formatIQDFromUSD(product.originalPrice)}
              </p>
            )}
          </div>
          {product.rating && (
            <Rating rating={product.rating} />
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => addToCart({
              ...product,
              imageUrl: product.images?.[0] || product.imageUrl || '/placeholder.png'
            })}
            className="w-full bg-primary/10 text-primary hover:bg-primary/20 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300"
          >
            أضف إلى السلة
          </button>
          <Link
            href={`/try-3d?productId=${product.id}`}
            className="block w-full text-center bg-gray-800 text-white hover:bg-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            تجربة 3D
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
