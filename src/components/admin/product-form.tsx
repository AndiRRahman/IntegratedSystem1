
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/definitions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { uploadProductImage, upsertProduct } from '@/lib/actions';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  stock: z.coerce.number().min(0, 'Stock must be a positive number.'),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(product?.imageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
        }
      : {
          name: '',
          description: '',
          price: 0,
          stock: 0,
          imageUrl: 'https://placehold.co/600x400/EEE/31343C',
        },
  });

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    let finalImageUrl = product?.imageUrl;

    try {
      // 1. Upload image if a new one is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResult = await uploadProductImage(formData);

        if (uploadResult.error || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Image upload failed');
        }
        finalImageUrl = uploadResult.url;
      }
      
      if (!finalImageUrl) {
          throw new Error('Product image is required.');
      }

      // 2. Prepare product data
      const productPayload: Partial<Product> = {
        ...data,
        id: product?.id, // Include ID if editing
        imageUrl: finalImageUrl,
      };

      // 3. Save product data to Firestore
      const saveResult = await upsertProduct(productPayload);
      if (saveResult.error) {
        throw new Error(saveResult.error);
      }
      
      toast({
        title: product ? 'Product Updated' : 'Product Created',
        description: `The product "${data.name}" has been successfully saved.`,
      });
      router.push('/admin/products');
      router.refresh(); // Refresh server components to show new product

    } catch (error: any) {
      console.error("Failed to save product:", error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{product ? 'Edit Product' : 'Add a New Product'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 rounded-md border flex items-center justify-center bg-muted overflow-hidden">
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Product preview" fill className="object-cover" />
                        ) : (
                            <span className="text-xs text-muted-foreground">No Image</span>
                        )}
                    </div>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Upload Image
                    </Button>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleImageChange}
                    />
                </div>
              </FormControl>
              <FormDescription>
                Upload an image for your product (JPG, PNG, GIF).
              </FormDescription>
              <FormMessage />
            </FormItem>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Modern Chair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the product in detail..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
             </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
