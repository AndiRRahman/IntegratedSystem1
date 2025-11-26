import { ProductForm } from '@/components/admin/product-form';
import { products } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} />;
}
