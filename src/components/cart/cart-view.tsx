'use client';

import { useCart } from '@/context/cart-provider';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart } from 'lucide-react';

export function CartView() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, itemCount } = useCart();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-3xl font-bold">Your Cart</h1>
        <span className="text-muted-foreground">{itemCount} item(s)</span>
      </div>
      {cartItems.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="mt-6">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <Card key={item.product.id} className="flex items-center p-4">
                <div className="relative w-24 h-24 rounded-md overflow-hidden shrink-0">
                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                    className="w-16 text-center"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)} aria-label="Remove item">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="ml-4 w-20 text-right font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
