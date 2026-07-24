export type Category = 'Perfume' | 'Clothing';
export type Language = 'en' | 'fr' | 'ar';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  stock: number;
  details?: {
    notes?: string[];
    scentFamily?: string;
    topNotes?: string[];
    heartNotes?: string[];
    baseNotes?: string[];
    materials?: string[];
    material?: string;
    color?: string;
    volume?: string;
    size?: string;
    delivery?: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SellerInformation {
  whatsapp: string;
  bankName: string;
  accountHolder: string;
  rib: string;
  iban: string;
}
