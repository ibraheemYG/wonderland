import ProductsPageClient from '@/components/product/ProductsPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;

  return <ProductsPageClient selectedCategory={category} />;
}
