'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Clock,
  ArrowRight,
  PackageCheck,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { Order } from '@/types';
import { formatRupiah, generateWhatsAppCheckoutUrl } from '@/lib/utils';

export default function InvoicePage() {
  const params = useParams();
  const invoiceNumber = params.invoice_number as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'BCA';
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '1234567890';
  const bankHolder = process.env.NEXT_PUBLIC_BANK_HOLDER || 'Nama Pemilik Toko';
  const qrisUrl = process.env.NEXT_PUBLIC_QRIS_IMAGE_URL || '';
  const storeWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';

  useEffect(() => {
    if (!invoiceNumber) return;
    setIsLoading(true);

    fetch(`/api/orders?invoice=${encodeURIComponent(invoiceNumber)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Data invoice tidak ditemukan');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat invoice');
        setIsLoading(false);
      });
  }, [invoiceNumber]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
        <p className="mt-3 text-xs text-slate-500">Memuat rincian invoice...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-bold text-primary">Invoice Tidak Ditemukan</h1>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white"
        >
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  // Siapkan tautan WhatsApp
  const waUrl = generateWhatsAppCheckoutUrl({
    invoiceNumber: order.invoice_number,
    customerName: order.customer_name,
    customerWhatsApp: order.customer_whatsapp,
    shippingAddress: order.shipping_address,
    courierInfo: order.courier_info,
    shippingCost: Number(order.shipping_cost),
    totalAmount: Number(order.total_amount),
    items: (order.items || []).map((it) => ({
      product_name: it.product_name,
      quantity: it.quantity,
      price: Number(it.price),
    })),
    storeWhatsApp,
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Banner Berhasil Dibuat */}
      <div className="rounded-2xl border border-slate-200 bg-surface p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-primary">
          Pesanan Berhasil Dibuat!
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Nomor Invoice Anda:{' '}
          <strong className="font-mono text-primary text-sm">{order.invoice_number}</strong>
        </p>

        {/* Tombol Hijau WhatsApp Utama (Emerald Green Sesuai Palet) */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href={`/track?invoice=${order.invoice_number}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-hover"
          >
            <PackageCheck className="h-4 w-4" />
            Pantau Koordinat & Chat Toko
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-success-hover"
          >
            <MessageCircle className="h-4 w-4" />
            Konfirmasi ke WhatsApp Toko
          </a>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Gunakan in-app chat untuk berinteraksi langsung dengan penjual. WhatsApp akan digunakan untuk mengirimkan reminder saat barang tiba pada hari H.
        </p>
      </div>

      {/* Instruksi Pembayaran */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold text-primary">
          <CreditCard className="h-4 w-4 text-accent" />
          Instruksi Pembayaran Toko
        </h2>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Bank Transfer ({bankName})
              </span>
              <p className="text-lg font-mono font-bold text-primary">{bankAccount}</p>
              <p className="text-xs text-slate-600">a.n. {bankHolder}</p>
            </div>
            <button
              onClick={() => copyToClipboard(bankAccount)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedBank ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
        </div>

        {/* QRIS Statis jika ada URL gambar */}
        {qrisUrl && (
          <div className="mt-4 flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
              Atau Scan QRIS Toko
            </span>
            <div className="relative h-44 w-44 overflow-hidden rounded-lg bg-white border border-slate-200">
              <Image src={qrisUrl} alt="QRIS Toko" fill className="object-contain p-2" />
            </div>
          </div>
        )}

        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-[11px] text-amber-800">
          <strong>Perhatian:</strong> Setelah melakukan transfer, silakan kirimkan bukti transfer
          melalui WhatsApp agar pesanan dapat segera diproses & dikirim.
        </div>
      </div>

      {/* Ringkasan Belanja */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-surface p-6">
        <h2 className="text-sm font-bold text-primary mb-4">Rincian Pembelian</h2>
        
        <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
          {(order.items || []).map((it, idx) => (
            <div key={idx} className="flex justify-between text-slate-700">
              <span>
                {it.product_name} <strong className="text-primary">x{it.quantity}</strong>
              </span>
              <span className="font-medium text-primary">
                {formatRupiah(Number(it.price) * it.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Ongkos Kirim ({order.courier_info})</span>
            <span className="font-semibold text-primary">{formatRupiah(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-primary pt-2 border-t border-slate-100">
            <span>Total Tagihan</span>
            <span className="text-base text-accent">{formatRupiah(order.total_amount)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-slate-100 sm:flex-row sm:justify-between sm:items-center">
          <div className="text-xs text-slate-500">
            Penerima: <strong>{order.customer_name}</strong> ({order.customer_whatsapp})
          </div>
          <Link
            href={`/track?invoice=${order.invoice_number}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <PackageCheck className="h-4 w-4" />
            Lacak Status Pesanan Ini
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

