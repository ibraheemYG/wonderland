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
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:border-primary/30">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative w-full h-72 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
          <Image
            src={product.images?.[0] || product.imageUrl || '/placeholder.png'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out"
            priority
          />
        </Link>
        
        {/* Discount badge with animation */}
        {product.originalPrice && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              خصم
            </span>
          </div>
        )}
        
        {/* Quick action buttons overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      
      <div className="relative p-5 bg-white dark:bg-gray-900">
        {/* Category tag */}
        {product.category && (
          <Link
            href={`/products?category=${product.category}`}
            className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full transition-all duration-300 mb-3"
          >
            {categoryNames[product.category] ?? product.category}
          </Link>
        )}
        
        {/* Product name */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 h-14 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        
        {/* Price and rating section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">
              {formatIQDFromUSD(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-sm line-through text-gray-400 dark:text-gray-500">
                {formatIQDFromUSD(product.originalPrice)}
              </p>
            )}
          </div>
          {product.rating && (
            <div className="bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
              <Rating rating={product.rating} />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => addToCart({
              ...product,
              imageUrl: product.images?.[0] || product.imageUrl || '/placeholder.png'
            })}
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              أضف إلى السلة
            </span>
          </button>
          <Link
            href={`/try-3d?productId=${product.id}`}
            className="flex items-center justify-center gap-2 w-full text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            تجربة 3D
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
