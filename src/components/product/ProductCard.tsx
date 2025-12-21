'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Rating from '@/components/common/Rating';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  threeD?: string;
  discount?: number;
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
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // تجنب التنقل عند الضغط على الأزرار أو الروابط
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/products/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:border-primary/30 cursor-pointer"
    >
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
        
        {/* وسوم 3D والخصم في الأعلى */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* وسم الخصم */}
          {(product.discount && product.discount > 0) || product.originalPrice ? (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse">
              <span className="text-sm">🔥</span>
              <span>
                {product.discount 
                  ? `خصم ${product.discount}%` 
                  : product.originalPrice 
                    ? `خصم ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                    : ''
                }
              </span>
            </div>
          ) : null}
          
          {/* وسم 3D */}
          {product.threeD && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5">
              <span className="text-sm">🎮</span>
              <span>عرض 3D</span>
            </div>
          )}
        </div>
        
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
          {product.threeD && (
            <Link
              href={`/try-3d?productId=${product.id}`}
              className="flex items-center justify-center gap-2 w-full text-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 border border-emerald-200 dark:border-emerald-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              تجربة 3D
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
