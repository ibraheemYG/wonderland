import CategoryGrid from '@/components/home/CategoryGrid';
import ShopByRoom from '@/components/home/ShopByRoom';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <main className="min-h-screen">
      <CategoryGrid />
      <FeaturedProducts />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/20 dark:border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✨</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              منتجات مختارة بعناية لخلق تجربة سكنية متوازنة
            </h2>
          </div>
          <p className="text-foreground/70 text-base max-w-2xl leading-relaxed">
            استكشف تشكيلتنا الشهيرة من الأثاث المعياري والإكسسوارات التي تجمع بين الطابع الوظيفي واللمسة الدافئة.
          </p>
        </div>
      </div>
      <ShopByRoom />
    </main>
  );
}
