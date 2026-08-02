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
  Star, 
  ArrowRight,
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
  Droplets,
  Ruler,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, Category, Language, SellerInformation } from './types';
import { DEFAULT_SELLER_INFORMATION, FALLBACK_PRODUCT_IMAGE, INITIAL_PRODUCTS } from './constants';
import { TRANSLATIONS } from './translations';

export default function App({ adminMode = false }: { adminMode?: boolean }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = TRANSLATIONS[language];
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sellerInformation, setSellerInformation] = useState<SellerInformation>(DEFAULT_SELLER_INFORMATION);
  
  const [cart, setCart] = useState<CartItem[]>([]);

  const activeTab: 'store' | 'admin' = adminMode ? 'admin' : 'store';
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
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

  // The imported app persists storefront state locally; restore it after hydration.
  useEffect(() => {
    const savedLanguage = localStorage.getItem('luxe_loom_lang') as Language | null;
    const savedProducts = localStorage.getItem('luxe_loom_products');
    const savedSellerInformation = localStorage.getItem('luxe_loom_seller_information');
    const savedCart = localStorage.getItem('luxe_loom_cart');

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    if (savedSellerInformation) {
      setSellerInformation({
        ...DEFAULT_SELLER_INFORMATION,
        ...JSON.parse(savedSellerInformation),
      });
    }

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('luxe_loom_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('luxe_loom_seller_information', JSON.stringify(sellerInformation));
  }, [sellerInformation]);

  useEffect(() => {
    localStorage.setItem('luxe_loom_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('luxe_loom_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const adminProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = adminCategory === 'All' || product.category === adminCategory;
      const matchesSearch = `${product.name} ${product.description}`.toLowerCase().includes(adminSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, adminCategory, adminSearchQuery]);

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
      details: buildProductDetails(formData, category),
    };
    setProducts(prev => [newProduct, ...prev]);
    setShowAddModal(false);
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
      details: buildProductDetails(formData, category),
    };
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm(t.admin.deleteConfirm)) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAdminLogout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              {!adminMode && <button
                onClick={() => {
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="lg:hidden p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>}
              <h1
                onClick={() => {
                  setSelectedProductId(null);
                }}
                className={`text-2xl font-serif font-bold tracking-tighter ${adminMode ? '' : 'cursor-pointer hover:text-gold-600 transition-colors'}`}
              >
                Luxe & Loom
              </h1>
              {!adminMode && <div className="hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide text-stone-600">
                <button 
                  onClick={() => { setSelectedCategory('All'); setSelectedProductId(null); }}
                  className={`hover:text-stone-900 transition-colors ${selectedCategory === 'All' && activeTab === 'store' ? 'text-stone-900 border-b-2 border-gold-500' : ''}`}
                >
                  {t.nav.collections}
                </button>
                <button 
                  onClick={() => { setSelectedCategory('Perfume'); setSelectedProductId(null); }}
                  className={`hover:text-stone-900 transition-colors ${selectedCategory === 'Perfume' && activeTab === 'store' ? 'text-stone-900 border-b-2 border-gold-500' : ''}`}
                >
                  {t.nav.perfumes}
                </button>
                <button 
                  onClick={() => { setSelectedCategory('Clothing'); setSelectedProductId(null); }}
                  className={`hover:text-stone-900 transition-colors ${selectedCategory === 'Clothing' && activeTab === 'store' ? 'text-stone-900 border-b-2 border-gold-500' : ''}`}
                >
                  {t.nav.clothing}
                </button>
              </div>}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent border-none text-xs font-bold text-stone-500 uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-stone-900"
                >
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                  <option value="ar">AR</option>
                </select>
              </div>
              {!adminMode && <div className="hidden md:flex items-center bg-stone-100 rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder={t.nav.search}
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>}
              {!adminMode && <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-gold-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>}
              {adminMode && (
                <>
                  <Link href="/" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600" title={t.nav.store}>
                    <LayoutDashboard className="w-6 h-6" />
                  </Link>
                  <button onClick={handleAdminLogout} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600" title="Log out">
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {activeTab === 'store' ? (
          selectedProduct ? (
            <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
              <button
                onClick={() => setSelectedProductId(null)}
                className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                {t.product.back}
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-10 lg:gap-14 items-start">
                <div className="relative overflow-hidden rounded-lg bg-stone-100">
                  <img
                    src={resolveProductImage(selectedProduct.image)}
                    alt={selectedProduct.name}
                    className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]"
                    referrerPolicy="no-referrer"
                    onError={handleImageFallback}
                  />
                  <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-stone-900 uppercase">
                    {selectedProduct.category === 'Perfume' ? t.store.perfume : t.store.clothing}
                  </div>
                </div>

                <div className="lg:sticky lg:top-28">
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      selectedProduct.stock > 5
                        ? 'bg-emerald-50 text-emerald-700'
                        : selectedProduct.stock > 0
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${
                        selectedProduct.stock > 5 ? 'bg-emerald-500' : selectedProduct.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      {selectedProduct.stock > 5
                        ? t.product.inStock
                        : selectedProduct.stock > 0
                          ? t.product.lowStock.replace('{count}', selectedProduct.stock.toString())
                          : t.product.outOfStock}
                    </span>
                    <span className="text-sm text-stone-500">{selectedProduct.stock} {t.admin.table.units}</span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">{selectedProduct.name}</h2>
                  <p className="mt-5 text-lg leading-relaxed text-stone-600">{selectedProduct.description}</p>
                  <div className="mt-6 text-3xl font-semibold">{selectedProduct.price} {t.currency}</div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-stone-200 bg-white p-4">
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        {selectedProduct.category === 'Perfume' ? (
                          <Droplets className="w-5 h-5 text-gold-700" />
                        ) : (
                          <Ruler className="w-5 h-5 text-gold-700" />
                        )}
                        {selectedProduct.category === 'Perfume' ? t.product.volume : t.product.size}
                      </div>
                      <p className="mt-2 text-sm text-stone-600">
                        {selectedProduct.category === 'Perfume'
                          ? selectedProduct.details?.volume ?? t.product.defaultVolume
                          : selectedProduct.details?.size ?? t.product.defaultSize}
                      </p>
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-white p-4">
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        <Truck className="w-5 h-5 text-gold-700" />
                        {t.product.delivery}
                      </div>
                      <p className="mt-2 text-sm text-stone-600">
                        {selectedProduct.details?.delivery ?? t.product.defaultDelivery}
                      </p>
                    </div>
                  </div>

                  {selectedProduct.category === 'Perfume' ? (
                    <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5 space-y-5">
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        <ShieldCheck className="w-5 h-5 text-gold-700" />
                        {t.product.notes}
                      </div>
                      <div className="rounded-lg bg-stone-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{t.product.scentFamily}</p>
                        <p className="mt-1 font-semibold text-stone-900">{selectedProduct.details?.scentFamily ?? t.product.defaultScentFamily}</p>
                      </div>
                      {[
                        { label: t.product.topNotes, items: selectedProduct.details?.topNotes },
                        { label: t.product.heartNotes, items: selectedProduct.details?.heartNotes },
                        { label: t.product.baseNotes, items: selectedProduct.details?.baseNotes ?? selectedProduct.details?.notes },
                      ].map(section => (
                        <div key={section.label}>
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{section.label}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(section.items && section.items.length > 0 ? section.items : [t.product.defaultNote]).map(item => (
                              <span key={`${section.label}-${item}`} className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5">
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        <ShieldCheck className="w-5 h-5 text-gold-700" />
                        {t.product.materials}
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: t.product.material, value: selectedProduct.details?.material ?? selectedProduct.details?.materials?.join(', ') ?? t.product.defaultMaterial },
                          { label: t.product.color, value: selectedProduct.details?.color ?? t.product.defaultColor },
                        ].map(item => (
                          <div key={item.label} className="rounded-lg bg-stone-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{item.label}</p>
                            <p className="mt-1 font-semibold text-stone-900">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => addToCart(selectedProduct)}
                    disabled={selectedProduct.stock <= 0}
                    className="mt-8 w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {selectedProduct.stock > 0 ? t.store.addToBag : t.product.outOfStock}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <>
            {/* Hero Section */}
            <section className="relative h-[80vh] overflow-hidden">
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=2000" 
                  alt="Hero" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-900/30" />
              </div>
              <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start text-white">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gold-300 font-medium tracking-[0.3em] mb-4"
                >
                  {t.hero.subtitle}
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-serif font-bold mb-8 max-w-2xl leading-tight"
                >
                  {t.hero.title}
                </motion.h2>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    const el = document.getElementById('products');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white text-stone-900 px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-gold-500 hover:text-white transition-all group"
                >
                  {t.hero.cta} <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>
            </section>

            {/* Products Grid */}
            <section id="products" className="max-w-7xl mx-auto px-4 py-24">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-4">{t.store.title}</h3>
                  <p className="text-stone-500 max-w-md">{t.store.description}</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                  {(['All', 'Perfume', 'Clothing'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat 
                          ? 'bg-stone-900 text-white shadow-lg' 
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-gold-400'
                      }`}
                    >
                      {cat === 'All' ? t.store.all : cat === 'Perfume' ? t.store.perfume : t.store.clothing}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      onClick={() => {
                        setSelectedProductId(product.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-6 rounded-2xl">
                        <img 
                          src={resolveProductImage(product.image)} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          onError={handleImageFallback}
                        />
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          disabled={product.stock <= 0}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-stone-900 px-6 py-3 rounded-full font-medium shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gold-500 hover:text-white disabled:bg-stone-200 disabled:text-stone-500 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> {product.stock > 0 ? t.store.addToBag : t.product.outOfStock}
                        </button>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-stone-900 uppercase">
                          {product.category === 'Perfume' ? t.store.perfume : t.store.clothing}
                        </div>
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                          product.stock > 5
                            ? 'bg-emerald-50/95 text-emerald-700'
                            : product.stock > 0
                              ? 'bg-orange-50/95 text-orange-700'
                              : 'bg-red-50/95 text-red-700'
                        }`}>
                          {product.stock > 5
                            ? t.product.inStock
                            : product.stock > 0
                              ? t.product.lowStock.replace('{count}', product.stock.toString())
                              : t.product.outOfStock}
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-serif font-bold mb-1 group-hover:text-gold-600 transition-colors">{product.name}</h4>
                          <p className="text-stone-500 text-sm line-clamp-1">{product.description}</p>
                        </div>
                        <span className="text-lg font-medium">{product.price} {t.currency}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-24">
                  <Package className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                  <h4 className="text-xl font-serif font-bold mb-2">{t.store.noProducts}</h4>
                  <p className="text-stone-500">{t.store.adjustSearch}</p>
                </div>
              )}
            </section>
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
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.product}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.category}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.price}</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-widest text-stone-400 uppercase">{t.admin.table.stock}</th>
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
                            {product.stock} {t.admin.table.units}
                            {product.stock <= 5 && (
                              <span className="ml-2 px-2 py-1 rounded-full bg-red-50 text-[10px] font-bold uppercase tracking-wider text-red-700">
                                {t.admin.lowStock}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingProduct(product)}
                              className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
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

      {/* Footer */}
      {!adminMode && <footer className="bg-stone-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-serif font-bold mb-6 tracking-tighter">Luxe & Loom</h2>
            <p className="text-stone-400 max-w-sm mb-8 leading-relaxed">
              {t.footer.desc}
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-gold-500 transition-colors cursor-pointer">
                <Star className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-gold-500 transition-colors cursor-pointer">
                <Check className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-[0.2em] mb-8 uppercase">{t.footer.shop}</h4>
            <ul className="space-y-4 text-stone-400">
              <li className="hover:text-white transition-colors cursor-pointer">{t.nav.collections}</li>
              <li className="hover:text-white transition-colors cursor-pointer">{t.nav.perfumes}</li>
              <li className="hover:text-white transition-colors cursor-pointer">{t.nav.clothing}</li>
              <li className="hover:text-white transition-colors cursor-pointer">Accessories</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-[0.2em] mb-8 uppercase">{t.footer.support}</h4>
            <ul className="space-y-4 text-stone-400">
              <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
              <li className="hover:text-white transition-colors cursor-pointer">Shipping Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Returns & Exchanges</li>
              <li className="hover:text-white transition-colors cursor-pointer">FAQs</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-stone-500 text-sm">
          <p>{t.footer.rights}</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer">{t.footer.privacy}</span>
            <span className="hover:text-white cursor-pointer">{t.footer.terms}</span>
          </div>
        </div>
      </footer>}
    </div>
  );
}
