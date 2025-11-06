'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { ProductRecord, ProductCategory } from '@/data/products';

const STORAGE_KEY = 'wonderland_custom_products';

const filterOptions: Array<{ label: string; slug?: ProductCategory }> = [
  { label: 'جميع المنتجات' },
  { label: 'غرف المعيشة', slug: 'living-room' },
  { label: 'غرف النوم', slug: 'bedroom' },
  { label: 'المطابخ', slug: 'kitchen' },
  { label: 'الحمامات', slug: 'bathroom' },
  { label: 'الديكور', slug: 'decor' },
  { label: 'المفروشات', slug: 'furnishings' },
  { label: 'الأجهزة', slug: 'appliances' },
  { label: 'عروض خاصة', slug: 'sale' },
];

const categoryLabels: Record<ProductCategory | 'furnishings', { title: string; description: string }> = {
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
    description: 'وسائد، مفارش، ستائر، وأقمشة تضيف دفئاً وأناقة لكل غرفة.',
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

function loadCustomProducts(): ProductRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProductRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read custom products', error);
    return [];
  }
}

function syncCustomProducts(products: ProductRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to persist custom products', error);
  }
}

interface ProductCatalogueProps {
  baseProducts: ProductRecord[];
  selectedCategory?: ProductCategory;
}

export default function ProductCatalogue({ baseProducts, selectedCategory }: ProductCatalogueProps) {
  const [customProducts, setCustomProducts] = useState<ProductRecord[]>([]);

  useEffect(() => {
    setCustomProducts(loadCustomProducts());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setCustomProducts(loadCustomProducts());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const allProducts = useMemo(
    () => [...baseProducts, ...customProducts],
    [baseProducts, customProducts],
  );

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return allProducts;
    return allProducts.filter((product) => product.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  const categoryMeta = selectedCategory ? categoryLabels[selectedCategory] : undefined;

  const handleDeleteCustomProduct = (id: number) => {
    setCustomProducts((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      syncCustomProducts(updated);
      return updated;
    });
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 border-b border-secondary/60 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-foreground/60 mb-3">product collections</p>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {categoryMeta ? categoryMeta.title : 'قائمة المنتجات الكاملة'}
            </h1>
            <p className="text-foreground/70 max-w-2xl">
              {categoryMeta
                ? categoryMeta.description
                : 'استكشف مجموعاتنا المتنوعة من الأثاث والإكسسوارات المصممة بروح اسكندنافية معاصرة.'}
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            + إضافة منتج جديد
          </Link>
        </div>
      </header>

      <nav className="mb-10 flex flex-wrap gap-3">
        {filterOptions.map((option) => {
          const isActive = option.slug === selectedCategory || (!option.slug && !selectedCategory);
          const href = option.slug ? `/products?category=${option.slug}` : '/products';
          return (
            <Link
              key={option.label}
              href={href}
              className={`px-5 py-2 rounded-full border transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-foreground border-transparent hover:bg-primary/10'
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-secondary bg-secondary/60 p-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">لا توجد منتجات مطابقة حالياً</h2>
          <p className="text-foreground/70">
            نعمل على إضافة قطع جديدة في هذا القسم. يمكنك الاطلاع على الأقسام الأخرى أو العودة لاحقاً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={`${product.isCustom ? 'custom-' : ''}${product.id}`} className="relative">
              {product.isCustom && (
                <button
                  onClick={() => handleDeleteCustomProduct(product.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-black"
                >
                  حذف
                </button>
              )}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
