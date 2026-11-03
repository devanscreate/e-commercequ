'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal. Periksa username dan password.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-surface p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-primary">
            Admin Backoffice
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Masuk untuk mengelola katalog, stok, dan pesanan toko.
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-surface py-2 pl-9 pr-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-surface py-2 pl-9 pr-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Toko
          </Link>
        </div>
      </div>
    </main>
  );
}

