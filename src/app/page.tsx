'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shared/product-card';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/definitions';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-main');

  const productsQuery = useMemoFirebase(
      () => firestore ? collection(firestore, 'products') : null,
      [firestore]
  );
  
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt="Hero background"
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 p-4 max-w-4xl">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight drop-shadow-lg">
              E-Commers V
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md font-body">
              Discover a curated selection of fine products. Elegance, quality, and style delivered to your doorstep.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link href={user ? '#products' : '/login'}>
                  Shop Now <ShoppingCart className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="products" className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">Featured Products</h2>
            {isLoadingProducts || isUserLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} session={user} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
