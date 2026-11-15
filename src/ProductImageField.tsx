import React, { useId, useState } from 'react';
import { Language } from './types';
import { words } from './StoreEnhancements';

export default function ProductImageField({ name, label, initialValue = '', language }: {
  name: string; label: string; initialValue?: string; language: Language;
}) {
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (loading) return;
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError(words(language, 'Choose a JPG, PNG or WebP image under 10 MB.', 'Choisissez une image JPG, PNG ou WebP de moins de 10 Mo.', 'اختر صورة JPG أو PNG أو WebP بحجم أقل من 10 ميغابايت.'));
      input.value = '';
      return;
    }
    setLoading(true);
    input.setCustomValidity(words(language, 'Please wait for the image.', 'Veuillez patienter pendant le chargement de l’image.', 'يرجى انتظار تحميل الصورة.'));
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setValue(canvas.toDataURL('image/jpeg', 0.8));
    } catch {
      setError(words(language, 'This image could not be read. Choose another file.', 'Impossible de lire cette image. Choisissez un autre fichier.', 'تعذرت قراءة الصورة. اختر ملفاً آخر.'));
    } finally {
      URL.revokeObjectURL(url);
      input.setCustomValidity('');
      input.value = '';
      setLoading(false);
    }
  }

  return <div className="space-y-2">
    <label htmlFor={id} className="block text-xs font-bold text-stone-400 uppercase tracking-widest">{label}</label>
    <input type="hidden" name={name} value={value} />
    {value && <img src={value} alt={label} className="h-32 w-full rounded-xl border border-stone-200 bg-stone-50 object-contain" />}
    <label className="block text-sm font-medium text-stone-700">
      {words(language, 'Browse…', 'Parcourir…', 'تصفح…')}
      <input type="file" accept="image/jpeg,image/png,image/webp" aria-disabled={loading} onChange={selectFile} className="block w-full mt-2 text-xs text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-white" />
    </label>
    <p className="text-xs text-stone-500">{loading ? words(language, 'Preparing image…', 'Préparation de l’image…', 'جارٍ تجهيز الصورة…') : 'JPG, PNG, WebP · 10 MB max'}</p>
    <label htmlFor={`${id}-url`} className="block text-xs text-stone-500">{words(language, 'Or paste an image URL', 'Ou collez une URL d’image', 'أو ألصق رابط الصورة')}</label>
    <input id={`${id}-url`} type="text" value={value.startsWith('data:') ? '' : value} disabled={loading} onChange={event => { setValue(event.target.value); setError(''); }} placeholder="https://…" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl" />
    {value && <button type="button" disabled={loading} onClick={() => setValue('')} className="text-xs text-red-600">{words(language, 'Remove image', 'Supprimer l’image', 'حذف الصورة')}</button>}
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
  </div>;
}
