'use client';

import MainLayout from '@/components/shared/main-layout';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/lib/definitions';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

function getStatusVariant(status: Order['status']) {
  switch (status) {
    case 'Delivered': return 'default';
    case 'Shipped': return 'secondary';
    case 'Processing': return 'default';
    case 'Pending': return 'outline';
    case 'Cancelled': return 'destructive';
    default: return 'outline';
  }
}

export default function OrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () => 
      firestore && user
        ? query(collection(firestore, 'orders'), where('userId', '==', user.uid))
        : null,
    [firestore, user]
  );
  
  const { data: userOrders, isLoading } = useCollection<Order>(ordersQuery);

  return (
    <MainLayout>
      <h1 className="font-headline text-3xl font-bold mb-8">My Orders</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : userOrders && userOrders.length > 0 ? (
        <div className="space-y-6">
          {userOrders.map(order => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id.substring(0, 7)}</CardTitle>
                  <CardDescription>
                    Date: {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" />
                        <div>
                          <p className="font-semibold">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <p className="font-bold text-lg">Total: ${order.total.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>You have not placed any orders yet.</p>
      )}
    </MainLayout>
  );
}
