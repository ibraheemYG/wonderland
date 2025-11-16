import ProductDetailsPageWrapper from '@/components/product/ProductDetailsPage';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  return <ProductDetailsPageWrapper id={params.id} />;
}
