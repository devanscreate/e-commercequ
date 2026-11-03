'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-surface transition-shadow hover:shadow-md">
      {/* Gambar Produk */}
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Package className="h-12 w-12 stroke-[1.5]" />
          </div>
        )}

        {/* Badge Stok Habis / Menipis */}
        {isOutOfStock ? (
          <span className="absolute left-2.5 top-2.5 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            Stok Habis
          </span>
        ) : isLowStock ? (
          <span className="absolute left-2.5 top-2.5 rounded bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
            Sisa {product.stock}
          </span>
        ) : null}
      </Link>

      {/* Info Produk */}
      <div className="flex flex-1 flex-col p-4">
        {product.category_name && (
          <span className="text-xs font-medium text-slate-500 mb-1">
            {product.category_name}
          </span>
        )}

        <Link
          href={`/product/${product.id}`}
          className="line-clamp-2 text-sm font-semibold text-primary hover:underline"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3">
          <div className="text-base font-bold text-primary">
            {formatRupiah(product.price)}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                isOutOfStock
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-primary text-white hover:bg-primary-light active:scale-[0.98]'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {isOutOfStock ? 'Habis' : '+ Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

