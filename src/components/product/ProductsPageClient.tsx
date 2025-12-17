'use client';

import React, { useCallback, useEffect, useMemo, useState, useLayoutEffect, useRef } from 'react';
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
  const gridRef = useRef<HTMLDivElement>(null);

  // Stagger product cards when products list changes
  useLayoutEffect(() => {
    if (!gridRef.current || loading) return;
    const items = Array.from(gridRef.current.children);
    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out' }
      );
    });
  }, [sortedProducts, loading, sort, selectedCategory]);

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 pb-8 border-b border-gradient-to-r from-transparent via-primary/20 to-transparent">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-4">
                {categoryMeta ? categoryMeta.title : 'قائمة المنتجات الكاملة'}
              </h1>
              <p className="text-foreground/60 max-w-2xl text-lg leading-relaxed">
                {categoryMeta
                  ? categoryMeta.description
                  : 'استكشف مجموعاتنا المتنوعة من الأثاث والإكسسوارات المصممة بروح اسكندنافية معاصرة.'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-primary/90 hover:to-blue-700 transition-all duration-300 whitespace-nowrap disabled:opacity-60 shadow-md hover:shadow-lg hover:shadow-primary/25 flex items-center gap-2"
              disabled={refreshing}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'يتم التحديث...' : 'تحديث المنتجات'}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/50">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {sortedProducts.length} منتج
            </span>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {skeletons.map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900 overflow-hidden shadow-lg"
              >
                <div className="h-72 bg-gray-100 dark:bg-gray-800" />
                <div className="p-5 space-y-4 bg-white dark:bg-gray-900">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-5 bg-gray-100 dark:bg-gray-700/60 rounded-lg w-3/4" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-6 w-16 bg-gray-100 dark:bg-gray-700/60 rounded-lg" />
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <div className="h-12 bg-primary/20 rounded-xl" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">لا توجد منتجات مطابقة حالياً</h2>
            <p className="text-foreground/60 max-w-md mx-auto">
              نعمل على إضافة قطع جديدة في هذا القسم. يمكنك الاطلاع على الأقسام الأخرى أو العودة لاحقاً.
            </p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {sortedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
