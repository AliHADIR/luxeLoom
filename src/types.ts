export type Category = 'Homme' | 'Femme' | 'Niche';
export type Language = 'en' | 'fr' | 'ar';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  stock: number;
  secondaryImage?: string;
  fragranceFamily?: string;
  size?: string;
  isActive?: boolean;
}

export type DecantSizeMl = 10 | 15 | 20;

export interface CartItem extends Product {
  quantity: number;
  decantMl?: DecantSizeMl;
  variantKey?: string;
}

export type OrderStatus = 'New' | 'Confirmed' | 'Fulfilled' | 'Cancelled';

export interface StoreOrder {
  id: string;
  createdAt: string;
  customer: { name: string; phone: string; address: string; city: string };
  items: CartItem[];
  total: number;
  status: OrderStatus;
}
