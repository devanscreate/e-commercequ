'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  PackageCheck,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Copy,
  AlertCircle,
  Navigation,
  MessageCircle,
} from 'lucide-react';
import { Order, OrderStatus, TrackingCheckpoint } from '@/types';
import { formatRupiah } from '@/lib/utils';
import TrackingMap from '@/components/TrackingMap';
import OrderChatBox from '@/components/OrderChatBox';

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const queryInvoice = searchParams.get('invoice') || '';

  const [invoiceInput, setInvoiceInput] = useState(queryInvoice);
  const [order, setOrder] = useState<Order | null>(null);
  const [checkpoints, setCheckpoints] = useState<TrackingCheckpoint[]>([]);
  const [activeTab, setActiveTab] = useState<'tracking' | 'chat'>('tracking');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);

  const fetchCheckpoints = (orderId: number) => {
    fetch(`/api/orders/${orderId}/checkpoints`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCheckpoints(data);
      })
      .catch((err) => console.error('Gagal mengambil koordinat:', err));
  };

  const fetchOrder = (inv: string) => {
    if (!inv.trim()) return;
    setIsLoading(true);
    setError(null);

    fetch(`/api/orders?invoice=${encodeURIComponent(inv.trim().toUpperCase())}`)
      .then((res) => {
        if (!res.ok) throw new Error('Pesanan dengan nomor invoice tersebut tidak ditemukan.');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setIsLoading(false);
        fetchCheckpoints(data.id);
      })
      .catch((err) => {
        setOrder(null);
        setCheckpoints([]);
        setError(err.message || 'Gagal mencari pesanan');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (queryInvoice) {
      setInvoiceInput(queryInvoice);
      fetchOrder(queryInvoice);
    }
  }, [queryInvoice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(invoiceInput);
  };

  const copyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> Menunggu Pembayaran
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-accent border border-blue-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Pembayaran Diterima (Diproses)
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-success border border-emerald-200">
            <Truck className="h-3.5 w-3.5" /> Sedang Dikirim
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" /> Dibatalkan
          </span>
        );
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="text-center mb-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Pantau Paket & Titik Koordinat
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Lacak lokasi paket secara berkala dan hubungi penjual secara langsung melalui in-app chat.
        </p>

        {/* Input Form Pencarian Invoice */}
        <form onSubmit={handleSearch} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Masukkan nomor invoice (contoh: INV-20261103-1234)"
              value={invoiceInput}
              onChange={(e) => setInvoiceInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-surface py-2.5 pl-10 pr-3 text-sm text-primary uppercase placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-light disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Mencari...' : 'Lacak'}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-700 max-w-xl mx-auto mb-6">
          <AlertCircle className="mx-auto h-5 w-5 mb-1 text-red-500" />
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Header Informasi Invoice */}
          <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-medium text-slate-400">Nomor Invoice</span>
                <p className="font-mono text-base font-bold text-primary">{order.invoice_number}</p>
              </div>
              <div className="flex items-center gap-2">{getStatusBadge(order.status)}</div>
            </div>

            {/* Stepper Status Progress */}
            {order.status !== 'CANCELLED' && (
              <div className="my-5">
                <div className="flex items-center justify-between relative text-xs max-w-lg mx-auto">
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

                  {/* Step 1: Dibuat */}
                  <div className="flex flex-col items-center z-10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                      ✓
                    </div>
                    <span className="mt-1.5 text-[11px] font-medium text-slate-700">Dibuat</span>
                  </div>

                  {/* Step 2: Dibayar */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        order.status === 'PAID' || order.status === 'SHIPPED'
                          ? 'bg-accent text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      2
                    </div>
                    <span className="mt-1.5 text-[11px] font-medium text-slate-700">Dibayar</span>
                  </div>

                  {/* Step 3: Dikirim */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        order.status === 'SHIPPED'
                          ? 'bg-success text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      3
                    </div>
                    <span className="mt-1.5 text-[11px] font-medium text-slate-700">Dikirim</span>
                  </div>
                </div>
              </div>
            )}

            {/* Nomor Resi */}
            {order.status === 'SHIPPED' && order.tracking_number && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                    Nomor Resi {order.courier_info}
                  </span>
                  <p className="font-mono font-bold text-emerald-950 mt-0.5 text-sm">
                    {order.tracking_number}
                  </p>
                </div>
                <button
                  onClick={() => copyResi(order.tracking_number!)}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedResi ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
            )}
          </div>

          {/* Navigasi Tab: 1. Pelacakan & Koordinat, 2. In-App Chat */}
          <div className="flex border-b border-slate-200 bg-surface rounded-t-xl px-4">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors ${
                activeTab === 'tracking'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Navigation className="h-4 w-4" />
              Titik Koordinat & Status Rute
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors ${
                activeTab === 'chat'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Chat Langsung dengan Penjual
            </button>
          </div>

          {/* Konten Tab 1: Peta Koordinat & Rincian */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              {/* Komponen Peta Interaktif & Koordinat GPS */}
              <TrackingMap
                checkpoints={checkpoints}
                courierInfo={order.courier_info}
                trackingNumber={order.tracking_number}
                shippingAddress={order.shipping_address}
              />

              {/* Rincian Pesanan */}
              <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Informasi Paket
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-slate-500">
                      Penerima: <strong className="text-primary">{order.customer_name}</strong>
                    </p>
                    <p className="text-slate-500">
                      WhatsApp: <strong className="text-primary">{order.customer_whatsapp}</strong>
                    </p>
                    <p className="text-slate-500">
                      Alamat: <strong className="text-primary">{order.shipping_address}</strong>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500">
                      Kurir Pengiriman: <strong className="text-primary">{order.courier_info}</strong>
                    </p>
                    <p className="text-slate-500">
                      Total Belanja: <strong className="text-accent font-bold text-sm">{formatRupiah(order.total_amount)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Konten Tab 2: In-App Chatting */}
          {activeTab === 'chat' && (
            <div>
              <OrderChatBox
                orderId={order.id}
                senderRole="BUYER"
                invoiceNumber={order.invoice_number}
                customerName={order.customer_name}
                customerWhatsApp={order.customer_whatsapp}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
