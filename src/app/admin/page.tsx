'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Truck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Order, Product } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/products?admin=true').then((r) => r.json()),
    ])
      .then(([ordersData, productsData]) => {
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(productsData)) setProducts(productsData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal memuat data dashboard:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const shippedOrders = orders.filter((o) => o.status === 'SHIPPED');

  const totalRevenue = orders
    .filter((o) => o.status === 'PAID' || o.status === 'SHIPPED')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Ringkasan Operasional Toko
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau status pesanan harian dan ketersediaan stok produk Anda.
        </p>
      </div>

      {/* Grid 4 Kartu Metrik Sesuai PRD [FR-08] */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Pesanan Baru PENDING */}
        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pesanan Baru</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary">{pendingOrders.length}</div>
          <p className="mt-1 text-[11px] text-amber-600 font-medium">Menunggu Verifikasi Mutasi</p>
        </div>

        {/* Diproses PAID */}
        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Perlu Dikirim</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-accent">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary">{paidOrders.length}</div>
          <p className="mt-1 text-[11px] text-accent font-medium">Sudah Dibayar</p>
        </div>

        {/* Terkirim SHIPPED */}
        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dalam Pengiriman</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-success">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary">{shippedOrders.length}</div>
          <p className="mt-1 text-[11px] text-success font-medium">Resi Telah Diterbitkan</p>
        </div>

        {/* Total Pendapatan */}
        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Omset</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-bold text-primary truncate">
            {formatRupiah(totalRevenue)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Dari Pesanan Terkonfirmasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Peringatan Stok Menipis (Stok <= 5) */}
        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-primary">
                Perhatian: Stok Menipis (≤ 5)
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Kelola Stok <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Seluruh stok produk masih dalam batas aman.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div className="truncate pr-2">
                    <p className="font-semibold text-primary truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400">{formatRupiah(p.price)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-bold ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.stock === 0 ? 'Habis (0)' : `Sisa ${p.stock}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pesanan Terbaru yang Perlu Tindakan */}
        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-primary">Pesanan Terbaru Masuk</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Semua Pesanan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Belum ada pesanan masuk.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-mono font-bold text-primary">{ord.invoice_number}</p>
                    <p className="text-[11px] text-slate-500">
                      {ord.customer_name} • {formatRupiah(ord.total_amount)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ord.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : ord.status === 'PAID'
                        ? 'bg-blue-100 text-accent'
                        : ord.status === 'SHIPPED'
                        ? 'bg-emerald-100 text-success'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

