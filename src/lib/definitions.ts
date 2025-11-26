export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  stock: number;
  category: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
  customerName: string;
  shippingAddress: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
};
