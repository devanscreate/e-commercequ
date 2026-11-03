'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Weight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    setIsLoading(true);

    fetch(`/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Produk tidak ditemukan');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat produk');
        setIsLoading(false);
      });
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-20 w-full animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
        <h1 className="mt-4 text-lg font-bold text-primary">Produk Tidak Ditemukan</h1>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>
      </main>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    router.push('/cart');
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Foto Produk */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-surface">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Package className="h-20 w-20 stroke-1" />
            </div>
          )}
        </div>

        {/* Informasi Produk */}
        <div className="flex flex-col">
          {product.category_name && (
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              {product.category_name}
            </span>
          )}

          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 text-2xl font-extrabold text-primary">
            {formatRupiah(product.price)}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Weight className="h-4 w-4 text-slate-400" />
              Berat: {product.weight_gram} gram
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4 text-slate-400" />
              Status: {isOutOfStock ? (
                <span className="font-semibold text-red-600">Stok Habis</span>
              ) : (
                <span className="font-semibold text-slate-800">
                  Tersedia ({product.stock} pcs)
                </span>
              )}
            </span>
          </div>

          <hr className="my-5 border-slate-200" />

          {/* Deskripsi */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Deskripsi Produk
            </h2>
            <div className="prose prose-sm text-slate-700 whitespace-pre-line text-sm leading-relaxed">
              {product.description || 'Tidak ada deskripsi rinci untuk produk ini.'}
            </div>
          </div>

          {/* Tombol Aksi & Kuantitas */}
          <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
            {!isOutOfStock ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-700">Jumlah:</span>
                <div className="flex items-center rounded-lg border border-slate-200 bg-surface">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-primary">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                  isOutOfStock
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : isAddedFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'border border-primary bg-surface text-primary hover:bg-slate-50'
                }`}
              >
                {isAddedFeedback ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Berhasil Ditambahkan!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Tambah ke Keranjang
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all ${
                  isOutOfStock
                    ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                    : 'bg-accent text-white hover:bg-accent-hover'
                }`}
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

