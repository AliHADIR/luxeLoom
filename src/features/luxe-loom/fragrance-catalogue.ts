import type { Product } from './types';

export type FragranceFamily = 'All' | 'Fresh' | 'Floral' | 'Woody' | 'Amber';
export type FragranceCollection = 'All' | 'Niche' | 'Designer';
export type CatalogueSort = 'featured' | 'price-low' | 'price-high';
const familyPatterns: Record<Exclude<FragranceFamily, 'All'>, RegExp> = {
  Fresh: /fresh|citrus|hesperid|fraich|aquatic|marine|حمضي|منعش/,
  Floral: /floral|fleur|زهري/,
  Woody: /wood|bois|خشبي/,
  Amber: /amber|ambre|oriental|عنبر|شرقي/,
};
export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
export function selectFragrances(products: Product[], query = '', family: FragranceFamily = 'All', sort: CatalogueSort = 'featured', collection: FragranceCollection = 'All') {
  const results = products.filter(product => {
    if (product.category !== 'Perfume') return false;
    const detail = product.details;
    const searchable = [product.name, product.description, detail?.brand, detail?.scentFamily, detail?.concentration, ...(detail?.topNotes ?? []), ...(detail?.heartNotes ?? []), ...(detail?.baseNotes ?? [])].filter(Boolean).join(' ');
    const matchesSearch = normalizeSearch(searchable).includes(normalizeSearch(query.trim()));
    const matchesFamily = family === 'All' || familyPatterns[family].test(normalizeSearch(detail?.scentFamily ?? ''));
    return matchesSearch && matchesFamily && (collection === 'All' || detail?.collection === collection);
  });
  if (sort !== 'featured') results.sort((a, b) => sort === 'price-low' ? a.price - b.price : b.price - a.price);
  return results;
}
