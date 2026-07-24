import { Product, SellerInformation } from './types';

export const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1560362614-89027598847b?auto=format&fit=crop&q=80&w=800';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Midnight Bloom',
    description: 'A mysterious blend of night-blooming jasmine and dark vanilla.',
    price: 120,
    category: 'Perfume',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    stock: 15,
    details: {
      scentFamily: 'Floral Amber',
      topNotes: ['Bergamot', 'Pink pepper'],
      heartNotes: ['Night jasmine', 'Orange blossom'],
      baseNotes: ['Dark vanilla', 'Soft musk'],
      volume: '50 ml',
      delivery: 'Delivery in 24-48 hours in major cities'
    }
  },
  {
    id: '2',
    name: 'Silk Evening Gown',
    description: 'Hand-stitched mulberry silk gown with a cascading silhouette.',
    price: 450,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
    stock: 5,
    details: {
      materials: ['Mulberry silk', 'Hand-finished seams', 'Satin lining'],
      material: 'Mulberry silk',
      color: 'Champagne ivory',
      size: 'Available in S, M, L',
      delivery: 'Delivery in 2-4 business days'
    }
  },
  {
    id: '3',
    name: 'Oud Noir',
    description: 'Deep, woody notes of agarwood balanced with spicy saffron.',
    price: 185,
    category: 'Perfume',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    stock: 10,
    details: {
      scentFamily: 'Woody Spicy',
      topNotes: ['Saffron', 'Cardamom'],
      heartNotes: ['Agarwood', 'Cedarwood'],
      baseNotes: ['Amber spice', 'Leather'],
      volume: '75 ml',
      delivery: 'Delivery in 24-48 hours in major cities'
    }
  },
  {
    id: '4',
    name: 'Cashmere Overcoat',
    description: 'Timeless tailored coat made from the finest Mongolian cashmere.',
    price: 890,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800',
    stock: 8,
    details: {
      materials: ['Mongolian cashmere', 'Horn buttons', 'Cupro lining'],
      material: 'Mongolian cashmere',
      color: 'Charcoal',
      size: 'Available in M, L, XL',
      delivery: 'Delivery in 2-4 business days'
    }
  },
  {
    id: '5',
    name: 'Velvet Rose',
    description: 'A romantic bouquet of damask rose and smoky amber.',
    price: 95,
    category: 'Perfume',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800',
    stock: 20,
    details: {
      scentFamily: 'Floral Musk',
      topNotes: ['Pink pepper', 'Lychee'],
      heartNotes: ['Damask rose', 'Peony'],
      baseNotes: ['Smoky amber', 'White musk'],
      volume: '50 ml',
      delivery: 'Delivery in 24-48 hours in major cities'
    }
  },
  {
    id: '6',
    name: 'Linen Summer Set',
    description: 'Breathable organic linen shirt and trousers for effortless style.',
    price: 210,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
    stock: 12,
    details: {
      materials: ['Organic linen', 'Mother-of-pearl buttons', 'Relaxed tailoring'],
      material: 'Organic linen',
      color: 'Natural oat',
      size: 'Available in S, M, L, XL',
      delivery: 'Delivery in 2-4 business days'
    }
  }
];

export const DEFAULT_SELLER_INFORMATION: SellerInformation = {
  whatsapp: '+212 600-000000',
  bankName: 'CIH Bank',
  accountHolder: 'Luxe & Loom Boutique',
  rib: '230 780 0000000000000000 00',
  iban: 'MA64 2307 8000 0000 0000 0000 0000',
};
