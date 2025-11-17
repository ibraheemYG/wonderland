'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import ProductsFilterTabs, { FilterOption } from '@/components/product/ProductsFilterTabs';
import Breadcrumbs, { BreadcrumbItem } from '@/components/common/Breadcrumbs';
import { List, SlidersHorizontal } from 'lucide-react';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const categoryLabels: Record<string, { title: string; description: string }> = {
  'living-room': {
    title: 'غرف المعيشة',
    description: 'تصاميم تمنح مساحة الجلوس لديك دفئاً وراحة لكل أفراد العائلة.',
  },
  kitchen: {
    title: 'المطابخ',
    description: 'محطات الطهي المتكاملة مع خزائن عملية وإضاءة مدروسة.',
  },
  bedroom: {
    title: 'غرف النوم',
    description: 'أثاث مريح وأقمشة فاخرة تسهّل عليك لحظات الاسترخاء.',
  },
  bathroom: {
    title: 'الحمامات',
    description: 'خيارات تجمع بين الترتيب الجيد والمواد المقاومة للرطوبة.',
  },
  decor: {
    title: 'الديكور والإكسسوارات',
    description: 'لمسات تزيينية بسيطة تحول أي مساحة إلى لوحة متكاملة.',
  },
  furnishings: {
    title: 'المفروشات',
    description: 'وسائد، مفارش، ستائر وأقمشة تضيف دفئاً وأناقة لكل غرفة.',
  },
  appliances: {
    title: 'الأجهزة الذكية',
    description: 'تقنيات تساعدك في المهام اليومية بكفاءة أعلى.',
  },
  sale: {
    title: 'عروض خاصة',
    description: 'منتجات مفضلة بأسعار تنافسية لوقت محدود.',
  },
};

const filterOptions: FilterOption[] = [
  { label: 'جميع المنتجات', slug: undefined },
  { label: 'غرف المعيشة', slug: 'living-room' },
  { label: 'غرف النوم', slug: 'bedroom' },
  { label: 'المطابخ', slug: 'kitchen' },
  { label: 'الحمامات', slug: 'bathroom' },
  { label: 'الديكور', slug: 'decor' },
  { label: 'المفروشات', slug: 'furnishings' },
  { label: 'الأجهزة', slug: 'appliances' },
  { label: 'عروض خاصة', slug: 'sale' },
];

interface ProductsPageClientProps {
  selectedCategory?: string;
}

export default function ProductsPageClient({ selectedCategory }: ProductsPageClientProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortOption>('newest');

  useEffect(() => {
    setLoading(true);
    setError(null);

    const url = selectedCategory ? `/api/products?category=${selectedCategory}` : '/api/products';
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('تعذر تحميل المنتجات');
        return res.json();
      })
      .then(json => {
        setProducts(Array.isArray(json.data) ? json.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Failed to load products:', err);
        setError(err.message || 'حدث خطأ غير متوقع');
        setProducts([]);
        setLoading(false);
      });
  }, [selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const url = selectedCategory ? `/api/products?category=${selectedCategory}` : '/api/products';
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setProducts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err) {
      console.error('Failed to refresh products:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const categoryMeta = selectedCategory ? categoryLabels[selectedCategory] : undefined;

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        // Assuming products are fetched by newest from the API
        return sorted;
    }
  }, [products, sort]);

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: 'الرئيسية', href: '/' }, { label: 'المنتجات', href: '/products' }];
    if (categoryMeta) {
      items.push({ label: categoryMeta.title, href: `/products?category=${selectedCategory}` });
    }
    return items;
  }, [categoryMeta, selectedCategory]);

  const skeletons = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 border-b border-secondary/60 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                {categoryMeta ? categoryMeta.title : 'قائمة المنتجات الكاملة'}
              </h1>
              <p className="text-foreground/70 max-w-2xl">
                {categoryMeta
                  ? categoryMeta.description
                  : 'استكشف مجموعاتنا المتنوعة من الأثاث والإكسسوارات المصممة بروح اسكندنافية معاصرة.'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-60"
              disabled={refreshing}
            >
              {refreshing ? 'يتم التحديث...' : '🔄 تحديث المنتجات'}
            </button>
          </div>
          <p className="text-xs text-foreground/50">العدد: {sortedProducts.length} منتج</p>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <ProductsFilterTabs options={filterOptions} />
          <div className="flex items-center gap-4">
            <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              فرز حسب:
            </label>
            <select
              id="sort-by"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
            >
              <option value="newest">الأحدث</option>
              <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
              <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {skeletons.map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-xl border border-secondary/40 bg-secondary/30 p-4 space-y-4"
              >
                <div className="aspect-[4/5] rounded-lg bg-secondary/60" />
                <div className="h-4 bg-secondary/60 rounded" />
                <div className="h-4 bg-secondary/40 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-secondary bg-secondary/60 p-12 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-3">لا توجد منتجات مطابقة حالياً</h2>
            <p className="text-foreground/70">
              نعمل على إضافة قطع جديدة في هذا القسم. يمكنك الاطلاع على الأقسام الأخرى أو العودة لاحقاً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
