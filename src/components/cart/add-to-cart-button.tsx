'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-provider';
import type { Product } from '@/lib/definitions';
import { ShoppingCart } from 'lucide-react';

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Button size="lg" onClick={() => addToCart(product)} disabled={product.stock === 0} className="w-full md:w-auto">
      <ShoppingCart className="mr-2 h-5 w-5" />
      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
    </Button>
  );
}
