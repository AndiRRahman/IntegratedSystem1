import MainLayout from '@/components/shared/main-layout';
import { products } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-square relative rounded-lg overflow-hidden border bg-card">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">{product.category}</span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="flex items-center text-accent">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current text-muted" />
             </div>
             <span className="text-muted-foreground text-sm">(123 ratings)</span>
          </div>
          <p className="mt-4 font-body text-muted-foreground">{product.description}</p>
          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.stock > 0 ? (
                <span className="text-sm font-medium text-green-600">In Stock ({product.stock} left)</span>
            ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
            )}
          </div>
          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
