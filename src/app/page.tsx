import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/shared/product-card';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { ShoppingCart } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default async function HomePage() {
  const session = await getSession();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-main');

  return (
    <div className="flex flex-col min-h-screen">
      <Header session={session} />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          <Image
            src={heroImage?.imageUrl || 'https://picsum.photos/seed/hero/1200/800'}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage?.imageHint || 'modern living'}
          />
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
                <Link href={session ? '#products' : '/login'}>
                  Shop Now <ShoppingCart className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="products" className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} session={session} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
