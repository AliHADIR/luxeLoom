'use client';

import { FormEvent, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: formData.get('password') }),
    });
    setLoading(false);
    if (response.ok) {
      router.refresh();
      return;
    }
    setError(response.status === 503 ? 'Admin access has not been configured.' : 'Incorrect password.');
  };

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-xl p-8 sm:p-10">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center mb-6">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Admin sign in</h1>
        <p className="text-stone-500 mb-8">Enter your private password to manage the store.</p>
        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2" htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" required autoComplete="current-password" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
        {error && <p className="text-red-600 text-sm mt-3" role="alert">{error}</p>}
        <button disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-gold-600 disabled:opacity-60 transition-colors shadow-lg mt-6">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <Link href="/" className="block text-center text-sm text-stone-500 hover:text-stone-900 mt-5">Return to storefront</Link>
      </form>
    </main>
  );
}
