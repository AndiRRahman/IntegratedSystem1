
import MainLayout from '@/components/shared/main-layout';
import { getSession } from '@/lib/auth';
import { orders } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/lib/definitions';
import Image from 'next/image';

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

export default async function OrdersPage() {
  const session = await getSession();
  // Logika filter dipindahkan ke sini
  const userOrders = session ? orders.filter(o => o.userId === session.id) : [];

  return (
    <MainLayout>
      <h1 className="font-headline text-3xl font-bold mb-8">My Orders</h1>
      {userOrders.length > 0 ? (
        <div className="space-y-6">
          {userOrders.map(order => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id.split('-')[1]}</CardTitle>
                  <CardDescription>Date: {new Date(order.orderDate).toLocaleDateString()}</CardDescription>
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
