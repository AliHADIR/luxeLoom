'use client';

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  Edit2,
  Copy,
  Download,
  Minus,
  RotateCcw,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Package,
  Check,
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  Landmark,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Product, CartItem, Category, Language, SellerInformation } from './types';
import { CATALOG_ADDITION_IDS, DEFAULT_SELLER_INFORMATION, FALLBACK_PRODUCT_IMAGE, INITIAL_PRODUCTS } from './constants';
import { TRANSLATIONS } from './translations';
import Fragranea from './Fragranea';
import { downloadInventory, inventoryCsv } from './admin-tools';
import FragranceStore from './FragranceStore';
import { STOREFRONT_COPY } from './storefront-copy';
import { words } from './StoreEnhancements';

export default function App({ adminMode = false, informationMode = false }: { adminMode?: boolean; informationMode?: boolean }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = TRANSLATIONS[language];
  const c = STOREFRONT_COPY[language];
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sellerInformation, setSellerInformation] = useState<SellerInformation>(DEFAULT_SELLER_INFORMATION);
  
  const [cart, setCart] = useState<CartItem[]>([]);

  const activeTab: 'store' | 'admin' = adminMode ? 'admin' : 'store';
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [catalogueReset, setCatalogueReset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminStock, setAdminStock] = useState('all');
  const [adminSort, setAdminSort] = useState('name');
  const [stockUndo, setStockUndo] = useState<{ id: string; before: number; after: number } | null>(null);
  const [adminNotice, setAdminNotice] = useState('');
  const [adminCategory, setAdminCategory] = useState<Category | 'All'>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutDetails, setShowCheckoutDetails] = useState(false);
  const [checkoutCustomer, setCheckoutCustomer] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalCategory, setModalCategory] = useState<Category>('Perfume');
  const [modalImagePreview, setModalImagePreview] = useState(FALLBACK_PRODUCT_IMAGE);
  const [modalImageFailed, setModalImageFailed] = useState(false);
  const [hasRestoredLocalState, setHasRestoredLocalState] = useState(false);

  // The imported app persists storefront state locally; restore it after hydration.
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('luxe_loom_lang') as Language | null;
      const savedProducts = localStorage.getItem('luxe_loom_products');
      const savedSellerInformation = localStorage.getItem('luxe_loom_seller_information');
      const savedCart = localStorage.getItem('luxe_loom_cart');

      if (savedLanguage && ['en', 'fr', 'ar'].includes(savedLanguage)) setLanguage(savedLanguage);
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        if (Array.isArray(parsedProducts)) {
          const migrationKey = 'luxe_loom_catalog_additions_v1';
          if (!localStorage.getItem(migrationKey)) {
            const existingIds = new Set(parsedProducts.map((product: Product) => product.id));
            const additions = INITIAL_PRODUCTS.filter(product => CATALOG_ADDITION_IDS.includes(product.id) && !existingIds.has(product.id));
            setProducts([...parsedProducts, ...additions]);
            localStorage.setItem(migrationKey, 'done');
          } else setProducts(parsedProducts);
        }
      }
      if (savedSellerInformation) setSellerInformation({ ...DEFAULT_SELLER_INFORMATION, ...JSON.parse(savedSellerInformation) });
      if (savedCart) setCart(JSON.parse(savedCart));
    } finally {
      setHasRestoredLocalState(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredLocalState) return;
    localStorage.setItem('luxe_loom_products', JSON.stringify(products));
  }, [products, hasRestoredLocalState]);

  useEffect(() => {
    if (!hasRestoredLocalState) return;
    localStorage.setItem('luxe_loom_seller_information', JSON.stringify(sellerInformation));
  }, [sellerInformation, hasRestoredLocalState]);

  useEffect(() => {
    if (!hasRestoredLocalState) return;
    localStorage.setItem('luxe_loom_cart', JSON.stringify(cart));
  }, [cart, hasRestoredLocalState]);

  useEffect(() => {
    if (!hasRestoredLocalState) return;
    localStorage.setItem('luxe_loom_lang', language);
    document.documentElement.dir = !informationMode && language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = informationMode ? 'fr' : language;
  }, [language, informationMode, hasRestoredLocalState]);

  useEffect(() => {
    if (cart.length === 0) {
      setShowCheckoutDetails(false);
    }
  }, [cart.length]);

  useEffect(() => {
    if (selectedProductId && !products.some(product => product.id === selectedProductId)) {
      setSelectedProductId(null);
    }
  }, [products, selectedProductId]);

  useEffect(() => {
    if (editingProduct) {
      setModalCategory(editingProduct.category);
      setModalImagePreview(editingProduct.image || FALLBACK_PRODUCT_IMAGE);
      setModalImageFailed(false);
      return;
    }

    if (showAddModal) {
      setModalCategory('Perfume');
      setModalImagePreview(FALLBACK_PRODUCT_IMAGE);
      setModalImageFailed(false);
    }
  }, [editingProduct, showAddModal]);

  const adminProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = adminCategory === 'All' || product.category === adminCategory;
      const matchesSearch = `${product.name} ${product.description} ${product.sku || ''} ${product.brand || ''}`.toLowerCase().includes(adminSearchQuery.toLowerCase());
      const matchesStock = adminStock === 'all' || (adminStock === 'out' ? product.stock === 0 : adminStock === 'low' ? product.stock > 0 && product.stock <= 5 : product.stock > 5);
      return matchesCategory && matchesSearch && matchesStock;
    }).sort((a, b) => adminSort === 'stock' ? a.stock - b.stock : adminSort === 'value' ? b.price * b.stock - a.price * a.stock : a.name.localeCompare(b.name));
  }, [products, adminCategory, adminSearchQuery, adminStock, adminSort]);

  const inventoryStats = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
    const lowStockCount = products.filter(product => product.stock <= 5).length;

    return {
      totalProducts: products.length,
      totalStock,
      inventoryValue,
      lowStockCount,
    };
  }, [products]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find(product => product.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setShowCheckoutDetails(false);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.min(item.stock, Math.max(1, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const whatsappNumber = sellerInformation.whatsapp.replace(/\D/g, '');

  const resolveProductImage = (image?: string) => image || FALLBACK_PRODUCT_IMAGE;

  const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== FALLBACK_PRODUCT_IMAGE) {
      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
    }
  };

  const splitList = (value: FormDataEntryValue | null) => {
    if (typeof value !== 'string') return undefined;
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  };

  const buildProductDetails = (formData: FormData, category: Category): Product['details'] => {
    if (category === 'Perfume') {
      return {
        notes: splitList(formData.get('notes')),
        brand: formData.get('brand') as string || undefined,
        concentration: formData.get('concentration') as string || undefined,
        collection: (formData.get('collection') || undefined) as 'Niche' | 'Designer' | undefined,
        format: (formData.get('format') || undefined) as 'Full bottle' | 'Discovery set' | undefined,
        occasions: splitList(formData.get('occasions')),
        scentFamily: formData.get('scentFamily') as string || undefined,
        topNotes: splitList(formData.get('topNotes')),
        heartNotes: splitList(formData.get('heartNotes')),
        baseNotes: splitList(formData.get('baseNotes')),
        volume: formData.get('volume') as string || undefined,
        delivery: formData.get('delivery') as string || undefined,
      };
    }

    return {
      material: formData.get('material') as string || undefined,
      materials: splitList(formData.get('material')),
      color: formData.get('color') as string || undefined,
      size: formData.get('size') as string || undefined,
      delivery: formData.get('delivery') as string || undefined,
    };
  };

  const checkoutFormIsComplete = Boolean(
    checkoutCustomer.name.trim() &&
    checkoutCustomer.phone.trim() &&
    checkoutCustomer.city.trim() &&
    checkoutCustomer.address.trim()
  );

  const checkoutWhatsappUrl = useMemo(() => {
    const orderLines = cart.map(item => (
      `- ${item.name} x${item.quantity}: ${item.price * item.quantity} ${t.currency}`
    ));
    const customerLines = [
      `${t.checkout.form.name}: ${checkoutCustomer.name.trim()}`,
      `${t.checkout.form.phone}: ${checkoutCustomer.phone.trim()}`,
      `${t.checkout.form.city}: ${checkoutCustomer.city.trim()}`,
      `${t.checkout.form.address}: ${checkoutCustomer.address.trim()}`,
      checkoutCustomer.notes.trim() ? `${t.checkout.form.notes}: ${checkoutCustomer.notes.trim()}` : null,
    ].filter(Boolean);
    const message = [
      t.checkout.messageGreeting,
      '',
      ...orderLines,
      '',
      `${t.cart.total}: ${cartTotal} ${t.currency}`,
      '',
      t.checkout.customerDetails,
      ...customerLines,
      '',
      t.checkout.messageDelivery,
    ].join('\n');

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [cart, cartTotal, checkoutCustomer, t, whatsappNumber]);

  const handleSellerInformationUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setSellerInformation({
      whatsapp: formData.get('whatsapp') as string,
      bankName: formData.get('bankName') as string,
      accountHolder: formData.get('accountHolder') as string,
      rib: formData.get('rib') as string,
      iban: formData.get('iban') as string,
    });
    setAdminNotice(words(language, 'Seller details saved.', 'Coordonnées enregistrées.', 'تم حفظ بيانات البائع.'));
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as Category;
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category,
      image: formData.get('image') as string || FALLBACK_PRODUCT_IMAGE,
      stock: Number(formData.get('stock')),
      sku: String(formData.get('sku') || '').trim() || undefined,
      brand: String(formData.get('brand') || '').trim() || undefined,
      updatedAt: new Date().toISOString(),
      secondaryImage: String(formData.get('secondaryImage') || '').trim() || undefined,
      details: buildProductDetails(formData, category),
    };
    setProducts(prev => [newProduct, ...prev]);
    setShowAddModal(false);
    setAdminNotice(words(language, 'Product added.', 'Produit ajouté.', 'تمت إضافة المنتج.'));
  };

  const handleUpdateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as Category;
    const updated: Product = {
      ...editingProduct,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category,
      image: formData.get('image') as string || FALLBACK_PRODUCT_IMAGE,
      stock: Number(formData.get('stock')),
      sku: String(formData.get('sku') || '').trim() || undefined,
      brand: String(formData.get('brand') || '').trim() || undefined,
      updatedAt: new Date().toISOString(),
      secondaryImage: String(formData.get('secondaryImage') || '').trim() || undefined,
      details: buildProductDetails(formData, category),
    };
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
    setAdminNotice(words(language, 'Product updated.', 'Produit mis à jour.', 'تم تحديث المنتج.'));
  };

  const deleteProduct = (id: string) => {
    if (confirm(t.admin.deleteConfirm)) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  useEffect(() => {
    if (!pendingSection || selectedProductId) return;
    document.getElementById(pendingSection)?.scrollIntoView({ behavior: 'smooth' });
    setPendingSection(null);
  }, [pendingSection, selectedProductId]);

  const browseSection = (section: string, category?: Category | 'All') => {
    setIsMobileMenuOpen(false);
    setSelectedProductId(null);
    if (category) { setCatalogueReset(value => value + 1); setSearchQuery(''); }
    if (informationMode) {
      window.location.href = `/${category ? `?category=${category}` : ''}#${section}`;
    } else {
      setPendingSection(section);
    }
  };

  const adjustStock = (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    if (nextStock === product.stock) return;
    setProducts(previous => previous.map(item => item.id === product.id ? { ...item, stock: nextStock, updatedAt: new Date().toISOString() } : item));
    setStockUndo({ id: product.id, before: product.stock, after: nextStock });
    setAdminNotice(`${product.name}: ${nextStock} ${t.admin.table.units}`);
  };

  const undoStock = () => {
    if (!stockUndo) return;
    setProducts(previous => previous.map(item => item.id === stockUndo.id && item.stock === stockUndo.after ? { ...item, stock: stockUndo.before, updatedAt: new Date().toISOString() } : item));
    setStockUndo(null);
    setAdminNotice(words(language, 'Stock adjustment undone.', 'Modification du stock annulée.', 'تم التراجع عن تعديل المخزون.'));
  };

  const duplicateProduct = (product: Product) => {
    const copy: Product = { ...product, id: crypto.randomUUID(), name: `${product.name} (${words(language, 'copy', 'copie', 'نسخة')})`, sku: undefined, stock: 0, updatedAt: new Date().toISOString(), details: product.details ? { ...product.details } : undefined };
    setProducts(previous => [copy, ...previous]);
    setAdminSearchQuery(''); setAdminCategory('All'); setAdminStock('all');
    setEditingProduct(copy);
    setAdminNotice(words(language, 'Copy created with zero stock. Review its name, SKU, and quantity before making it available.', 'Copie créée sans stock. Vérifiez son nom, sa référence et sa quantité avant de la rendre disponible.', 'تم إنشاء نسخة بمخزون صفر. راجع الاسم والمرجع والكمية قبل إتاحتها.'));
  };

  const handleAdminLogout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    window.location.href = '/admin';
  };

  return (
    <MotionConfig reducedMotion="user"><div className="min-h-screen font-sans">
      <nav className="ps-header fixed top-0 left-0 right-0 z-50 glass border-b border-stone-200" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20 gap-4">
          <div className="flex items-center gap-4">
            {!adminMode && <button aria-label={language === 'fr' ? 'Ouvrir le menu' : 'Open menu'} onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2"><Menu className="w-5 h-5" /></button>}
            <button aria-label="Luxe & Loom home" className="ps-brand-with-logo" onClick={() => { if (adminMode || informationMode) window.location.href = '/'; else { setSelectedProductId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}><img src="/logo.png" alt="" className="ps-logo" /><span className="ps-brand"><span>Luxe & Loom</span><small>Fragrance boutique</small></span></button>
          </div>
          {!adminMode && <div className="hidden lg:flex items-center gap-7 text-[11px] text-stone-600">
            <button onClick={() => browseSection('products', 'Perfume')}>{c.navShop}</button>
            <button onClick={() => browseSection('discover')}>{c.navDiscover}</button>
            <button onClick={() => browseSection('guide-parfum')}>{c.navGuide}</button>
            <button onClick={() => browseSection('help')}>{c.navHelp}</button>
          </div>}
          <div className="flex items-center gap-2 sm:gap-4">
            <select aria-label="Language" value={language} onChange={event => setLanguage(event.target.value as Language)} className="bg-transparent text-[10px] text-stone-500 py-2"><option value="en">EN</option><option value="fr">FR</option><option value="ar">AR</option></select>
            {!adminMode && <><button aria-label={c.search} onClick={() => browseSection('products')} className="hidden sm:block p-2"><Search className="w-5 h-5" /></button><button onClick={() => setIsCartOpen(true)} aria-label={`${t.cart.title} (${cartItemCount})`} className="relative p-2"><ShoppingBag className="w-5 h-5" />{cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-gold-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}</button></>}
            {adminMode && <><Link href="/" aria-label={t.nav.store} className="p-2"><LayoutDashboard className="w-5 h-5" /></Link><button onClick={handleAdminLogout} aria-label="Log out" className="p-2"><LogOut className="w-5 h-5" /></button></>}
          </div>
        </div>
      </nav>
      {!adminMode && isMobileMenuOpen && <div className="fixed inset-0 z-[60] bg-stone-900/40" onClick={() => setIsMobileMenuOpen(false)}>
        <nav aria-label="Mobile navigation" className="ps-mobile-menu bg-gold-50 w-72 max-w-full h-full p-6 space-y-7" onClick={event => event.stopPropagation()}>
          <button aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)} className="block ml-auto p-2"><X /></button>
          <span className="ps-brand-with-logo"><img src="/logo.png" alt="Luxe & Loom" className="ps-logo" /><span className="ps-brand"><span>Luxe & Loom</span><small>Fragrance boutique</small></span></span>
          <button className="block" onClick={() => browseSection('products', 'Perfume')}>{c.navShop}</button>
          <button className="block" onClick={() => browseSection('discover')}>{c.navDiscover}</button>
          <button className="block" onClick={() => browseSection('guide-parfum')}>{c.navGuide}</button>
          <button className="block" onClick={() => browseSection('help')}>{c.navHelp}</button>
        </nav>
      </div>}

      {/* Main Content */}
      <main className="pt-20">
        {informationMode ? <Fragranea /> : activeTab === 'store' ? (
          selectedProduct ? (
            <section className="max-w-7xl mx-auto px-5 py-8 sm:py-12">
              <button onClick={() => setSelectedProductId(null)} className="mb-8 inline-flex items-center gap-2 text-xs text-stone-500 hover:text-gold-700"><ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />{t.product.back}</button>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                <div className="relative overflow-hidden bg-[#eee8de]"><img src={resolveProductImage(selectedProduct.image)} alt={selectedProduct.name} className="aspect-[4/4.7] w-full object-cover" onError={handleImageFallback} /><span className="ps-stock">{selectedProduct.stock > 0 ? c.inStock : c.soldOut}</span></div>
                <div>
                  <span className="ps-eyebrow">{[selectedProduct.details?.brand, selectedProduct.details?.collection].filter(Boolean).join(' · ') || c.collectionEyebrow}</span>
                  <h1 className="mt-4 text-4xl sm:text-5xl font-serif font-normal leading-tight">{selectedProduct.name}</h1>
                  <p className="mt-5 text-sm leading-relaxed text-stone-500">{selectedProduct.description}</p>
                  <div className="mt-6 text-2xl font-medium">{selectedProduct.price} {t.currency}</div>
                  <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-stone-500">{[selectedProduct.details?.volume, selectedProduct.details?.concentration, selectedProduct.details?.scentFamily].filter(Boolean).map(value => <span key={value} className="border border-stone-200 px-3 py-2 bg-white">{value}</span>)}</div>
                  <div className="ps-detail-purchase"><button className="ps-primary disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => addToCart(selectedProduct)} disabled={selectedProduct.stock <= 0}><Plus size={17} />{selectedProduct.stock > 0 ? c.add : c.soldOut}</button><p>{c.bagHint}</p></div>
                  <div className="mt-7 grid grid-cols-2 gap-5 border-b border-stone-200 pb-6"><div><span className="ps-eyebrow">{t.product.volume}</span><p className="mt-2 text-xs leading-relaxed text-stone-500">{selectedProduct.details?.volume || c.askSize}</p></div><div><span className="ps-eyebrow">{t.product.delivery}</span><p className="mt-2 text-xs leading-relaxed text-stone-500">{selectedProduct.details?.delivery || c.askDelivery}</p></div></div>
                  {(selectedProduct.details?.topNotes?.length || selectedProduct.details?.heartNotes?.length || selectedProduct.details?.baseNotes?.length || selectedProduct.details?.notes?.length) ? <div className="mt-7"><h2 className="font-serif text-2xl">{c.notes}</h2><p className="mt-2 mb-6 text-xs text-stone-500">{c.notesIntro}</p><div className="ps-note-pyramid">{[
                    { label: t.product.topNotes, items: selectedProduct.details?.topNotes },
                    { label: t.product.heartNotes, items: selectedProduct.details?.heartNotes },
                    { label: t.product.baseNotes, items: selectedProduct.details?.baseNotes ?? selectedProduct.details?.notes },
                  ].filter(section => section.items?.length).map((section, index) => <div className="ps-note-row" key={section.label}><span>0{index + 1}</span><div><p>{section.label}</p><div className="ps-note-values">{section.items?.join(' · ')}</div></div></div>)}</div></div> : null}
                  {selectedProduct.details?.occasions?.length ? <div className="mt-6"><span className="ps-eyebrow">{c.occasions}</span><p className="mt-2 text-xs text-stone-500">{selectedProduct.details.occasions.join(' · ')}</p></div> : null}
                  <button onClick={() => browseSection('guide-parfum')} className="mt-7 text-xs text-gold-700 underline underline-offset-4">{c.navGuide}</button>
                </div>
              </div>
            </section>
          ) : (
            <>
            <FragranceStore
              key={catalogueReset}
              products={products}
              language={language}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenProduct={product => { setSelectedProductId(product.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onAddToCart={addToCart}
              onGuide={() => browseSection('guide-parfum')}
            />
            <Fragranea embedded />
            </>
          )
        ) : (
          /* Admin Panel */
          <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">{t.nav.admin}</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-2 mb-2">{t.admin.title}</h2>
                <p className="text-stone-500 max-w-2xl">{t.admin.description}</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-stone-900 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg md:self-auto"
              >
                <Plus className="w-5 h-5" /> {t.admin.addBtn}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <button disabled={adminProducts.length === 0} onClick={() => downloadInventory(inventoryCsv(adminProducts), `luxe-loom-inventory-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')} className="inline-flex items-center gap-2 px-4 py-3 border border-stone-200 bg-white rounded-lg text-sm disabled:opacity-40"><Download size={16} />{words(language, 'Export filtered inventory (CSV)', 'Exporter la sélection (CSV)', 'تصدير المخزون المصفى (CSV)')}</button>
              <button onClick={() => downloadInventory(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), products }, null, 2), `luxe-loom-catalogue-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')} className="inline-flex items-center gap-2 px-4 py-3 border border-stone-200 bg-white rounded-lg text-sm"><Download size={16} />{words(language, 'Download catalogue backup', 'Sauvegarder le catalogue', 'تنزيل نسخة من الكتالوج')}</button>
              <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-3 border border-stone-200 bg-white rounded-lg text-sm">{words(language, 'Preview storefront ↗', 'Voir la boutique ↗', 'معاينة المتجر ↗')}</a>
            </div>
            <p className="text-sm text-stone-500 mb-5">{words(language, 'Changes are saved in this browser. They are not shared with other devices or website visitors.', 'Les modifications sont enregistrées dans ce navigateur. Elles ne sont pas partagées avec les autres appareils ou visiteurs.', 'تُحفظ التغييرات في هذا المتصفح ولا تتم مشاركتها مع الأجهزة الأخرى أو زوار الموقع.')}</p>
            {adminNotice && <p role="status" className="rounded-lg bg-emerald-50 text-emerald-800 p-4 mb-5">{adminNotice}{stockUndo && products.some(product => product.id === stockUndo.id && product.stock === stockUndo.after) && <button onClick={undoStock} className="inline-flex items-center gap-2 ms-4 underline underline-offset-4"><RotateCcw size={14} />{words(language, 'Undo stock change', 'Annuler le stock', 'التراجع عن المخزون')}</button>}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: t.admin.stats.products, value: inventoryStats.totalProducts, icon: Package, tone: 'text-stone-700 bg-stone-100' },
                { label: t.admin.stats.units, value: inventoryStats.totalStock, icon: Boxes, tone: 'text-emerald-700 bg-emerald-50' },
                { label: t.admin.stats.value, value: `${inventoryStats.inventoryValue.toLocaleString()} ${t.currency}`, icon: CircleDollarSign, tone: 'text-gold-700 bg-gold-100' },
                { label: t.admin.stats.lowStock, value: inventoryStats.lowStockCount, icon: AlertTriangle, tone: inventoryStats.lowStockCount > 0 ? 'text-red-700 bg-red-50' : 'text-stone-700 bg-stone-100' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-stone-900">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.tone}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
              <div className="flex justify-between items-center gap-4 mb-4"><h3 className="font-serif text-2xl">{words(language, 'Restock priorities', 'Priorités de réapprovisionnement', 'أولويات إعادة التخزين')}</h3><button onClick={() => { setAdminCategory('All'); setAdminSearchQuery(''); setAdminStock('out'); }} className="text-sm text-gold-700 underline underline-offset-4">{words(language, 'View sold-out products', 'Voir les produits épuisés', 'عرض المنتجات النافدة')}</button></div>
              <p className="text-sm text-stone-500 mb-4">{words(language, 'Products with five units or fewer, ordered by lowest stock.', 'Produits avec cinq unités ou moins, triés par stock croissant.', 'منتجات بخمس وحدات أو أقل مرتبة حسب المخزون الأقل.')}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{products.filter(product => product.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 6).map(product => <button key={product.id} onClick={() => setEditingProduct(product)} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100 text-start hover:border-gold-400"><img src={resolveProductImage(product.image)} onError={handleImageFallback} alt="" className="h-12 w-12 rounded-lg object-cover" /><span><span className="block text-sm font-medium">{product.name}</span><span className={`text-xs ${product.stock === 0 ? 'text-red-700' : 'text-orange-700'}`}>{product.stock === 0 ? t.product.outOfStock : `${product.stock} ${t.admin.table.units}`}</span></span><Edit2 size={14} className="ms-auto shrink-0" /></button>)}</div>
              {products.every(product => product.stock > 5) && <p className="text-sm text-emerald-700">{words(language, 'All products are above the low-stock threshold.', 'Tous les produits dépassent le seuil de stock faible.', 'جميع المنتجات أعلى من حد المخزون المنخفض.')}</p>}
            </section>
            <form onSubmit={handleSellerInformationUpdate} className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-5 mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 text-stone-900">
                    <Landmark className="w-5 h-5 text-gold-700" />
                    <h3 className="font-serif text-2xl font-bold">{t.admin.seller.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-stone-500 max-w-2xl">{t.admin.seller.description}</p>
                </div>
                <button className="bg-stone-900 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg">
                  <Check className="w-4 h-4" />
                  {t.admin.seller.save}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.seller.whatsapp}</label>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 focus-within:ring-2 focus-within:ring-gold-500">
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    <input
                      name="whatsapp"
                      required
                      defaultValue={sellerInformation.whatsapp}
                      className="w-full bg-transparent border-none outline-none text-sm"
                      placeholder="+212 600-000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.seller.bankName}</label>
                  <input
                    name="bankName"
                    required
                    defaultValue={sellerInformation.bankName}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="CIH Bank"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.seller.accountHolder}</label>
                  <input
                    name="accountHolder"
                    required
                    defaultValue={sellerInformation.accountHolder}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="Luxe & Loom Boutique"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.seller.rib}</label>
                  <input
                    name="rib"
                    required
                    defaultValue={sellerInformation.rib}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder="230 780 0000000000000000 00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.seller.iban}</label>
                  <input
                    name="iban"
                    required
                    defaultValue={sellerInformation.iban}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder="MA64 2307 8000 0000 0000 0000 0000"
                  />
                </div>
              </div>
            </form>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 w-full lg:max-w-md">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={t.admin.search}
                    className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {(['All', 'Perfume', 'Clothing'] as const).map(category => (
                    <button
                      key={category}
                      onClick={() => setAdminCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        adminCategory === category
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 text-stone-600 hover:border-gold-400'
                      }`}
                    >
                      {category === 'All' ? t.store.all : category === 'Perfume' ? t.store.perfume : t.store.clothing}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4 border-b border-stone-200 flex flex-wrap gap-5 items-end">
                <label className="text-xs text-stone-500">{words(language, 'Stock status', 'État du stock', 'حالة المخزون')}<select value={adminStock} onChange={e => setAdminStock(e.target.value)} className="block mt-2 border border-stone-200 rounded-lg p-2 text-sm"><option value="all">{t.store.all}</option><option value="available">{t.product.inStock} (&gt; 5)</option><option value="low">{t.admin.lowStock} (1–5)</option><option value="out">{t.product.outOfStock}</option></select></label>
                <label className="text-xs text-stone-500">{words(language, 'Sort by', 'Trier par', 'ترتيب حسب')}<select value={adminSort} onChange={e => setAdminSort(e.target.value)} className="block mt-2 border border-stone-200 rounded-lg p-2 text-sm"><option value="name">{t.admin.table.product}</option><option value="stock">{words(language, 'Lowest stock first', 'Stock croissant', 'المخزون الأقل أولاً')}</option><option value="value">{words(language, 'Highest inventory value', 'Valeur de stock décroissante', 'أعلى قيمة مخزون')}</option></select></label>
                <span className="text-sm text-stone-500" role="status">{adminProducts.length} / {products.length} {t.admin.stats.products}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.product}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.category}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.price}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.stock}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{words(language, 'Product details', 'Détails du produit', 'تفاصيل المنتج')}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{words(language, 'Stock value', 'Valeur du stock', 'قيمة المخزون')}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase text-right">{t.admin.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminProducts.map(product => (
                      <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={resolveProductImage(product.image)} alt={product.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" onError={handleImageFallback} />
                            <div>
                              <div className="font-bold text-stone-900">{product.name}</div>
                              {product.sku && <div className="text-xs font-mono text-gold-700 mt-1">SKU: {product.sku}</div>}
                              {product.brand && <div className="text-xs text-stone-500 mt-1">{product.brand}</div>}
                              <div className="text-xs text-stone-500 truncate max-w-[200px]">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            product.category === 'Perfume' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {product.category === 'Perfume' ? t.store.perfume : t.store.clothing}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{product.price} {t.currency}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-red-500'}`} />
                            <button disabled={product.stock === 0} aria-label={`${words(language, 'Reduce stock', 'Réduire le stock', 'خفض المخزون')}: ${product.name}`} onClick={() => adjustStock(product, -1)} className="p-1 rounded border border-stone-200 disabled:opacity-30"><Minus size={14} /></button>
                            {product.stock} {t.admin.table.units}
                            <button aria-label={`${words(language, 'Increase stock', 'Augmenter le stock', 'زيادة المخزون')}: ${product.name}`} onClick={() => adjustStock(product, 1)} className="p-1 rounded border border-stone-200"><Plus size={14} /></button>
                            {product.stock <= 5 && (
                              <span className="ml-2 px-2 py-1 rounded-full bg-red-50 text-[10px] font-bold uppercase tracking-wider text-red-700">
                                {product.stock === 0 ? t.product.outOfStock : t.admin.lowStock}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-stone-500 min-w-44"><p>{[product.details?.scentFamily, product.details?.concentration, product.details?.volume, product.details?.size, product.details?.color].filter(Boolean).join(' · ') || '—'}</p>{product.details?.delivery && <p className="mt-2">{product.details.delivery}</p>}{product.updatedAt && <p className="mt-2">{words(language, 'Updated', 'Mis à jour', 'آخر تحديث')}: {new Date(product.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-GB')}</p>}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{(product.price * product.stock).toLocaleString()} {t.currency}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => duplicateProduct(product)} aria-label={`${words(language, 'Duplicate product', 'Dupliquer le produit', 'نسخ المنتج')}: ${product.name}`} title={words(language, 'Duplicate product', 'Dupliquer le produit', 'نسخ المنتج')} className="p-2 hover:bg-gold-100 rounded-lg text-gold-700"><Copy size={16} /></button>
                            <button 
                              onClick={() => setEditingProduct(product)}
                              aria-label={`${t.admin.modal.editTitle}: ${product.name}`}
                              className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              aria-label={`${words(language, 'Delete', 'Supprimer', 'حذف')}: ${product.name}`}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {adminProducts.length === 0 && (
                <div className="py-16 px-4 text-center">
                  <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <h4 className="text-lg font-serif font-bold mb-2">{t.store.noProducts}</h4>
                  <p className="text-stone-500">{t.store.adjustSearch}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-serif font-bold">{t.cart.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {cart.length > 0 ? t.cart.itemCount.replace('{count}', cartItemCount.toString()) : t.cart.empty}
                  </p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                    <ShoppingBag className="w-16 h-16 stroke-1" />
                    <p className="text-lg">{t.cart.empty}</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="text-stone-900 font-bold underline underline-offset-4"
                    >
                      {t.cart.startShopping}
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
                      <div className="flex gap-4">
                      <img src={resolveProductImage(item.image)} alt={item.name} className="w-24 h-32 object-cover rounded-lg bg-stone-100" referrerPolicy="no-referrer" onError={handleImageFallback} />
                      <div className="min-w-0 flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <h4 className="font-bold text-stone-900 truncate">{item.name}</h4>
                              <p className="text-sm text-stone-500">{item.category === 'Perfume' ? t.store.perfume : t.store.clothing}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-stone-100 px-2 py-1 text-stone-600">
                              {item.price} {t.currency} {t.cart.each}
                            </span>
                            {item.quantity >= item.stock && (
                              <span className="rounded-full bg-orange-50 px-2 py-1 font-medium text-orange-700">
                                {t.cart.stockLimit}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 px-2 py-1">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="p-1 hover:text-gold-600 disabled:text-stone-300 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 hover:text-gold-600 disabled:text-stone-300 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold">{item.price * item.quantity} {t.currency}</span>
                        </div>
                      </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4 max-h-[72vh] overflow-y-auto">
                  <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
                    <div className="flex justify-between text-stone-500">
                      <span>{t.cart.subtotal}</span>
                      <span>{cartTotal} {t.currency}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>{t.cart.shipping}</span>
                      <span>{t.cart.shippingNote}</span>
                    </div>
                    <div className="flex justify-between text-xl font-serif font-bold pt-3 border-t border-stone-200">
                      <span>{t.cart.total}</span>
                      <span>{cartTotal} {t.currency}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="rounded-xl border border-stone-200 bg-white py-3 text-sm font-bold text-stone-700 hover:border-gold-400 transition-colors"
                    >
                      {t.cart.continueShopping}
                    </button>
                    <button
                      onClick={clearCart}
                      className="rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      {t.cart.clear}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCheckoutDetails(prev => !prev)}
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 transition-colors shadow-lg"
                  >
                    {showCheckoutDetails ? t.cart.hideCheckout : t.cart.checkout}
                  </button>
                  <AnimatePresence>
                    {showCheckoutDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="rounded-xl border border-gold-200 bg-white p-4 space-y-4"
                      >
                        <div>
                          <h4 className="font-serif text-xl font-bold text-stone-900">{t.checkout.title}</h4>
                          <p className="mt-1 text-sm text-stone-500">{t.checkout.description}</p>
                        </div>
                        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <h5 className="text-sm font-bold uppercase tracking-widest text-stone-400">{t.checkout.orderSummary}</h5>
                            <span className="font-bold text-stone-900">{cartTotal} {t.currency}</span>
                          </div>
                          <div className="mt-3 space-y-2">
                            {cart.map(item => (
                              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                                <span className="min-w-0 truncate text-stone-700">{item.name} x{item.quantity}</span>
                                <span className="font-medium text-stone-900">{item.price * item.quantity} {t.currency}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h5 className="text-sm font-bold uppercase tracking-widest text-stone-400">{t.checkout.form.title}</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              value={checkoutCustomer.name}
                              onChange={(e) => setCheckoutCustomer(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                              placeholder={t.checkout.form.name}
                            />
                            <input
                              value={checkoutCustomer.phone}
                              onChange={(e) => setCheckoutCustomer(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                              placeholder={t.checkout.form.phone}
                            />
                            <input
                              value={checkoutCustomer.city}
                              onChange={(e) => setCheckoutCustomer(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                              placeholder={t.checkout.form.city}
                            />
                            <input
                              value={checkoutCustomer.address}
                              onChange={(e) => setCheckoutCustomer(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                              placeholder={t.checkout.form.address}
                            />
                          </div>
                          <textarea
                            value={checkoutCustomer.notes}
                            onChange={(e) => setCheckoutCustomer(prev => ({ ...prev, notes: e.target.value }))}
                            className="h-20 w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                            placeholder={t.checkout.form.notes}
                          />
                          {!checkoutFormIsComplete && (
                            <p className="text-xs font-medium text-orange-700">{t.checkout.form.required}</p>
                          )}
                        </div>
                        <a
                          href={checkoutWhatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={!checkoutFormIsComplete}
                          onClick={(e) => {
                            if (!checkoutFormIsComplete) {
                              e.preventDefault();
                            }
                          }}
                          className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                            checkoutFormIsComplete
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <MessageCircle className="h-5 w-5 shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-xs font-bold uppercase tracking-widest">{t.checkout.whatsapp}</span>
                            <span className="block font-semibold">{sellerInformation.whatsapp}</span>
                          </span>
                        </a>
                        <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
                          <div className="flex items-center gap-2 font-bold text-stone-900">
                            <Landmark className="h-5 w-5 text-gold-700" />
                            {t.checkout.bank}
                          </div>
                          <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                              <dt className="text-stone-500">{t.checkout.bankName}</dt>
                              <dd className="font-medium text-right">{sellerInformation.bankName}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt className="text-stone-500">{t.checkout.accountHolder}</dt>
                              <dd className="font-medium text-right">{sellerInformation.accountHolder}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt className="text-stone-500">{t.checkout.rib}</dt>
                              <dd className="font-mono text-xs font-semibold text-right">{sellerInformation.rib}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt className="text-stone-500">{t.checkout.iban}</dt>
                              <dd className="font-mono text-xs font-semibold text-right">{sellerInformation.iban}</dd>
                            </div>
                          </dl>
                        </div>
                        <div className="rounded-lg border border-gold-200 bg-gold-50 p-4">
                          <p className="text-sm font-bold text-stone-900">{t.checkout.paymentInstructions}</p>
                          <p className="mt-1 text-xs leading-relaxed text-stone-600">{t.checkout.note}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingProduct) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white z-[90] rounded-3xl shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif font-bold">
                    {editingProduct ? t.admin.modal.editTitle : t.admin.modal.addTitle}
                  </h3>
                  <button onClick={() => { setShowAddModal(false); setEditingProduct(null); }} className="p-2 hover:bg-stone-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.name}</label>
                      <input 
                        name="name" 
                        required 
                        defaultValue={editingProduct?.name}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all" 
                        placeholder="e.g. Velvet Rose"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.desc}</label>
                      <textarea 
                        name="description" 
                        required 
                        defaultValue={editingProduct?.description}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all h-24 resize-none" 
                        placeholder="Describe the product..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.price}</label>
                      <input 
                        name="price" 
                        min="0" step="0.01"
                        type="number" 
                        required 
                        defaultValue={editingProduct?.price}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.stock}</label>
                      <input 
                        name="stock" 
                        min="0" step="1"
                        type="number" 
                        required 
                        defaultValue={editingProduct?.stock}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.category}</label>
                      <select 
                        name="category" 
                        value={modalCategory}
                        onChange={(e) => setModalCategory(e.target.value as Category)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      >
                        <option value="Perfume">{t.store.perfume}</option>
                        <option value="Clothing">{t.store.clothing}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.image}</label>
                      <input 
                        name="image" 
                        defaultValue={editingProduct?.image}
                        onChange={(e) => {
                          setModalImagePreview(e.target.value || FALLBACK_PRODUCT_IMAGE);
                          setModalImageFailed(false);
                        }}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all" 
                        placeholder="https://..."
                      />
                    </div>
                    {(['sku', 'brand'] as const).map(field => <label key={field} className="text-xs text-stone-500">{field === 'sku' ? 'SKU' : words(language, 'Brand / maker', 'Marque / créateur', 'العلامة / المصمم')}<input name={field} defaultValue={editingProduct?.[field]} className="block w-full mt-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" /></label>)}
                    <label className="col-span-2 text-xs text-stone-500">{words(language, 'Second product image URL', 'URL de la seconde image', 'رابط الصورة الثانية')}<input name="secondaryImage" type="url" defaultValue={editingProduct?.secondaryImage} className="block w-full mt-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" /></label>
                    <div className="col-span-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <div className="flex items-center gap-4">
                        <img
                          src={modalImagePreview}
                          alt={t.admin.modal.preview}
                          className="h-24 w-20 rounded-lg object-cover bg-stone-200"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            setModalImageFailed(true);
                            handleImageFallback(e);
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{t.admin.modal.preview}</p>
                          <p className="mt-1 text-sm text-stone-600">
                            {modalImageFailed ? t.admin.modal.imageFallback : t.admin.modal.previewHelp}
                          </p>
                        </div>
                      </div>
                    </div>
                    {modalCategory === 'Perfume' ? (
                      <>
                        {[
                          { name: 'brand', label: c.brand, value: editingProduct?.details?.brand },
                          { name: 'concentration', label: c.concentration, value: editingProduct?.details?.concentration },
                          { name: 'occasions', label: c.occasions, value: editingProduct?.details?.occasions?.join(', ') },
                        ].map(field => <div key={field.name}><label htmlFor={`product-${field.name}`} className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{field.label}</label><input id={`product-${field.name}`} name={field.name} defaultValue={field.value} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" /></div>)}
                        <div><label htmlFor="product-format" className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{language === 'fr' ? 'Format' : language === 'ar' ? 'نوع المنتج' : 'Format'}</label><select id="product-format" name="format" defaultValue={editingProduct?.details?.format ?? 'Full bottle'} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl"><option value="Full bottle">{language === 'fr' ? 'Flacon' : language === 'ar' ? 'زجاجة' : 'Full bottle'}</option><option value="Discovery set">{language === 'fr' ? 'Coffret découverte' : language === 'ar' ? 'مجموعة تجريبية' : 'Discovery set'}</option></select></div>
                        <div><label htmlFor="product-collection" className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{language === 'fr' ? 'Collection' : language === 'ar' ? 'المجموعة' : 'Collection'}</label><select id="product-collection" name="collection" defaultValue={editingProduct?.details?.collection ?? ''} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl"><option value="">—</option><option value="Niche">Niche</option><option value="Designer">Designer</option></select></div>
                        <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.volume}</label>
                          <input
                            name="volume"
                            defaultValue={editingProduct?.details?.volume}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                            placeholder="50 ml"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-4">{words(language, 'Concentration', 'Concentration', 'التركيز')}<input name="concentration" defaultValue={editingProduct?.details?.concentration} placeholder="Eau de parfum" className="block w-full mt-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" /></label>
                          <label className="block text-xs text-stone-500 mb-4">{words(language, 'Scent notes (comma separated)', 'Notes olfactives (séparées par des virgules)', 'النغمات العطرية (مفصولة بفواصل)')}<input name="notes" defaultValue={editingProduct?.details?.notes?.join(', ')} className="block w-full mt-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" /></label>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.scentFamily}</label>
                          <input
                            name="scentFamily"
                            defaultValue={editingProduct?.details?.scentFamily}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                            placeholder="Floral Amber"
                          />
                        </div>
                        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { name: 'topNotes', label: t.admin.modal.topNotes, value: editingProduct?.details?.topNotes?.join(', ') },
                            { name: 'heartNotes', label: t.admin.modal.heartNotes, value: editingProduct?.details?.heartNotes?.join(', ') },
                            { name: 'baseNotes', label: t.admin.modal.baseNotes, value: editingProduct?.details?.baseNotes?.join(', ') ?? editingProduct?.details?.notes?.join(', ') },
                          ].map(field => (
                            <div key={field.name}>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{field.label}</label>
                              <input
                                name={field.name}
                                defaultValue={field.value}
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                                placeholder={t.admin.modal.commaSeparated}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.size}</label>
                          <input
                            name="size"
                            defaultValue={editingProduct?.details?.size}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                            placeholder="Available in S, M, L"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.color}</label>
                          <input
                            name="color"
                            defaultValue={editingProduct?.details?.color}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                            placeholder="Black"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.material}</label>
                          <input
                            name="material"
                            defaultValue={editingProduct?.details?.material ?? editingProduct?.details?.materials?.join(', ')}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                            placeholder="Silk, cotton, cashmere..."
                          />
                        </div>
                      </>
                    )}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.delivery}</label>
                      <input
                        name="delivery"
                        defaultValue={editingProduct?.details?.delivery}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        placeholder={t.product.defaultDelivery}
                      />
                    </div>
                  </div>
                  <button className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 transition-colors shadow-lg mt-4">
                    {editingProduct ? t.admin.modal.save : t.admin.modal.create}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!adminMode && <footer className="ps-footer">
        <div className="ps-footer-grid">
          <div><span className="ps-brand-with-logo"><img src="/logo.png" alt="Luxe & Loom" className="ps-logo" /><span className="ps-brand"><span>Luxe & Loom</span><small>Fragrance boutique</small></span></span><p>{c.footerDesc}</p></div>
          <div><h3>{c.footerShop}</h3><button onClick={() => browseSection('products', 'Perfume')}>{c.navShop}</button><button onClick={() => browseSection('discover')}>{c.navDiscover}</button><button onClick={() => browseSection('guide-parfum')}>{c.navGuide}</button></div>
          <div><h3>{c.footerHelp}</h3><button onClick={() => browseSection('help')}>{c.navHelp}</button><button onClick={() => setIsCartOpen(true)}>{t.cart.title}</button></div>
        </div>
        <div className="ps-footer-bottom"><span>© {new Date().getFullYear()} {c.footerRights}</span><Link href="/information">Fragranea · {c.navGuide}</Link></div>
      </footer>}

    </div></MotionConfig>
  );
}
