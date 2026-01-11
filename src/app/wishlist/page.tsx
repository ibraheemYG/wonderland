'use client';

import React, { useEffect, useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/product/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) {
          const wishlistProducts = json.data.filter((p: any) => 
            wishlist.includes(String(p.id)) || wishlist.includes(String(p._id))
          );
          setProducts(wishlistProducts);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [wishlist]);

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            قائمة المفضلة
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length} منتج في قائمتك المفضلة
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              قائمتك فارغة
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم تضف أي منتجات للمفضلة بعد
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
