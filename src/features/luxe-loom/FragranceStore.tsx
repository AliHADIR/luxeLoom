'use client';

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react';
import { ArrowUpRight, ArrowRight, Flower2, Trees, Citrus, Flame, Plus, Search, SlidersHorizontal, Droplets, Truck, MessageCircle, Package } from 'lucide-react';
import type { Product, Language } from './types';
import { STOREFRONT_COPY } from './storefront-copy';
import { selectFragrances, type FragranceFamily, type CatalogueSort, type FragranceCollection } from './fragrance-catalogue';
import { FALLBACK_PRODUCT_IMAGE } from './constants';

const scentIcons = { Fresh: Citrus, Floral: Flower2, Woody: Trees, Amber: Flame };

export default function FragranceStore({ products, language, searchQuery, setSearchQuery, onOpenProduct, onAddToCart, onGuide }: {
  products: Product[]; language: Language; searchQuery: string; setSearchQuery: (query: string) => void;
  onOpenProduct: (product: Product) => void; onAddToCart: (product: Product) => void; onGuide: () => void;
}) {
  const c = STOREFRONT_COPY[language];
  const [family, setFamily] = useState<FragranceFamily>('All');
  const [sort, setSort] = useState<CatalogueSort>('featured');
  const [setsOnly, setSetsOnly] = useState(false);
  const [collection, setCollection] = useState<FragranceCollection>('All');
  const hasCollections = products.some(product => product.category === 'Perfume' && product.details?.collection);

  const perfumes = useMemo(() => selectFragrances(products, searchQuery, family, sort, collection).filter(product => !setsOnly || product.details?.format === 'Discovery set'), [products, searchQuery, family, sort, setsOnly, collection]);
  const hasDiscoverySets = products.some(product => product.category === 'Perfume' && product.details?.format === 'Discovery set');
  const scrollToCollection = () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  const chooseFamily = (value: FragranceFamily) => { setFamily(value); setSetsOnly(false); setCollection('All'); setSearchQuery(''); scrollToCollection(); };
  const clearFilters = () => { setFamily('All'); setSetsOnly(false); setSearchQuery(''); setSort('featured'); setCollection('All'); };
  const price = (value: number) => new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value);
  return <div className="perfume-store">
    <section className="ps-hero">
      <div className="ps-hero-copy"><span className="ps-eyebrow">LUXE & LOOM · {c.eyebrow}</span><h1>{c.hero}<br /><em>{c.heroItalic}</em></h1><p>{c.intro}</p><div className="ps-hero-actions"><button className="ps-primary" onClick={() => { clearFilters(); scrollToCollection(); }}>{c.shop}<ArrowRight size={17} /></button><button className="ps-text-link" onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>{c.explore}<ArrowUpRight size={17} /></button></div><div className="ps-hero-foot"><span>01 — {c.imageCaption}</span><span>FRAGRANCE BOUTIQUE</span></div></div>
      <div className="ps-hero-visual"><img src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=85&w=1200" alt={c.imageCaption} fetchPriority="high" /><div className="ps-image-caption"><Droplets size={18} /><span>{c.imageCaption}</span><span>L&L</span></div></div>
    </section>
    <section id="discover" className="ps-section ps-discover"><div className="ps-section-title"><div><span className="ps-eyebrow">{c.familiesEyebrow}</span><h2>{c.familiesTitle}</h2></div><button className="ps-text-link" onClick={onGuide}>{c.navGuide}<ArrowUpRight size={16} /></button></div><div className="ps-scent-grid">{(Object.keys(scentIcons) as Array<keyof typeof scentIcons>).map(value => { const Icon = scentIcons[value]; return <button key={value} className={`ps-scent ps-scent-${value.toLowerCase()}`} onClick={() => chooseFamily(value)} aria-pressed={family === value && !setsOnly}><Icon size={30} strokeWidth={1.2} /><span><strong>{c.families[value]}</strong><small>{c.familyDescriptions[value]}</small></span><ArrowUpRight size={17} /></button>; })}</div></section>
    <section id="products" className="ps-section ps-products"><div className="ps-section-title"><div><span className="ps-eyebrow">{c.collectionEyebrow}</span><h2>{c.collectionTitle}</h2><p>{c.collectionIntro}</p></div><span className="ps-count" role="status">{perfumes.length} {c.count}</span></div>
      <div className="ps-catalogue-controls"><div className="ps-family-filters" aria-label={c.familiesTitle}>{(['All', 'Fresh', 'Floral', 'Woody', 'Amber'] as FragranceFamily[]).map(value => <button key={value} aria-pressed={family === value && !setsOnly} onClick={() => { setFamily(value); setSetsOnly(false); }}>{c.families[value]}</button>)}{setsOnly && <button aria-pressed="true" onClick={clearFilters}>{c.samplesCta} ×</button>}</div><label className="ps-sort"><SlidersHorizontal size={14} /><span className="sr-only">{c.sort}</span><select aria-label={c.sort} value={sort} onChange={event => setSort(event.target.value as CatalogueSort)}><option value="featured">{c.featured}</option><option value="price-low">{c.lowPrice}</option><option value="price-high">{c.highPrice}</option></select></label></div>
      {hasCollections && <div className="ps-collection-filters" aria-label={c.collectionEyebrow}>{(['All', 'Niche', 'Designer'] as FragranceCollection[]).map(value => <button key={value} aria-pressed={collection === value} onClick={() => setCollection(value)}>{value === 'All' ? c.families.All : value}</button>)}</div>}
      <label className="ps-search"><Search size={17} /><input aria-label={c.search} placeholder={c.search} value={searchQuery} onChange={event => setSearchQuery(event.target.value)} type="search" />{(searchQuery || family !== 'All' || setsOnly || collection !== 'All') && <button onClick={clearFilters}>{c.clear}</button>}</label>
      <div className="ps-product-grid">{perfumes.map(product => <article className="ps-product" key={product.id}><button className="ps-product-image" onClick={() => onOpenProduct(product)} aria-label={`${c.view}: ${product.name}`}><img src={product.image || FALLBACK_PRODUCT_IMAGE} alt={product.name} loading="lazy" onError={event => { if (event.currentTarget.src !== FALLBACK_PRODUCT_IMAGE) event.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }} /><span className={`ps-stock ${product.stock > 0 ? '' : 'ps-stock-out'}`}>{product.stock > 0 ? c.inStock : c.soldOut}</span><span className="ps-image-arrow"><ArrowUpRight size={19} /></span></button><div className="ps-product-info"><span className="ps-product-brand">{product.details?.brand || product.details?.scentFamily || c.collectionEyebrow}</span><h3><button onClick={() => onOpenProduct(product)}>{product.name}</button></h3><div className="ps-product-meta">{[product.details?.concentration, product.details?.volume].filter(Boolean).join(' · ')}</div><p>{product.description}</p><div className="ps-product-bottom"><strong>{price(product.price)}</strong><button disabled={product.stock <= 0} onClick={() => onAddToCart(product)} aria-label={`${c.add}: ${product.name}`}><Plus size={16} />{product.stock > 0 ? c.add : c.soldOut}</button></div></div></article>)}</div>
      {perfumes.length === 0 && <div className="ps-empty"><Package size={36} strokeWidth={1} /><h3>{c.empty}</h3><p>{c.emptyHelp}</p><button className="ps-primary" onClick={clearFilters}>{c.families.All}<ArrowRight size={16} /></button></div>}
    </section>
    <section className="ps-discovery-banner"><div className="ps-discovery-mark" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div><div><span className="ps-eyebrow">{c.discoveryEyebrow}</span><h2>{hasDiscoverySets ? c.samplesTitle : c.discoveryTitle}</h2><p>{hasDiscoverySets ? c.samplesIntro : c.discoveryIntro}</p></div><button className="ps-primary" onClick={() => { if (hasDiscoverySets) { setFamily('All'); setSearchQuery(''); setSetsOnly(true); setCollection('All'); scrollToCollection(); } else onGuide(); }}>{hasDiscoverySets ? c.samplesCta : c.discoveryCta}<ArrowUpRight size={17} /></button></section>
    <section id="help" className="ps-section ps-help"><div className="ps-section-title"><div><span className="ps-eyebrow">{c.helpEyebrow}</span><h2>{c.helpTitle}</h2></div></div><div className="ps-help-grid">{c.helpCards.map((card, index) => { const Icon = [Droplets, Truck, MessageCircle][index]; return <article key={card.title}><Icon size={24} strokeWidth={1.3} /><h3>{card.title}</h3><p>{card.text}</p></article>; })}</div><div className="ps-faq"><h3>{c.faqTitle}</h3><div>{c.faqs.map(faq => <details key={faq.q}><summary>{faq.q}<Plus size={16} /></summary><p>{faq.a}</p></details>)}</div></div></section>
  </div>;
}
