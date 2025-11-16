import ProductsPageClient from '@/components/product/ProductsPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ProductsPageProps = {
  searchParams: {
    category?: string;
  };
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const selectedCategory = searchParams.category;

  return <ProductsPageClient selectedCategory={selectedCategory} />;
}
