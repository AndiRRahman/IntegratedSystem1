import { orders } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = orders.find(o => o.id === params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">Order #{order.id.split('-')[1]}</h1>
        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        width={64} 
                        height={64} 
                        className="rounded-md object-cover" 
                      />
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <p className="font-bold text-lg">Total: ${order.total.toFixed(2)}</p>
            </CardFooter>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customerName.toLowerCase().replace(' ', '.')}@example.com</p>
              </div>
              <Separator />
              <div>
                <p className="font-semibold">Shipping Address</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
              </div>
              <Separator />
              <div>
                <p className="font-semibold">Order Date</p>
                <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
