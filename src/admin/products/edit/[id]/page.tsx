
'use client'

import { ProductForm } from '@/components/admin/product-form';
import { notFound, useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

function EditProductSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-1/3" />
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    );
}


export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const productRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'products', id) : null),
    [firestore, id]
  );
  
  const { data: product, isLoading } = useDoc<Product>(productRef);
  
  if (isLoading) {
    return <EditProductSkeleton />;
  }

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} />;
}
