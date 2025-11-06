'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Rating from './Rating';
import Link from 'next/link';
import { formatIQDFromUSD } from '@/utils/currency';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
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
  <div className="group relative bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        {product.originalPrice && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            SALE
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        {product.rating && (
          <div className="mb-3">
            <Rating rating={product.rating} />
          </div>
        )}
        {product.category && (
          <Link
            href={`/products?category=${product.category}`}
            className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-3"
          >
            {categoryNames[product.category] ?? product.category}
          </Link>
        )}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl font-bold text-primary">
              {formatIQDFromUSD(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-sm line-through text-gray-500">
                {formatIQDFromUSD(product.originalPrice)}
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => addToCart(product)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg mb-2"
        >
          Add to Cart
        </button>
        <Link
          href={`/try-3d?productId=${product.id}`}
          className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 font-semibold py-2 px-4 rounded-lg transition-all"
        >
          🎯 جرب 3D
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
