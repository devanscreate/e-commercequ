'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Search, SlidersHorizontal, PackageX, Sparkles } from 'lucide-react';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mengambil kategori
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Gagal mengambil kategori:', err));
  }, []);

  // Mengambil produk berdasarkan filter
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (selectedCategory !== 'all') {
      params.append('category_id', selectedCategory);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    fetch(`/api/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat katalog produk');
        return res.json();
      })
      .then((data) => {
        if (!isCancelled) {
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts([]);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || 'Terjadi kesalahan saat memuat data');
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, searchQuery]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Banner Sederhana & Ramah */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-surface p-6 sm:p-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Belanja Mudah Tanpa Ribet Akun
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Koleksi Produk Terpilih & Siap Kirim
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Pilih barang favoritmu, checkout langsung, dan selesaikan pesanan dengan konfirmasi WhatsApp instan.
          </p>
        </div>
      </section>

      {/* Bar Pencarian & Filter Kategori */}
      <section className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Input Cari */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-surface py-2 pl-9 pr-3 text-sm text-primary placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Filter Pills Kategori */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 bg-surface text-slate-700 hover:bg-slate-50'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 font-medium transition-colors ${
                  selectedCategory === String(cat.id)
                    ? 'bg-primary text-white'
                    : 'border border-slate-200 bg-surface text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Skeleton Loading State (Antisipasi Database Cold Start Sesuai PRD) */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-slate-200 bg-surface p-3"
            >
              <div className="aspect-square w-full rounded-lg bg-slate-200" />
              <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-1/2 rounded bg-slate-200" />
              <div className="mt-3 h-8 w-full rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-light"
          >
            Muat Ulang Halaman
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-surface py-16 text-center">
          <PackageX className="h-12 w-12 text-slate-300 stroke-1" />
          <h2 className="mt-3 text-base font-semibold text-primary">
            Tidak ada produk yang ditemukan
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? `Tidak ditemukan hasil untuk "${searchQuery}". Coba kata kunci lain.`
              : 'Belum ada produk aktif yang tersedia di kategori ini.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
