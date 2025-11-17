import ProductDetailsPageWrapper from '@/components/product/ProductDetailsPage';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailsPageWrapper id={id} />;
}
