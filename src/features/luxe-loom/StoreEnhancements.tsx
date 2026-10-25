'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Language, Product } from './types';

export const words = (language: Language, en: string, fr: string, ar: string) => language === 'fr' ? fr : language === 'ar' ? ar : en;
export function perfumeDetails(product: Product) {
  if (product.category !== 'Perfume') return undefined;
  const text = `${product.name} ${product.description}`.toLowerCase();
  const inferredNotes = ['jasmine', 'vanilla', 'agarwood', 'saffron', 'rose', 'amber'].filter(note => text.includes(note));
  const family = text.includes('wood') || text.includes('oud') ? 'Woody' : inferredNotes.some(note => ['jasmine', 'rose'].includes(note)) ? 'Floral' : undefined;
  return { notes: product.details?.notes || inferredNotes, family: product.fragranceFamily || product.details?.scentFamily || family };
}

export function Signature({ products, language, discover }: { products: Product[]; language: Language; discover: (product: Product) => void }) {
  const product = products.find(p => p.category === 'Perfume' && p.stock > 0);
  if (!product) return null;
  const details = perfumeDetails(product);
  return <section className="lux-reveal max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-20 items-center">
    <div className="relative aspect-[4/5] overflow-hidden rounded-t-[10rem] bg-stone-100"><img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" /><span className="absolute bottom-6 left-6 bg-white/90 px-5 py-3 text-xs tracking-widest uppercase">Luxe & Loom</span></div>
    <div><p className="text-xs tracking-[.25em] uppercase text-gold-700 mb-5">{words(language, 'The fragrance spotlight', 'Le parfum à l’honneur', 'عطر تحت الأضواء')}</p><h2 className="font-serif text-5xl md:text-6xl leading-tight mb-6">{product.name}</h2><p className="text-stone-500 leading-relaxed max-w-md mb-8">{product.description}</p><div className="flex flex-wrap gap-3 mb-10">{details?.notes.map(note => <span key={note} className="border border-gold-200 rounded-full px-5 py-2 text-sm capitalize">{note}</span>)}</div><p className="text-xl mb-6">{product.price} MAD</p><button onClick={() => discover(product)} className="inline-flex items-center gap-4 bg-stone-900 text-white rounded-full px-8 py-4 hover:bg-gold-700 transition-colors">{words(language, 'Discover', 'Découvrir', 'اكتشف')} <ArrowRight size={18} /></button></div>
  </section>;
}

