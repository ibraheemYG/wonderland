import CategoryGrid from '@/components/home/CategoryGrid';
import ShopByRoom from '@/components/home/ShopByRoom';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <CategoryGrid />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-secondary/60 dark:bg-secondary/30 p-6 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            منتجات مختارة بعناية لخلق تجربة سكنية متوازنة
          </h2>
          <p className="text-foreground/70 max-w-3xl">
            استكشف تشكيلتنا الشهيرة من الأثاث المعياري، الإكسسوارات الخشبية، والنسيجيات التي تجمع بين الطابع الوظيفي واللمسة الدافئة المستوحاة من الطبيعة الاسكندنافية.
          </p>
        </div>
      </div>
      <ShopByRoom />
      <FeaturedProducts />
    </main>
  );
}
