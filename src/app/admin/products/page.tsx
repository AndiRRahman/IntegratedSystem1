'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/definitions';

export default function AdminProductsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const productsQuery = useMemoFirebase(
        () => firestore ? collection(firestore, 'products') : null,
        [firestore]
    );

    const { data: products, isLoading } = useCollection<Product>(productsQuery);

    const handleDelete = async (productId: string) => {
        if (!firestore) return;
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(firestore, 'products', productId));
                toast({ title: "Product deleted", description: "The product has been successfully removed." });
            } catch (error) {
                console.error("Error deleting product:", error);
                toast({ 
                    title: "Error", 
                    description: "Failed to delete product.", 
                    variant: "destructive" 
                });
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-bold">Products</h1>
                <Button asChild>
                    <Link href="/admin/products/add">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="hidden md:table-cell">Stock</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16">
                                        <Loader2 className="animate-spin inline-block h-8 w-8 text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : products && products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="relative h-16 w-16">
                                                <Image
                                                    alt={product.name}
                                                    className="rounded-md object-cover"
                                                    fill
                                                    src={product.imageUrl || 'https://placehold.co/100x100'}
                                                    sizes="100px"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.stock > 5 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                        <TableCell>
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
                                                        <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600 focus:text-red-500 focus:bg-red-50">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                                        No products found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
