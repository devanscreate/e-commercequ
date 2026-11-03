'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ShippingZone } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ambil daftar tarif zona pengiriman
  useEffect(() => {
    fetch('/api/shipping-zones')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShippingZones(data);
          setSelectedZoneId(String(data[0].id));
        }
      })
      .catch((err) => console.error('Gagal mengambil tarif pengiriman:', err));
  }, []);

  const selectedZone = shippingZones.find((z) => String(z.id) === selectedZoneId);
  const shippingCost = selectedZone ? Number(selectedZone.cost_per_kg) : 0;
  const totalAmount = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-3 text-lg font-bold text-primary">Keranjang Belanja Kosong</h1>
        <p className="mt-1 text-xs text-slate-500">
          Silakan pilih produk terlebih dahulu sebelum melakukan checkout.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Lihat Katalog
        </Link>
      </main>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi No WhatsApp
    const cleanPhone = customerWhatsApp.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setErrorMessage('Nomor WhatsApp tidak valid. Masukkan nomor yang aktif (contoh: 08123456789).');
      return;
    }

    if (!customerName.trim() || !shippingAddress.trim() || !selectedZone) {
      setErrorMessage('Mohon lengkapi seluruh kolom formulir pengiriman.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_whatsapp: cleanPhone,
        shipping_address: shippingAddress.trim(),
        courier_info: `${selectedZone.city_name} (${selectedZone.courier_name})`,
        shipping_cost: shippingCost,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat pesanan');
      }

      // Kosongkan keranjang belanja
      clearCart();

      // Redirect ke halaman Invoice & WhatsApp konfirmasi
      router.push(`/invoice/${result.invoice_number}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan pada sistem saat membuat pesanan.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Keranjang
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-primary mb-6">
        Formulir Pengiriman & Pembayaran
      </h1>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Formulir Data Pembeli */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-surface p-5">
            <h2 className="text-sm font-bold text-primary mb-4">
              Informasi Penerima (Guest Checkout)
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm text-primary placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm text-primary placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Nomor ini akan digunakan untuk mengirimkan konfirmasi & nomor resi.
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Wilayah / Kota Pengiriman <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {shippingZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.city_name} - {zone.courier_name} ({formatRupiah(zone.cost_per_kg)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kode Pos..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm text-primary placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Tagihan & Tombol Order */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-surface p-5">
            <h2 className="text-sm font-bold text-primary mb-3">Ringkasan Pesanan</h2>

            <div className="max-h-48 overflow-y-auto space-y-2 border-b border-slate-100 pb-3 text-xs scrollbar-thin">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-slate-600">
                  <span className="truncate pr-2">
                    {item.product.name} <strong className="text-primary">x{item.quantity}</strong>
                  </span>
                  <span className="shrink-0 font-medium text-primary">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-primary">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="font-semibold text-primary">{formatRupiah(shippingCost)}</span>
              </div>
            </div>

            <hr className="my-4 border-slate-200" />

            <div className="flex justify-between text-sm font-bold text-primary mb-5">
              <span>Total Tagihan</span>
              <span className="text-base text-accent">{formatRupiah(totalAmount)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity ${
                isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-accent hover:opacity-95'
              }`}
            >
              {isSubmitting ? (
                'Memproses Pesanan...'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Buat Pesanan Sekarang
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Pembayaran aman & konfirmasi langsung via WhatsApp
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}

