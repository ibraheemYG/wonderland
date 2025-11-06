import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductsFilterTabs from '@/components/ProductsFilterTabs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const products = [
  { id: 1, name: 'Modern Sofa', price: 799, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', rating: 5, category: 'living-room' },
  { id: 2, name: 'Kitchen Island', price: 1299, originalPrice: 1499, imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800', rating: 4, category: 'kitchen' },
  { id: 3, name: 'King Size Bed', price: 999, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', rating: 5, category: 'bedroom' },
  { id: 4, name: 'Bathroom Vanity', price: 499, imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800', rating: 4, category: 'bathroom' },
  { id: 5, name: 'Area Rug', price: 299, imageUrl: 'https://images.unsplash.com/photo-1600856209923-34372e319a5d?w=800', rating: 3, category: 'decor' },
  { id: 6, name: 'Smart Fridge', price: 2499, originalPrice: 2999, imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800', rating: 5, category: 'appliances' },
  { id: 7, name: 'Wall Painting', price: 199, imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800', rating: 4, category: 'decor' },
  { id: 8, name: 'Living Room Set', price: 1999, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', rating: 5, category: 'living-room' },
  { id: 9, name: 'Relax Armchair', price: 549, imageUrl: 'https://images.unsplash.com/photo-1616628182501-4bcf0b82b3be?w=800', rating: 4, category: 'living-room' },
  { id: 10, name: 'Scandi Bedding Set', price: 259, imageUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800', rating: 5, category: 'bedroom' },
  { id: 11, name: 'Minimal Vanity Mirror', price: 149, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800', rating: 4, category: 'bathroom' },
  { id: 12, name: 'Smart Oven', price: 899, originalPrice: 1099, imageUrl: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=800', rating: 4, category: 'appliances' },
  { id: 13, name: 'Outdoor Bistro Set', price: 699, imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', rating: 4, category: 'sale' },
  { id: 14, name: 'Decorative Lighting', price: 179, imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800', rating: 5, category: 'decor' },
  { id: 15, name: 'Velvet Cushion Set', price: 89, imageUrl: 'https://images.unsplash.com/photo-1582582494700-66b01a3f5f30?w=800', rating: 4, category: 'furnishings' },
  { id: 16, name: 'Linen Curtains', price: 149, imageUrl: 'https://images.unsplash.com/photo-1598300183555-854eaca1c082?w=800', rating: 5, category: 'furnishings' },
  { id: 17, name: 'Wool Throw Blanket', price: 129, imageUrl: 'https://images.unsplash.com/photo-1545529468-42764ef8c85e?w=800', rating: 5, category: 'furnishings' },
  { id: 18, name: 'Patterned Cushion Covers (Set of 4)', price: 59, imageUrl: 'https://images.unsplash.com/photo-1598300174659-0f2c2a0a85c8?w=800', rating: 4, category: 'furnishings' },
  { id: 19, name: 'Textured Bed Throw', price: 139, imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800', rating: 4, category: 'furnishings' },
  { id: 20, name: 'Table Runner - Linen', price: 39, imageUrl: 'https://images.unsplash.com/photo-1582582494944-9a7cde6cfdb4?w=800', rating: 4, category: 'furnishings' },
  { id: 21, name: 'Cotton Bedspread', price: 179, imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', rating: 5, category: 'furnishings' },
  { id: 22, name: 'Sheer Curtains (Pair)', price: 119, imageUrl: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800', rating: 4, category: 'furnishings' },
  { id: 23, name: 'Blackout Curtains (Pair)', price: 199, imageUrl: 'https://images.unsplash.com/photo-1598300183699-453f564a0ec0?w=800', rating: 5, category: 'furnishings' },
  { id: 24, name: 'Decorative Pouf', price: 149, imageUrl: 'https://images.unsplash.com/photo-1551025370-9903a6531e0a?w=800', rating: 4, category: 'furnishings' },
];

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
