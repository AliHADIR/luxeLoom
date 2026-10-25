import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Star,
  ArrowRight,
  LayoutDashboard,
  Package,
  LogOut,
  Check,
  Filter,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Product, CartItem, Category, Language, StoreOrder, OrderStatus } from './types';
import { CATALOG_ADDITIONS, INITIAL_PRODUCTS } from './constants';
import { TRANSLATIONS } from './translations';
import logo from '../Images/logo.jpg';
import heroImage from '../Images/slide1.jpg';
import mobileHeroImage from '../Images/catalog/soft-florals.jpg';
import Fragranea from './Fragranea';
import { Signature, ScentFinder, BrandStory, perfumeDetails, words } from './StoreEnhancements';
import { STORE_DETAILS } from './storeDetails';

const CATEGORIES: Category[] = ['Homme', 'Femme', 'Niche'];
const categoryKeys: Record<Category, 'homme' | 'femme' | 'niche'> = {
  Homme: 'homme', Femme: 'femme', Niche: 'niche',
};
const LEGACY_SEED_IMAGES: Record<string, string> = {
  '1': 'photo-1541643600914-78b084683601',
  '3': 'photo-1594035910387-fea47794261f',
  '5': 'photo-1515377905703-c4788e51af15',
};
type AdminSection = 'overview' | 'products' | 'orders' | 'content';
type EditableStoreContent = { delivery: Record<Language, string>; returns: Record<Language, string> };

