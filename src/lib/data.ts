import type { Product, User, Order } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getProductImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    return {
      imageUrl: 'https://picsum.photos/seed/default/600/800',
      imageHint: 'default image',
      description: 'A default product image.',
    };
  }
  return { imageUrl: image.imageUrl, imageHint: image.imageHint, description: image.description };
};

export const products: Product[] = [
  {
    id: '1', name: 'Modern Chair', price: 180, stock: 15, category: 'Furniture', ...getProductImage('product-1')
  },
  {
    id: '2', name: 'Sleek Laptop', price: 1200, stock: 8, category: 'Electronics', ...getProductImage('product-2')
  },
  {
    id: '3', name: 'Ceramic Mugs', price: 25, stock: 50, category: 'Homeware', ...getProductImage('product-3')
  },
  {
    id: '4', name: 'Travel Backpack', price: 75, stock: 30, category: 'Accessories', ...getProductImage('product-4')
  },
  {
    id: '5', name: 'Smart Watch', price: 250, stock: 22, category: 'Electronics', ...getProductImage('product-5')
  },
  {
    id: '6', name: 'Noise-Cancelling Headphones', price: 350, stock: 12, category: 'Electronics', ...getProductImage('product-6')
  },
];

// This mock data is no longer used for authentication but kept for reference or other potential uses.
// The password property has been removed.
export const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'USER' },
  { id: '2', name: 'Admin', email: 'admin@admin.com', role: 'ADMIN' },
];

export const orders: Order[] = [
  {
    id: 'ord-001', userId: '1',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[2], quantity: 2 },
    ],
    total: 230, status: 'Shipped', orderDate: '2023-10-20T10:00:00Z',
    customerName: 'Alice', shippingAddress: '123 Main St, Anytown, USA'
  },
  {
    id: 'ord-002', userId: '1',
    items: [{ product: products[4], quantity: 1 }],
    total: 250, status: 'Delivered', orderDate: '2023-09-15T14:30:00Z',
    customerName: 'Alice', shippingAddress: '123 Main St, Anytown, USA'
  },
    {
    id: 'ord-003', userId: '1',
    items: [
        { product: products[1], quantity: 1 },
        { product: products[3], quantity: 1 },
    ],
    total: 1275, status: 'Processing', orderDate: new Date().toISOString(),
    customerName: 'Alice', shippingAddress: '123 Main St, Anytown, USA'
  },
];
