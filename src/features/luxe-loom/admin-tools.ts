import type { Product } from './types';

export function csvCell(value: unknown): string {
  const text = String(value ?? '');
  // Spreadsheet applications can execute cells starting with a formula marker.
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function inventoryCsv(products: Product[]): string {
  const rows: unknown[][] = [['ID', 'SKU', 'Product', 'Brand', 'Category', 'Price (MAD)', 'Stock', 'Stock value (MAD)', 'Scent family', 'Concentration', 'Volume / size', 'Updated']];
  products.forEach(product => rows.push([product.id, product.sku, product.name, product.brand, product.category, product.price, product.stock, product.price * product.stock, product.details?.scentFamily, product.details?.concentration, product.details?.volume || product.details?.size, product.updatedAt]));
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadInventory(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