function readOrders(): StoreOrder[] {
  try {
    const value = JSON.parse(localStorage.getItem('luxe_loom_orders') || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function readStoreContent(): EditableStoreContent {
  try {
    const saved = JSON.parse(localStorage.getItem('luxe_loom_store_content') || '{}');
    return {
      delivery: { en: saved.delivery?.en || STORE_DETAILS.delivery?.en || '', fr: saved.delivery?.fr || STORE_DETAILS.delivery?.fr || '', ar: saved.delivery?.ar || STORE_DETAILS.delivery?.ar || '' },
      returns: { en: saved.returns?.en || STORE_DETAILS.returns?.en || '', fr: saved.returns?.fr || STORE_DETAILS.returns?.fr || '', ar: saved.returns?.ar || STORE_DETAILS.returns?.ar || '' },
    };
  } catch {
    return { delivery: { en: '', fr: '', ar: '' }, returns: { en: '', fr: '', ar: '' } };
  }
}

function migrateProduct(product: Product): Product | null {
  if (!product || String(product.category) === 'Clothing') return null;
  const seed = INITIAL_PRODUCTS.find(item => item.id === product.id);
  const hasLegacySeedImage = Boolean(seed && product.image?.includes(LEGACY_SEED_IMAGES[product.id]));
  const migratedImage = hasLegacySeedImage ? seed?.image : product.image;
  if (CATEGORIES.includes(product.category)) return { ...product, image: migratedImage || product.image };
  const name = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  const category: Category = /women|woman|femme|rose|floral|jasmine|velvet/.test(name)
    ? 'Femme'
    : /men|man|homme|masculine|foug[eè]re/.test(name)
      ? 'Homme'
      : 'Niche';
  return { ...product, category, image: migratedImage || product.image };
}

function readProducts(): Product[] {
  try {
    const saved = localStorage.getItem('luxe_loom_products');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    if (!Array.isArray(parsed)) return INITIAL_PRODUCTS;
    const savedProducts = parsed.map(migrateProduct).filter((product): product is Product => Boolean(product));
    const savedIds = new Set(savedProducts.map(product => product.id));
    return [...savedProducts, ...CATALOG_ADDITIONS.filter(product => !savedIds.has(product.id))];
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function readCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('luxe_loom_cart') || '[]');
    return Array.isArray(parsed) ? parsed.map((item: CartItem) => {
      const product = migrateProduct(item);
      return product ? { ...product, quantity: item.quantity } : null;
    }).filter((item: CartItem | null): item is CartItem => Boolean(item)) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const isInformationRoute = window.location.pathname === '/information' || window.location.pathname === '/information.html';
  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('luxe_loom_lang');
    return (saved as Language) || 'en';
  });

  const t = TRANSLATIONS[language];
  const [products, setProducts] = useState<Product[]>(readProducts);

  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [orders, setOrders] = useState<StoreOrder[]>(readOrders);
  const [storeContent, setStoreContent] = useState<EditableStoreContent>(readStoreContent);
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminProductFilter, setAdminProductFilter] = useState<'all' | 'low' | 'hidden'>('all');

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(isAdminRoute);
  const [authError, setAuthError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(() => {
    const category = new URLSearchParams(window.location.search).get('category');
    return CATEGORIES.includes(category as Category) ? category as Category : 'All';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Persist data
  useEffect(() => {
    const nextValue = JSON.stringify(products);
    if (localStorage.getItem('luxe_loom_products') !== nextValue) {
      localStorage.setItem('luxe_loom_products', nextValue);
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('luxe_loom_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const nextValue = JSON.stringify(orders);
    if (localStorage.getItem('luxe_loom_orders') !== nextValue) {
      localStorage.setItem('luxe_loom_orders', nextValue);
    }
  }, [orders]);

  useEffect(() => {
    const syncStoreData = (event: StorageEvent) => {
      if (!event.newValue) return;
      try {
        if (event.key === 'luxe_loom_products') {
          const nextProducts = JSON.parse(event.newValue);
          if (Array.isArray(nextProducts)) setProducts(nextProducts);
        }
        if (event.key === 'luxe_loom_orders') {
          const nextOrders = JSON.parse(event.newValue);
          if (Array.isArray(nextOrders)) setOrders(nextOrders);
        }
      } catch {
        // Ignore invalid data from another browser tab.
      }
    };
    window.addEventListener('storage', syncStoreData);
    return () => window.removeEventListener('storage', syncStoreData);
  }, []);

  useEffect(() => {
    localStorage.setItem('luxe_loom_store_content', JSON.stringify(storeContent));
  }, [storeContent]);

  useEffect(() => {
    localStorage.setItem('luxe_loom_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = isInformationRoute && language !== 'ar' ? 'fr' : language;
  }, [language, isInformationRoute]);

  useEffect(() => {
    if (!isAdminRoute) return;

    fetch('/api/admin-auth', { credentials: 'include' })
      .then(response => setIsAdmin(response.ok))
      .catch(() => setIsAdmin(false))
      .finally(() => setIsAuthLoading(false));
  }, [isAdminRoute]);

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/admin-auth', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: formData.get('password') }),
    });

    if (response.ok) {
      setIsAdmin(true);
      event.currentTarget.reset();
    } else {
      setAuthError(response.status === 503
        ? words(language, 'Admin access has not been configured.', 'L’accès administrateur n’est pas configuré.', 'لم يتم إعداد صلاحية المسؤول بعد.')
        : words(language, 'Incorrect password.', 'Mot de passe incorrect.', 'كلمة المرور غير صحيحة.'));
    }
  };

  const handleAdminLogout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE', credentials: 'include' });
    setIsAdmin(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.isActive !== false).filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const managedProducts = useMemo(() => products.filter(product => {
    const textMatch = `${product.name} ${product.description}`.toLowerCase().includes(adminProductSearch.toLowerCase());
    const filterMatch = adminProductFilter === 'all' || (adminProductFilter === 'low' ? product.stock <= 5 : product.isActive === false);
    return textMatch && filterMatch;
  }), [products, adminProductSearch, adminProductFilter]);
  const activeProducts = useMemo(() => products.filter(product => product.isActive !== false), [products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsOrderComplete(false);
    setCheckoutError('');
    setIsCheckoutOpen(true);
  };

  const handleCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const latestProducts = readProducts();
    const unavailableItem = cart.find(item => {
      const product = latestProducts.find(current => current.id === item.id);
      return !product || product.stock < item.quantity;
    });
    if (unavailableItem) {
      setCheckoutError(words(
        language,
        `${unavailableItem.name} no longer has enough stock. Update your bag and try again.`,
        `Le stock de ${unavailableItem.name} est insuffisant. Modifiez votre panier et réessayez.`,
        `الكمية المتاحة من ${unavailableItem.name} غير كافية. حدّث سلتك ثم أعد المحاولة.`,
      ));
      return;
    }

    const form = new FormData(e.currentTarget);
    const order: StoreOrder = {
      id: `FR-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer: {
        name: String(form.get('name') || ''),
        phone: String(form.get('phone') || ''),
        address: String(form.get('address') || ''),
        city: String(form.get('city') || ''),
      },
      items: cart,
      total: cartTotal,
      status: 'New',
    };
    const updatedOrders = [order, ...readOrders()];
    localStorage.setItem('luxe_loom_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    const updatedProducts = latestProducts.map(product => {
      const orderedItem = cart.find(item => item.id === product.id);
      return orderedItem ? { ...product, stock: product.stock - orderedItem.quantity } : product;
    });
    localStorage.setItem('luxe_loom_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setCart([]);
    setCheckoutError('');
    setIsOrderComplete(true);
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as Category,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1560362614-89027598847b?auto=format&fit=crop&q=80&w=800',
      stock: Number(formData.get('stock')),
      secondaryImage: String(formData.get('secondaryImage') || '').trim() || undefined,
      fragranceFamily: String(formData.get('fragranceFamily') || '').trim() || undefined,
      size: String(formData.get('size') || '').trim() || undefined,
    };
    setProducts(prev => [newProduct, ...prev]);
    setShowAddModal(false);
  };

  const handleUpdateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    const formData = new FormData(e.currentTarget);
    const updated: Product = {
      ...editingProduct,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as Category,
      image: formData.get('image') as string,
      stock: Number(formData.get('stock')),
      secondaryImage: String(formData.get('secondaryImage') || '').trim() || undefined,
      fragranceFamily: String(formData.get('fragranceFamily') || '').trim() || undefined,
      size: String(formData.get('size') || '').trim() || undefined,
    };
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(previous => previous.map(order => order.id === id ? { ...order, status } : order));
  };

  const exportCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const browseCollection = (category: Category | 'All') => {
    setSelectedCategory(category);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
    if (isInformationRoute) {
      window.location.href = `/?category=${encodeURIComponent(category)}#products`;
    } else {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const deleteProduct = (id: string) => {
    if (confirm(t.admin.deleteConfirm)) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <MotionConfig reducedMotion="user"><div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="store-nav fixed top-0 left-0 right-0 z-50 bg-[#281719]/95 backdrop-blur-md border-b border-[#b8945a]/30 text-[#f0dfbd] shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              {!isAdminRoute && (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 flex items-center gap-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Menu className="w-6 h-6" />
                  <span className="text-xs font-semibold tracking-widest">MENU</span>
                </button>
              )}
              <a href="/" aria-label="Fragranea Perfumery home" className="shrink-0 flex items-center gap-3">
                <img
                  src={logo}
                  alt="Fragranea Perfumery"
                  className="h-12 w-12 rounded-full object-cover shadow-sm ring-1 ring-[#c9a56a]/60"
                />
                <span className="hidden sm:block"><span className="block font-serif text-xl leading-tight tracking-wide">Fragranea</span><span className="block text-[9px] uppercase tracking-[.3em] text-[#c9a56a]">Perfumery</span></span>
              </a>
              {!isAdminRoute && <div className="hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide text-[#ead7b2]/80 uppercase">
                {(['All', ...CATEGORIES] as const).map(category => <button
                  key={category}
                  onClick={() => browseCollection(category)}
                  className={`hover:text-white transition-colors ${!isInformationRoute && selectedCategory === category ? 'text-white border-b-2 border-[#c9a56a]' : ''}`}
                >{category === 'All' ? t.nav.collections : t.category[categoryKeys[category]].toUpperCase()}</button>)}
                <a href="/#guide-parfum" className="hover:text-[#e4c58d] transition-colors">{language === 'en' ? 'THE ART OF PERFUME' : t.ui.guide}</a>
              </div>}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent border-none text-xs font-bold text-[#ead7b2] uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-white"
                >
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                  <option value="ar">AR</option>
                </select>
              </div>
              {!isAdminRoute && <div className="hidden md:flex items-center bg-white/10 border border-[#c9a56a]/25 rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-[#c9a56a]" />
                <input
                  type="text"
                  placeholder={t.nav.search}
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-40 text-white placeholder:text-[#ead7b2]/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>}
              {!isAdminRoute && <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-gold-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>}
              {isAdminRoute && isAdmin && (
                <>
                  <a href="/" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600" title={t.nav.store}>
                    <LayoutDashboard className="w-6 h-6" />
                  </a>
                  <button onClick={handleAdminLogout} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600" title={t.ui.logout}>
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!isAdminRoute && isMobileMenuOpen && <div className="fixed inset-0 z-[60] bg-stone-900/40" onClick={() => setIsMobileMenuOpen(false)}>
        <nav aria-label="Menu mobile" className="bg-gold-50 w-72 max-w-full h-full p-6 space-y-6 uppercase" onClick={e => e.stopPropagation()}>
          <button aria-label="Fermer le menu" onClick={() => setIsMobileMenuOpen(false)} className="block ml-auto"><X /></button>
          <a href="/" className="block font-serif text-xl">Fragranea</a>
          {(['All', ...CATEGORIES] as const).map(category => <a key={category} href={`/?category=${encodeURIComponent(category)}#products`} className="block py-2" onClick={event => { event.preventDefault(); browseCollection(category); }}>{category === 'All' ? t.nav.collections : t.category[categoryKeys[category]].toUpperCase()}</a>)}
          <a href="/#guide-parfum" onClick={() => setIsMobileMenuOpen(false)} className="block text-gold-700">{t.ui.guide}</a>
        </nav>
      </div>}

      {/* Main Content */}
      <main className="pt-20">
        {isInformationRoute ? <Fragranea language={language} /> : !isAdminRoute ? (
          <>
            {/* Hero Section */}
            <section className="store-hero bg-[#1a1110]">
              <picture className="store-hero-art block h-[58vh] min-h-[400px] max-h-[680px] md:h-[34vw] md:min-h-[440px]">
                <source media="(max-width: 767px)" srcSet={mobileHeroImage} />
                <img src={heroImage} alt="Fragranea Perfumery — sélection de parfums" className="w-full h-full object-cover object-center" />
              </picture>
              <div className="store-hero-copy">
                <div><p className="eyebrow">{t.hero.subtitle}</p><h1>{words(language, 'A scent that feels like you.', 'Un parfum qui vous ressemble.', 'عطر يشبهك.')}</h1><p className="hero-description">{words(language, 'Discover a considered collection of memorable fragrances, chosen to become part of your story.', 'Découvrez une collection de parfums singuliers, choisis pour accompagner votre histoire.', 'اكتشف تشكيلة من العطور المميزة التي ترافق قصتك.')}</p></div>
                <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="hero-cta">
                  {t.hero.cta} <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </section>

            <Signature products={activeProducts} language={language} discover={product => { setSelectedCategory(product.category); setSearchQuery(product.name); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} />
            <ScentFinder products={activeProducts} language={language} discover={product => { setSelectedCategory(product.category); setSearchQuery(product.name); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} />
            {/* Products Grid */}
            <section id="products" className="store-catalog max-w-7xl mx-auto px-4 py-24">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-4">{t.store.title}</h3>
                  <p className="text-stone-500 max-w-md">{t.store.description}</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                  {(['All', ...CATEGORIES] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`store-category px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-stone-900 text-white shadow-lg'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-gold-400'
                      }`}
                    >
                      {cat === 'All' ? t.category.all : t.category[categoryKeys[cat]]}
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
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="store-card group lux-product"
                    >
                      <div className="store-photo-frame relative aspect-[4/5] overflow-hidden bg-stone-100 mb-6 rounded-none">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="store-product-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {product.secondaryImage && <img src={product.secondaryImage} alt={`${product.name} — ${words(language, 'alternate view', 'autre vue', 'منظر آخر')}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />}
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500" />
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-stone-900 px-6 py-3 rounded-full font-medium shadow-xl opacity-100 translate-y-0 transition-all duration-300 hover:bg-gold-500 hover:text-white flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> {t.store.addToBag}
                        </button>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-stone-900 uppercase">
                          {t.category[categoryKeys[product.category]]}
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-serif font-bold mb-1 group-hover:text-gold-600 transition-colors">{product.name}</h4>
                          <p className="text-stone-500 text-sm line-clamp-1">{product.description}</p>
                          <p className="text-xs text-gold-700 mt-3">{[product.fragranceFamily || perfumeDetails(product)?.family, product.size].filter(Boolean).join(' · ')}</p>
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
            {(storeContent.delivery[language] || storeContent.returns[language]) && <aside className="max-w-7xl mx-auto px-4 pb-12 grid sm:grid-cols-2 gap-6">{storeContent.delivery[language] && <div className="border border-stone-200 rounded-xl p-6"><h3 className="font-serif text-xl mb-3">{words(language, 'Delivery', 'Livraison', 'التوصيل')}</h3><p className="text-sm text-stone-600">{storeContent.delivery[language]}</p></div>}{storeContent.returns[language] && <div className="border border-stone-200 rounded-xl p-6"><h3 className="font-serif text-xl mb-3">{words(language, 'Returns', 'Retours', 'الإرجاع')}</h3><p className="text-sm text-stone-600">{storeContent.returns[language]}</p></div>}</aside>}
            {STORE_DETAILS.reviews.length > 0 && <section className="lux-reveal max-w-7xl mx-auto px-4 py-16"><h2 className="font-serif text-4xl mb-10">{words(language, 'From our customers', 'Les mots de nos clients', 'آراء عملائنا')}</h2><div className="grid md:grid-cols-3 gap-8">{STORE_DETAILS.reviews.map(review => <figure key={review.id} className="bg-white border border-gold-200 rounded-2xl p-8"><blockquote className="font-serif text-xl leading-relaxed mb-6">“{review.quote[language]}”</blockquote><figcaption className="text-sm text-stone-500">{review.author}</figcaption></figure>)}</div></section>}
            <BrandStory language={language} />
            <Fragranea embedded language={language} />
          </>
        ) : isAuthLoading ? (
          <div className="min-h-[70vh] flex items-center justify-center px-4">
            <p className="text-stone-500">{t.ui.checkingAdmin}</p>
          </div>
        ) : !isAdmin ? (
          <div className="min-h-[70vh] flex items-center justify-center px-4">
            <form onSubmit={handleAdminLogin} className="w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-xl p-8 sm:p-10">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-serif font-bold mb-2">{t.ui.adminLogin}</h2>
              <p className="text-stone-500 mb-8">{t.ui.adminLoginDescription}</p>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2" htmlFor="admin-password">{t.ui.password}</label>
              <input id="admin-password" name="password" type="password" required autoComplete="current-password" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
              {authError && <p className="text-red-600 text-sm mt-3" role="alert">{authError}</p>}
              <button className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 transition-colors shadow-lg mt-6">{t.ui.signIn}</button>
              <a href="/" className="block text-center text-sm text-stone-500 hover:text-stone-900 mt-5">{t.ui.returnToStore}</a>
            </form>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-wrap justify-between items-end gap-5 mb-8">
              <div><p className="text-xs uppercase tracking-[.25em] text-gold-700 mb-2">Fragranea · Admin</p><h2 className="text-4xl font-serif font-bold mb-2">{t.admin.title}</h2><p className="text-stone-500">{t.admin.description}</p></div>
              {adminSection === 'products' && <button onClick={() => setShowAddModal(true)} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"><Plus className="w-5 h-5" />{t.admin.addBtn}</button>}
            </div>
            <div className="flex gap-2 overflow-x-auto border-b border-stone-200 mb-8">
              {(['overview', 'products', 'orders', 'content'] as AdminSection[]).map(section => <button key={section} onClick={() => setAdminSection(section)} className={`px-4 py-3 whitespace-nowrap border-b-2 font-medium ${adminSection === section ? 'border-[#b8945a] text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}>{({ overview: words(language, 'Overview', 'Vue d’ensemble', 'نظرة عامة'), products: words(language, 'Products', 'Produits', 'المنتجات'), orders: words(language, 'Orders', 'Commandes', 'الطلبات'), content: words(language, 'Store content', 'Contenu du site', 'محتوى المتجر') })[section]}{section === 'orders' && orders.filter(order => order.status === 'New').length > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs">{orders.filter(order => order.status === 'New').length}</span>}</button>)}
            </div>

            {adminSection === 'overview' && <div className="space-y-8">
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  [words(language, 'Products', 'Produits', 'المنتجات'), String(products.length), words(language, 'in catalogue', 'au catalogue', 'في الكتالوج')],
                  [words(language, 'Low stock', 'Stock faible', 'مخزون منخفض'), String(products.filter(product => product.stock <= 5).length), words(language, '5 units or fewer', '5 unités ou moins', '٥ قطع أو أقل')],
                  [words(language, 'New orders', 'Nouvelles commandes', 'طلبات جديدة'), String(orders.filter(order => order.status === 'New').length), words(language, 'need attention', 'à traiter', 'تحتاج إلى متابعة')],
                  [words(language, 'Sales recorded', 'Ventes enregistrées', 'المبيعات المسجلة'), `${orders.filter(order => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0)} ${t.currency}`, words(language, 'from this browser', 'sur cet appareil', 'على هذا الجهاز')],
                ].map(([label, value, caption]) => <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm"><p className="text-sm text-stone-500">{label}</p><p className="text-3xl font-serif font-bold mt-2">{value}</p><p className="text-xs text-stone-400 mt-2">{caption}</p></div>)}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <section className="bg-white border border-stone-200 rounded-2xl p-6"><div className="flex justify-between items-center mb-5"><h3 className="text-xl font-serif font-bold">{words(language, 'Stock to review', 'Stock à vérifier', 'مخزون يحتاج إلى مراجعة')}</h3><button onClick={() => { setAdminProductFilter('low'); setAdminSection('products'); }} className="text-sm underline">{words(language, 'View products', 'Voir les produits', 'عرض المنتجات')}</button></div>{products.filter(product => product.stock <= 5).length ? products.filter(product => product.stock <= 5).slice(0, 5).map(product => <div key={product.id} className="flex justify-between items-center py-3 border-t border-stone-100"><div><p className="font-medium">{product.name}</p><p className="text-xs text-stone-500">{product.stock} {t.admin.table.units} · {t.category[categoryKeys[product.category]]}</p></div><button onClick={() => setEditingProduct(product)} className="text-sm underline">{words(language, 'Edit', 'Modifier', 'تعديل')}</button></div>) : <p className="text-sm text-stone-500">{words(language, 'No low-stock products.', 'Aucun produit en stock faible.', 'لا توجد منتجات منخفضة المخزون.')}</p>}</section>
                <section className="bg-white border border-stone-200 rounded-2xl p-6"><div className="flex justify-between items-center mb-5"><h3 className="text-xl font-serif font-bold">{words(language, 'Recent orders', 'Commandes récentes', 'أحدث الطلبات')}</h3><button onClick={() => setAdminSection('orders')} className="text-sm underline">{words(language, 'View all', 'Tout voir', 'عرض الكل')}</button></div>{orders.length ? orders.slice(0, 5).map(order => <div key={order.id} className="flex justify-between items-center py-3 border-t border-stone-100"><div><p className="font-medium">{order.customer.name}</p><p className="text-xs text-stone-500">{order.id} · {new Date(order.createdAt).toLocaleDateString()}</p></div><span className="text-sm">{order.total} {t.currency}</span></div>) : <p className="text-sm text-stone-500">{words(language, 'Orders placed on this browser will appear here.', 'Les commandes passées sur cet appareil apparaîtront ici.', 'ستظهر هنا الطلبات التي يتم تقديمها على هذا الجهاز.')}</p>}</section>
              </div>
            </div>}

            {adminSection === 'products' && <div className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between bg-white border border-stone-200 rounded-2xl p-4">
                <input value={adminProductSearch} onChange={event => setAdminProductSearch(event.target.value)} placeholder={words(language, 'Search products…', 'Rechercher un produit…', 'ابحث عن المنتجات…')} className="min-w-[220px] flex-1 px-4 py-2.5 rounded-xl border border-stone-200" />
                <select value={adminProductFilter} onChange={event => setAdminProductFilter(event.target.value as typeof adminProductFilter)} className="px-4 py-2.5 rounded-xl border border-stone-200"><option value="all">{words(language, 'All products', 'Tous les produits', 'كل المنتجات')}</option><option value="low">{words(language, 'Low stock (≤5)', 'Stock faible (≤5)', 'مخزون منخفض (≤٥)')}</option><option value="hidden">{words(language, 'Hidden products', 'Produits masqués', 'المنتجات المخفية')}</option></select>
                <button onClick={() => exportCsv('fragranea-products.csv', [[t.admin.table.product, t.admin.table.category, t.admin.table.price, t.admin.table.stock, 'Visible'], ...products.map(product => [product.name, product.category, String(product.price), String(product.stock), product.isActive === false ? 'No' : 'Yes'])])} className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50">{words(language, 'Export CSV', 'Exporter CSV', 'تصدير CSV')}</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-stone-50 border-b border-stone-200"><tr><th className="px-5 py-4 text-xs uppercase tracking-widest text-stone-400">{t.admin.table.product}</th><th className="px-5 py-4 text-xs uppercase tracking-widest text-stone-400">{t.admin.table.category}</th><th className="px-5 py-4 text-xs uppercase tracking-widest text-stone-400">{t.admin.table.price}</th><th className="px-5 py-4 text-xs uppercase tracking-widest text-stone-400">{t.admin.table.stock}</th><th className="px-5 py-4 text-xs uppercase tracking-widest text-stone-400">{words(language, 'Visibility', 'Visibilité', 'الظهور')}</th><th className="px-5 py-4 text-xs uppercase tracking-widest text-stone-400 text-right">{t.admin.table.actions}</th></tr></thead><tbody className="divide-y divide-stone-100">{managedProducts.map(product => <tr key={product.id} className="hover:bg-stone-50/50"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-bold">{product.name}</p><p className="text-xs text-stone-500 max-w-[220px] truncate">{product.description}</p></div></div></td><td className="px-5 py-4">{t.category[categoryKeys[product.category]]}</td><td className="px-5 py-4">{product.price} {t.currency}</td><td className="px-5 py-4"><span className={product.stock <= 5 ? 'text-orange-700 font-semibold' : ''}>{product.stock} {t.admin.table.units}</span></td><td className="px-5 py-4">{product.isActive === false ? words(language, 'Hidden', 'Masqué', 'مخفي') : words(language, 'Live', 'En ligne', 'ظاهر')}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button title={words(language, 'Edit', 'Modifier', 'تعديل')} onClick={() => setEditingProduct(product)} className="p-2 hover:bg-stone-100 rounded-lg"><Edit2 className="w-4 h-4" /></button><button title={product.isActive === false ? words(language, 'Publish', 'Publier', 'نشر') : words(language, 'Hide', 'Masquer', 'إخفاء')} onClick={() => setProducts(previous => previous.map(item => item.id === product.id ? { ...item, isActive: item.isActive === false } : item))} className="p-2 hover:bg-stone-100 rounded-lg">{product.isActive === false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button><button title={words(language, 'Duplicate', 'Dupliquer', 'نسخ')} onClick={() => setProducts(previous => [{ ...product, id: Date.now().toString(), name: `${product.name} (${words(language, 'Copy', 'Copie', 'نسخة')})`, isActive: false }, ...previous])} className="p-2 hover:bg-stone-100 rounded-lg"><Copy className="w-4 h-4" /></button><button title={words(language, 'Delete', 'Supprimer', 'حذف')} onClick={() => deleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>{managedProducts.length === 0 && <p className="text-center py-12 text-stone-500">{words(language, 'No matching products.', 'Aucun produit correspondant.', 'لا توجد منتجات مطابقة.')}</p>}</div></div>
            </div>}

            {adminSection === 'orders' && <div className="space-y-4"><div className="flex justify-end"><button onClick={() => exportCsv('fragranea-orders.csv', [[words(language, 'Order', 'Commande', 'الطلب'), words(language, 'Date', 'Date', 'التاريخ'), words(language, 'Customer', 'Client', 'العميل'), words(language, 'Phone', 'Téléphone', 'الهاتف'), words(language, 'Address', 'Adresse', 'العنوان'), words(language, 'Total', 'Total', 'الإجمالي'), words(language, 'Status', 'Statut', 'الحالة')], ...orders.map(order => [order.id, order.createdAt, order.customer.name, order.customer.phone, `${order.customer.address}, ${order.customer.city}`, String(order.total), order.status])])} className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white">{words(language, 'Export orders CSV', 'Exporter les commandes CSV', 'تصدير الطلبات CSV')}</button></div>{orders.length ? orders.map(order => <article key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5"><div className="flex flex-wrap justify-between gap-4"><div><p className="font-bold">{order.id} · {order.customer.name}</p><p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleString()} · {order.customer.phone}</p><p className="text-sm text-stone-500">{order.customer.address}, {order.customer.city}</p></div><div className="flex items-center gap-4"><strong>{order.total} {t.currency}</strong><select value={order.status} onChange={event => updateOrderStatus(order.id, event.target.value as OrderStatus)} className="rounded-lg border border-stone-200 px-3 py-2"><option value="New">{words(language, 'New', 'Nouvelle', 'جديد')}</option><option value="Confirmed">{words(language, 'Confirmed', 'Confirmée', 'مؤكدة')}</option><option value="Fulfilled">{words(language, 'Fulfilled', 'Terminée', 'مكتملة')}</option><option value="Cancelled">{words(language, 'Cancelled', 'Annulée', 'ملغاة')}</option></select></div></div><details className="mt-4 border-t border-stone-100 pt-3"><summary className="cursor-pointer text-sm">{words(language, 'Order items', 'Articles commandés', 'عناصر الطلب')}</summary><ul className="mt-3 space-y-1 text-sm text-stone-600">{order.items.map(item => <li key={item.id}>{item.quantity} × {item.name} — {item.price * item.quantity} {t.currency}</li>)}</ul></details></article>) : <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-500">{words(language, 'No orders yet. Orders submitted on this browser will be listed here.', 'Aucune commande. Les commandes passées sur cet appareil seront affichées ici.', 'لا توجد طلبات بعد. ستظهر هنا الطلبات التي يتم إرسالها من هذا الجهاز.')}</div>}</div>}

            {adminSection === 'content' && <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8"><div className="mb-7"><h3 className="text-2xl font-serif font-bold">{words(language, 'Store policies', 'Informations de la boutique', 'سياسات المتجر')}</h3><p className="text-sm text-stone-500 mt-2">{words(language, 'Edit delivery and returns copy for each storefront language. Changes save automatically on this browser.', 'Modifiez les textes de livraison et de retour pour chaque langue. Les modifications sont enregistrées automatiquement sur cet appareil.', 'عدّل نصوص التوصيل والإرجاع لكل لغة. تُحفظ التغييرات تلقائياً على هذا الجهاز.')}</p></div><div className="grid lg:grid-cols-2 gap-8">{(['delivery', 'returns'] as const).map(key => <section key={key}><h4 className="font-bold mb-4">{key === 'delivery' ? words(language, 'Delivery information', 'Livraison', 'معلومات التوصيل') : words(language, 'Returns information', 'Retours', 'معلومات الإرجاع')}</h4>{(['en', 'fr', 'ar'] as Language[]).map(locale => <label key={locale} className="block mb-4"><span className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">{locale.toUpperCase()}</span><textarea dir={locale === 'ar' ? 'rtl' : 'ltr'} rows={4} value={storeContent[key][locale]} onChange={event => setStoreContent(previous => ({ ...previous, [key]: { ...previous[key], [locale]: event.target.value } }))} placeholder={words(locale, 'Add the policy text shown on your storefront…', 'Saisissez le texte affiché sur la boutique…', 'أدخل النص الذي سيظهر في المتجر…')} className="w-full rounded-xl border border-stone-200 p-3" /></label>)}</section>)}</div><p className="text-xs text-stone-400 border-t border-stone-100 pt-4">{words(language, 'Catalog, orders and store content are currently saved in this browser only.', 'Le catalogue, les commandes et le contenu sont enregistrés uniquement dans ce navigateur.', 'يتم حفظ الكتالوج والطلبات ومحتوى المتجر في هذا المتصفح فقط حالياً.')}</p></div>}
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold">{t.cart.title}</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} alt="" className="cart-product-thumb w-24 h-32 object-cover rounded-xl" referrerPolicy="no-referrer" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-stone-900">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-stone-500">{t.category[categoryKeys[item.category]]}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center border border-stone-200 rounded-full px-2 py-1">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:text-gold-600">-</button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:text-gold-600">+</button>
                          </div>
                          <span className="font-bold">{item.price * item.quantity} {t.currency}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
                  <div className="flex justify-between text-stone-500">
                    <span>{t.cart.subtotal}</span>
                    <span>{cartTotal} {t.currency}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{t.cart.shipping}</span>
                    <span>{t.cart.shippingNote}</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif font-bold pt-2 border-t border-stone-200">
                    <span>{t.cart.total}</span>
                    <span>{cartTotal} {t.currency}</span>
                  </div>
                  <button
                    type="button"
                    onClick={openCheckout}
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 transition-colors shadow-lg"
                  >
                    {t.cart.checkout}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="checkout-title"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-white z-[90] rounded-3xl shadow-2xl"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 id="checkout-title" className="text-2xl font-serif font-bold">
                      {isOrderComplete ? t.checkout.successTitle : t.checkout.title}
                    </h3>
                    <p className="text-stone-500 mt-1">
                      {isOrderComplete ? t.checkout.successMessage : t.checkout.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t.ui.close}
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-2 hover:bg-stone-100 rounded-full shrink-0"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {isOrderComplete ? (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
                      <Check className="w-10 h-10" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 transition-colors"
                    >
                      {t.checkout.continue}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <input name="name" required autoComplete="name" placeholder={t.checkout.name} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                    <input name="phone" required type="tel" autoComplete="tel" placeholder={t.checkout.phone} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                    <textarea name="address" required autoComplete="street-address" rows={3} placeholder={t.checkout.address} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none" />
                    <input name="city" required autoComplete="address-level2" placeholder={t.checkout.city} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                    <div className="rounded-xl border border-stone-200 p-4">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.checkout.payment}</p>
                      <label className="flex items-center gap-3 font-medium">
                        <input type="radio" name="payment" value="cash" defaultChecked className="accent-stone-900" />
                        {t.checkout.cash}
                      </label>
                    </div>
                    <div className="flex justify-between text-lg font-serif font-bold pt-2">
                      <span>{t.cart.total}</span>
                      <span>{cartTotal} {t.currency}</span>
                    </div>
                    {checkoutError && <p className="text-red-600 text-sm" role="alert">{checkoutError}</p>}
                    <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 transition-colors shadow-lg">
                      {t.checkout.placeOrder}
                    </button>
                  </form>
                )}
              </div>
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white z-[90] rounded-3xl shadow-2xl overflow-y-auto max-h-[90dvh]"
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
                        placeholder={t.ui.productNamePlaceholder}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.desc}</label>
                      <textarea
                        name="description"
                        required
                        defaultValue={editingProduct?.description}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all h-24 resize-none"
                        placeholder={t.ui.productDescriptionPlaceholder}
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
                        defaultValue={editingProduct?.category || 'Homme'}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      >
                        <option value="Homme">{t.category.homme}</option>
                        <option value="Femme">{t.category.femme}</option>
                        <option value="Niche">{t.category.niche}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{t.admin.modal.image}</label>
                      <input
                        name="image"
                        defaultValue={editingProduct?.image}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">{([
                    ['secondaryImage', words(language, 'Second image URL', 'URL de la seconde image', 'رابط الصورة الثانية')],
                    ['fragranceFamily', words(language, 'Fragrance family', 'Famille olfactive', 'العائلة العطرية')],
                    ['size', words(language, 'Size (e.g. 50 ml)', 'Contenance (ex. 50 ml)', 'الحجم (مثلاً 50 مل)')],
                  ] as const).map(([field, label]) => <label key={field} className="text-xs text-stone-500">{label}<input name={field} type={field === 'secondaryImage' ? 'url' : 'text'} defaultValue={editingProduct?.[field]} className="block w-full mt-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" /></label>)}</div>
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
      {!isAdminRoute && <footer className="bg-stone-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <img
              src={logo}
              alt="Fragranea Perfumery"
              className="w-40 rounded-2xl mb-6"
            />
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
              <li><a href="/#products" onClick={() => browseCollection('All')} className="hover:text-white transition-colors">{t.nav.collections}</a></li>
              {CATEGORIES.map(category => <li key={category}><a href={`/?category=${category}#products`} onClick={event => { event.preventDefault(); browseCollection(category); }} className="hover:text-white transition-colors">{t.category[categoryKeys[category]]}</a></li>)}
              <li><a href="/#guide-parfum" className="hover:text-white transition-colors">{t.footer.guide}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-[0.2em] mb-8 uppercase">{t.footer.support}</h4>
            <ul className="space-y-4 text-stone-400">
              <li className="hover:text-white transition-colors cursor-pointer">{t.footer.contact}</li>
              <li className="hover:text-white transition-colors cursor-pointer">{t.footer.shipping}</li>
              <li className="hover:text-white transition-colors cursor-pointer">{t.footer.returns}</li>
              <li className="hover:text-white transition-colors cursor-pointer">{t.footer.faqs}</li>
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
    </div></MotionConfig>
  );
}
