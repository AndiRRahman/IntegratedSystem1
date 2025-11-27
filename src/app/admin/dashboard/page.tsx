'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { DollarSign, Package, Users, CreditCard, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Order } from '@/lib/definitions';

const initialSalesData = [
  { name: 'Jan', total: 0 }, { name: 'Feb', total: 0 },
  { name: 'Mar', total: 0 }, { name: 'Apr', total: 0 },
  { name: 'May', total: 0 }, { name: 'Jun', total: 0 },
  { name: 'Jul', total: 0 }, { name: 'Aug', total: 0 },
  { name: 'Sep', total: 0 }, { name: 'Oct', total: 0 },
  { name: 'Nov', total: 0 }, { name: 'Dec', total: 0 },
];

export default function AdminDashboardPage() {
    const [salesData, setSalesData] = useState(initialSalesData);
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(
      () => firestore ? collection(firestore, 'orders') : null,
      [firestore]
    );

    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

    const totalOrders = orders?.length ?? 0;
    const totalRevenue = orders?.reduce((acc, order) => acc + order.total, 0) ?? 0;

    useEffect(() => {
        const generatedData = initialSalesData.map(item => ({
            ...item,
            total: Math.floor(Math.random() * 5000) + 1000,
        }));
        setSalesData(generatedData);
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingOrders ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>}
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingOrders ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">+{totalOrders}</div> }
                        <p className="text-xs text-muted-foreground">Total orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+120</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">143</div>
                        <p className="text-xs text-muted-foreground">Total products available</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesData}>
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`}/>
                            <Tooltip
                                cursor={{fill: 'hsla(var(--muted), 0.5)'}}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)'
                                }}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
