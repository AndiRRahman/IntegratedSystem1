'use client';

import MainLayout from '@/components/shared/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useCart } from '@/context/cart-provider';
import { createOrder } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cegah akses checkout jika keranjang kosong (kecuali sudah sukses)
  useEffect(() => {
    if (cartItems.length === 0 && !isSuccess) {
        // Redirect atau biarkan tampil pesan kosong
    }
  }, [cartItems, isSuccess]);

  const handleCheckout = async () => {
    setIsSubmitting(true);

    try {
      const result = await createOrder(cartItems, cartTotal);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        clearCart(); // Kosongkan keranjang lokal
        setIsSuccess(true); // Tampilkan status sukses
        toast({
          title: "Success",
          description: "Order placed successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
        <MainLayout>
          <div className="max-w-2xl mx-auto py-16">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl text-green-600">Order Confirmed!</CardTitle>
                <CardDescription>Thank you for your purchase.</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Your order has been successfully recorded in our system.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/orders">View My Orders</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="font-headline text-3xl font-bold mb-8">Checkout</h1>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your items before proceeding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Your cart is empty.</p>
            ) : (
                cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                    <p className="font-medium">{item.product.name} (x{item.quantity})</p>
                    <p className="text-sm text-muted-foreground">${item.product.price}</p>
                    </div>
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                ))
            )}
            <div className="flex justify-between pt-4 font-bold text-lg">
                <span>Total Amount</span>
                <span>${cartTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
                className="w-full" 
                size="lg" 
                onClick={handleCheckout} 
                disabled={isSubmitting || cartItems.length === 0}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay $${cartTotal.toFixed(2)}`
                )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}