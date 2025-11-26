import MainLayout from '@/components/shared/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Checkout</CardTitle>
            <CardDescription>Thank you for your order!</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Your order has been successfully placed. This is a demo application, so no real payment was processed.
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