export function ScentFinder({ products, language, discover }: { products: Product[]; language: Language; discover: (product: Product) => void }) {
  const [mood, setMood] = useState('soft');
  const [occasion, setOccasion] = useState('everyday');
  const [note, setNote] = useState('any');
  const [shown, setShown] = useState(false);
  const perfumes = products.filter(p => p.category === 'Perfume' && p.stock > 0);
  const ranked = perfumes.map(p => {
    const detail = perfumeDetails(p);
    const text = p.description.toLowerCase();
    return { product: p, score: (note !== 'any' && detail?.notes.includes(note) ? 4 : 0) + (mood === 'bold' && detail?.family === 'Woody' || mood === 'soft' && detail?.family === 'Floral' ? 2 : 0) + (occasion === 'evening' && /dark|night|smok|deep/.test(text) ? 1 : 0) };
  }).sort((a, b) => b.score - a.score);
  const options = [
    { label: words(language, 'Your mood', 'Votre humeur', 'مزاجك'), value: mood, setter: setMood, items: [['soft', words(language, 'Soft & romantic', 'Doux et romantique', 'ناعم ورومانسي')], ['bold', words(language, 'Bold & expressive', 'Intense et expressif', 'جريء ومعبر')]] },
    { label: words(language, 'The occasion', 'L’occasion', 'المناسبة'), value: occasion, setter: setOccasion, items: [['everyday', words(language, 'Everyday ritual', 'Au quotidien', 'كل يوم')], ['evening', words(language, 'An evening out', 'Une soirée', 'أمسية')]] },
    { label: words(language, 'A note you love', 'Une note que vous aimez', 'نغمتك المفضلة'), value: note, setter: setNote, items: [['any', words(language, 'Surprise me', 'Surprenez-moi', 'فاجئني')], ...Array.from(new Set(perfumes.flatMap(p => perfumeDetails(p)?.notes || []))).map(n => [n, n])] }
  ];
  return <section id="scent-finder" className="lux-reveal bg-gold-100 border-y border-gold-200"><div className="max-w-7xl mx-auto px-4 py-16 md:py-20"><p className="text-xs uppercase tracking-[.25em] text-gold-700 mb-4">{words(language, 'A little discovery', 'Un instant de découverte', 'لحظة اكتشاف')}</p><h2 className="font-serif text-4xl mb-4">{words(language, 'Find a fragrance that feels like you.', 'Trouvez un parfum qui vous ressemble.', 'اكتشف عطراً يشبهك.')}</h2><p className="text-stone-600 mb-10">{words(language, 'Explore suggestions based on the notes in our collection.', 'Explorez des suggestions selon les notes de notre collection.', 'اكتشف اقتراحات حسب نغمات مجموعتنا.')}</p><div className="grid sm:grid-cols-3 gap-6">{options.map(o => <label key={o.label} className="text-sm">{o.label}<select value={o.value} onChange={e => { o.setter(e.target.value); setShown(false); }} className="block w-full mt-3 bg-white border border-gold-200 rounded-xl p-4 capitalize">{o.items.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div><button onClick={() => setShown(true)} className="mt-8 bg-stone-900 text-white px-7 py-4 rounded-full hover:bg-gold-700 transition-colors">{words(language, 'Find my fragrance', 'Trouver mon parfum', 'ابحث عن عطري')}</button>{shown && <div aria-live="polite" className="mt-8 border-t border-gold-200 pt-8">{ranked[0] ? <div className="flex flex-wrap items-center gap-6"><img src={ranked[0].product.image} alt="" className="w-20 h-24 object-cover rounded-lg" /><div><p className="text-xs uppercase tracking-widest text-gold-700 mb-2">{words(language, 'Your suggested fragrance', 'Votre parfum suggéré', 'عطرك المقترح')}</p><h3 className="font-serif text-2xl">{ranked[0].product.name}</h3><p className="text-sm text-stone-600 mt-2">{ranked[0].product.description}</p></div><button onClick={() => discover(ranked[0].product)} className="underline underline-offset-4">{words(language, 'Discover', 'Découvrir', 'اكتشف')}</button></div> : <p>{words(language, 'No fragrances available yet.', 'Aucun parfum disponible actuellement.', 'لا توجد عطور متاحة حالياً.')}</p>}</div>}</div></section>;
}

export function BrandStory({ language }: { language: Language }) {
  return <section className="lux-reveal max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-20 items-center"><div><p className="text-xs tracking-[.25em] uppercase text-gold-700 mb-5">{words(language, 'The world of Luxe & Loom', 'L’univers Luxe & Loom', 'عالم لوكس آند لوم')}</p><h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">{words(language, 'A love of scent. A sense of style.', 'L’amour du parfum. Le sens du style.', 'حب العطر. إحساس بالأناقة.')}</h2><p className="text-stone-500 leading-relaxed">{words(language, 'Fragrance and clothing share a quiet language: texture, character, and the way they make you feel. Luxe & Loom brings these worlds together, inviting you to explore expressive scents and considered silhouettes, and make them your own.', 'Le parfum et le vêtement partagent un langage discret : la texture, le caractère et l’émotion. Luxe & Loom réunit ces univers et vous invite à explorer des senteurs expressives et des silhouettes élégantes, pour trouver votre propre expression.', 'يتشارك العطر والملابس لغة هادئة: الملمس والشخصية والإحساس. يجمع لوكس آند لوم هذين العالمين ويدعوك لاكتشاف روائح معبرة وإطلالات أنيقة تعكس شخصيتك.')}</p></div><img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000" alt={words(language, 'Perfume still life', 'Nature morte de parfum', 'صورة فنية للعطر')} loading="lazy" className="w-full aspect-[5/4] object-cover rounded-2xl" /></section>;
}
