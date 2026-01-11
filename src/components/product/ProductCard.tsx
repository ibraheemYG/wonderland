'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import Rating from '@/components/common/Rating';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatIQDFromUSD } from '@/utils/currency';
import { Heart, GitCompare } from 'lucide-react';

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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const router = useRouter();

  const productId = String(product.id);
  const inWishlist = isInWishlist(productId);
  const inCompare = isInCompare(productId);

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
      className="group relative glass-card rounded-2xl border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 hover:scale-[1.02] cursor-pointer"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative w-full h-72 bg-white/50 dark:bg-white/5 overflow-hidden">
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
        
        {/* أزرار المفضلة والمقارنة */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(productId);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-md ${
              inWishlist 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30' 
                : 'bg-white/80 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20'
            }`}
            title={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (inCompare) {
                removeFromCompare(productId);
              } else {
                addToCompare(productId);
              }
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-md ${
              inCompare 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30' 
                : 'bg-white/80 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-500/20'
            }`}
            title={inCompare ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}
          >
            <GitCompare className="w-5 h-5" />
          </button>
        </div>
        
        {/* وسوم 3D والخصم في الأعلى */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* وسم الخصم */}
          {(product.discount && product.discount > 0) || product.originalPrice ? (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-1.5 animate-pulse">
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
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
              <span className="text-sm">🎮</span>
              <span>عرض 3D</span>
            </div>
          )}
        </div>
        
        {/* Quick action buttons overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      
      <div className="relative p-5">
        {/* Category tag */}
        {product.category && (
          <Link
            href={`/products?category=${product.category}`}
            className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all duration-300 mb-3"
          >
            {categoryNames[product.category] ?? product.category}
          </Link>
        )}
        
        {/* Product name */}
        <h3 className="text-lg font-bold text-foreground mb-3 h-14 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        
        {/* Price and rating section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <p className="text-xl font-extrabold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              {formatIQDFromUSD(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-sm line-through text-foreground/40">
                {formatIQDFromUSD(product.originalPrice)}
              </p>
            )}
          </div>
          {product.rating && (
            <div className="glass-subtle px-3 py-1.5 rounded-xl">
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
            className="w-full glass-button text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 transform hover:scale-[1.02] active:scale-[0.98]"
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
              className="flex items-center justify-center gap-2 w-full text-center glass-subtle text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 border border-emerald-500/30"
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
