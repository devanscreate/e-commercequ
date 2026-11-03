'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, PackageCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'E-Commercequ';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
            E
          </span>
          <span className="text-xl font-bold tracking-tight text-primary">
            {storeName}
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
          >
            Katalog
          </Link>
          <Link
            href="/track"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
          >
            <PackageCheck className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Lacak Pesanan</span>
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95"
            aria-label="Keranjang Belanja"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

