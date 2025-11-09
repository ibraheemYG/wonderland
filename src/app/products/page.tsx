import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductsFilterTabs from '@/components/ProductsFilterTabs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const products: any[] = [];

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

const filterOptions = [
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

type ProductsPageProps = {
  searchParams: {
    category?: string;
  };
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const selectedCategory = searchParams.category;
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory || (selectedCategory === 'sale' && product.category === 'sale'))
    : products;

  const categoryMeta = selectedCategory ? categoryLabels[selectedCategory] : undefined;

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 border-b border-secondary/60 pb-6">
          <p className="uppercase tracking-[0.3em] text-xs text-foreground/60 mb-3">product collections</p>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            {categoryMeta ? categoryMeta.title : 'قائمة المنتجات الكاملة'}
          </h1>
          <p className="text-foreground/70 max-w-2xl">
            {categoryMeta
              ? categoryMeta.description
              : 'استكشف مجموعاتنا المتنوعة من الأثاث والإكسسوارات المصممة بروح اسكندنافية معاصرة.'}
          </p>
        </header>

        <ProductsFilterTabs options={filterOptions} />

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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
