'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // تحميل المنتجات من localStorage
    try {
      const stored = localStorage.getItem('wonderland_custom_products');
      if (stored) {
        const customProducts = JSON.parse(stored);
        // عرض أول 4 منتجات فقط
        setProducts(Array.isArray(customProducts) ? customProducts.slice(0, 4) : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
      setProducts([]);
    }
  }, []);

  // إذا لم توجد منتجات، لا تعرض القسم
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">New Arrivals</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Discover our latest collection of modern, functional furniture
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <a 
            href="/products"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
