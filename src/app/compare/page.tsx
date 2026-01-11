'use client';

import React, { useEffect, useState } from 'react';
import { useCompare } from '@/context/CompareContext';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { GitCompare, ShoppingBag, X, Check, Minus } from 'lucide-react';
import { formatIQDFromUSD } from '@/utils/currency';

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (compareList.length === 0) {
        setProducts([]);
        setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [compareList]);

  const specs = [
    { key: 'price', label: 'السعر', render: (p: any) => formatIQDFromUSD(p.price) },
    { key: 'category', label: 'القسم', render: (p: any) => p.category || '-' },
    { key: 'rating', label: 'التقييم', render: (p: any) => p.rating ? `${p.rating} ⭐` : '-' },
    { key: 'material', label: 'المادة', render: (p: any) => p.material || '-' },
    { key: 'color', label: 'اللون', render: (p: any) => p.color || '-' },
    { key: 'dimensions', label: 'الأبعاد', render: (p: any) => {
      if (!p.dimensions) return '-';
      const { width, height, depth, unit } = p.dimensions;
      if (!width && !height && !depth) return '-';
      return `${width || '-'} × ${height || '-'} × ${depth || '-'} ${unit || 'سم'}`;
    }},
    { key: 'threeD', label: 'عرض 3D', render: (p: any) => p.threeD ? <Check className="w-5 h-5 text-green-500" /> : <Minus className="w-5 h-5 text-gray-400" /> },
    { key: 'discount', label: 'خصم', render: (p: any) => p.discount ? `${p.discount}%` : '-' },
  ];

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <GitCompare className="w-8 h-8 text-blue-500" />
              مقارنة المنتجات
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {products.length} منتجات للمقارنة
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-red-500 hover:text-red-600 font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              مسح الكل
            </button>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl h-96" />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <GitCompare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              لا توجد منتجات للمقارنة
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              أضف منتجات للمقارنة من صفحة المنتجات
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 text-right font-semibold text-gray-600 dark:text-gray-400 w-40">
                      المنتج
                    </th>
                    {products.map((product) => (
                      <th key={product.id || product._id} className="p-4 min-w-[200px]">
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(String(product.id || product._id))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <Link href={`/products/${product.id || product._id}`}>
                            <div className="relative w-32 h-32 mx-auto mb-3">
                              <Image
                                src={product.images?.[0] || product.imageUrl || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec) => (
                    <tr key={spec.key} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50">
                        {spec.label}
                      </td>
                      {products.map((product) => (
                        <td key={product.id || product._id} className="p-4 text-center text-gray-900 dark:text-white">
                          {spec.render(product)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50">
                      إضافة للسلة
                    </td>
                    {products.map((product) => (
                      <td key={product.id || product._id} className="p-4 text-center">
                        <button
                          onClick={() => addToCart({
                            ...product,
                            imageUrl: product.images?.[0] || product.imageUrl || '/placeholder.png'
                          })}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm"
                        >
                          أضف للسلة
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
