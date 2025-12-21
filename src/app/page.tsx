import CategoryGrid from '@/components/home/CategoryGrid';
import ShopByRoom from '@/components/home/ShopByRoom';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <CategoryGrid />
      <FeaturedProducts />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 p-5 sm:p-8 shadow-sm border border-primary/10">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            منتجات مختارة بعناية لخلق تجربة سكنية متوازنة
          </h2>
          <p className="text-foreground/70 text-sm max-w-2xl">
            استكشف تشكيلتنا الشهيرة من الأثاث المعياري والإكسسوارات التي تجمع بين الطابع الوظيفي واللمسة الدافئة.
          </p>
        </div>
      </div>
      <ShopByRoom />
    </main>
  );
}
