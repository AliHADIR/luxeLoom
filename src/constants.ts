import { Product } from './types';
import midnightBloomImage from '../Images/catalog/soft-florals.jpg';
import oudNoirImage from '../Images/catalog/stone-bottle.jpg';
import velvetRoseImage from '../Images/catalog/femme-dried-florals.jpg';
import hommeNoirImage from '../Images/catalog/homme-noir.jpg';
import blackBottleImage from '../Images/catalog/black-bottle.jpg';
import roseImage from '../Images/catalog/femme-roses.jpg';
import flowerBottleImage from '../Images/catalog/flower-bottle.jpg';
import amberImage from '../Images/catalog/amber-noir.jpg';
import nicheOudImage from '../Images/catalog/niche-oud.jpg';

export const LEGACY_CATALOG_IMAGES: Record<string, string> = {
  'soft-florals.jpg': midnightBloomImage,
  'stone-bottle.jpg': oudNoirImage,
  'femme-dried-florals.jpg': velvetRoseImage,
  'homme-noir.jpg': hommeNoirImage,
  'black-bottle.jpg': blackBottleImage,
  'femme-roses.jpg': roseImage,
  'flower-bottle.jpg': flowerBottleImage,
  'amber-noir.jpg': amberImage,
  'niche-oud.jpg': nicheOudImage,
};

const BASE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Midnight Bloom',
    description: 'A mysterious blend of night-blooming jasmine and dark vanilla.',
    price: 120,
    category: 'Femme',
    image: midnightBloomImage,
    stock: 15
  },
  {
    id: '3',
    name: 'Oud Noir',
    description: 'Deep, woody notes of agarwood balanced with spicy saffron.',
    price: 185,
    category: 'Niche',
    image: oudNoirImage,
    stock: 10
  },
  {
    id: '5',
    name: 'Velvet Rose',
    description: 'A romantic bouquet of damask rose and smoky amber.',
    price: 95,
    category: 'Femme',
    image: velvetRoseImage,
    stock: 20
  }
];

export const CATALOG_ADDITIONS: Product[] = [
  { id: '6', name: 'Atlas Vetiver', description: 'Crisp bergamot and aromatic vetiver settle into a refined cedarwood base.', price: 145, category: 'Homme', image: hommeNoirImage, stock: 12, fragranceFamily: 'Woody aromatic', size: '50 ml' },
  { id: '7', name: 'Cedar Coast', description: 'Fresh citrus and sea air meet smooth cedar and warm amber.', price: 130, category: 'Homme', image: blackBottleImage, stock: 14, fragranceFamily: 'Fresh woody', size: '50 ml' },
  { id: '8', name: 'Rose Éclat', description: 'Velvety rose petals brighten a graceful blend of musk and soft woods.', price: 110, category: 'Femme', image: roseImage, stock: 16, fragranceFamily: 'Floral', size: '50 ml' },
  { id: '9', name: 'Petal Veil', description: 'A luminous bouquet of white flowers wrapped in creamy vanilla.', price: 125, category: 'Femme', image: flowerBottleImage, stock: 11, fragranceFamily: 'Floral oriental', size: '50 ml' },
  { id: '10', name: 'Amber Ritual', description: 'Resinous amber, incense and spice unfold over a deep, polished wood accord.', price: 210, category: 'Niche', image: amberImage, stock: 8, fragranceFamily: 'Amber', size: '50 ml' },
  { id: '11', name: 'Saffron Oud', description: 'Smoky oud and luminous saffron create a bold, long-lasting signature.', price: 235, category: 'Niche', image: nicheOudImage, stock: 7, fragranceFamily: 'Woody oriental', size: '50 ml' },
];

export const INITIAL_PRODUCTS: Product[] = [...BASE_PRODUCTS, ...CATALOG_ADDITIONS];
