'use client'
import { orders } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import type { Order } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

const orderStatuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

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

export default function AdminOrdersPage() {
    const [currentOrders, setCurrentOrders] = useState<Order[]>(orders);

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        setCurrentOrders(currentOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        // In a real app, you would also make an API call to update the status in the database.
    };
    
    return (
        <div className="space-y-8">
            <h1 className="font-headline text-3xl font-bold">Orders</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden sm:table-cell">Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.customerName}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {order.customerName.toLowerCase().replace(' ', '.')}@example.com
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Badge variant={getStatusVariant(order.status)} className="cursor-pointer">{order.status}</Badge>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                {orderStatuses.map(status => (
                                                    <DropdownMenuItem key={status} onSelect={() => handleStatusChange(order.id, status)}>
                                                        {status}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/orders/${order.id}`}>View Order</Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}