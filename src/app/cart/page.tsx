'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowLeft, ArrowRight, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <ShoppingBag className="h-10 w-10 stroke-1" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-primary">Keranjang Belanja Masih Kosong</h1>
        <p className="mt-1 text-sm text-slate-500">
          Yuk temukan produk impianmu dan masukkan ke dalam keranjang.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Mulai Belanja
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Keranjang Belanja
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {totalItems} barang dalam keranjang
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tambah Produk Lain
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Daftar Barang */}
        <div className="space-y-3 lg:col-span-2">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-surface p-4"
            >
              {/* Gambar */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Package className="h-6 w-6 stroke-1" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col min-w-0">
                <Link
                  href={`/product/${item.product.id}`}
                  className="truncate text-sm font-semibold text-primary hover:underline"
                >
                  {item.product.name}
                </Link>
                <span className="text-xs text-slate-500 mt-0.5">
                  {formatRupiah(item.product.price)} / pcs
                </span>
                <span className="text-xs font-semibold text-primary mt-1">
                  Subtotal: {formatRupiah(item.product.price * item.quantity)}
                </span>
              </div>

              {/* Kontrol Kuantitas */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center rounded-lg border border-slate-200 bg-surface">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="px-2.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-xs font-semibold text-primary">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="px-2.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan Belanja */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-surface p-5">
            <h2 className="text-base font-bold text-primary">Ringkasan Belanja</h2>
            
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Barang</span>
                <span className="font-semibold text-primary">{totalItems} pcs</span>
              </div>
              <div className="flex justify-between">
                <span>Total Harga Produk</span>
                <span className="font-semibold text-primary">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ongkos Kirim</span>
                <span>Dihitung di checkout</span>
              </div>
            </div>

            <hr className="my-4 border-slate-200" />

            <div className="flex justify-between text-sm font-bold text-primary mb-5">
              <span>Subtotal</span>
              <span className="text-base text-accent">{formatRupiah(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-95"
            >
              Lanjut ke Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

