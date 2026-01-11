'use client';

import React, { useEffect, useState } from 'react';
import { useCompare } from '@/context/CompareContext';
import Link from 'next/link';
import Image from 'next/image';
import { GitCompare, X, ChevronUp } from 'lucide-react';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (compareList.length === 0) {
        setProducts([]);
        return;
      }

      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) {
          const compareProducts = json.data.filter((p: any) => 
            compareList.includes(String(p.id)) || compareList.includes(String(p._id))
          );
          setProducts(compareProducts);
        }
      } catch (error) {
        console.error('Failed to fetch compare products:', error);
      }
    };

    fetchProducts();
  }, [compareList]);

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center gap-2 shadow-lg"
      >
        <GitCompare className="w-4 h-4" />
        <span>المقارنة ({compareList.length})</span>
        <ChevronUp className={`w-4 h-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
      </button>

      {/* Compare Bar */}
      <div className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Products */}
            <div className="flex items-center gap-4 overflow-x-auto flex-1">
              {products.map((product) => (
                <div
                  key={product.id || product._id}
                  className="relative flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 pr-8 min-w-fit"
                >
                  <button
                    onClick={() => removeFromCompare(String(product.id || product._id))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={product.images?.[0] || product.imageUrl || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[150px]">
                    {product.name}
                  </p>
                </div>
              ))}
              
              {/* Empty slots */}
              {[...Array(4 - compareList.length)].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-40 h-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-xs text-gray-400">أضف منتج</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={clearCompare}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                مسح الكل
              </button>
              <Link
                href="/compare"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                قارن الآن
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
