import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product, User } from '@/lib/definitions';
import { ShoppingCart } from 'lucide-react';

export function ProductCard({ product, session }: { product: Product, session: User | null }) {
  const linkHref = session ? `/products/${product.id}` : '/login';

  return (
    <Card className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={linkHref} className="block aspect-[3/4] relative overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={product.imageHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <span className="text-xs text-muted-foreground uppercase">{product.category}</span>
        <CardTitle className="font-headline text-lg mt-1">
          <Link href={linkHref} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
        <Button asChild size="sm" variant="outline">
          <Link href={linkHref}>
            {session ? 'View' : 'Login to View'}
            <ShoppingCart className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
