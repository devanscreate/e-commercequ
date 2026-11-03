'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  MessageCircle,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  MapPin,
  Navigation,
  Bell,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatRupiah } from '@/lib/utils';
import OrderChatBox from '@/components/OrderChatBox';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // State untuk form input resi saat SHIPPED
  const [trackingInput, setTrackingInput] = useState('');
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null);

  // State untuk In-App Chat Modal
  const [chattingOrder, setChattingOrder] = useState<Order | null>(null);

  // State untuk Update Titik Koordinat Pengiriman
  const [coordinateOrderId, setCoordinateOrderId] = useState<number | null>(null);
  const [coordLocationName, setCoordLocationName] = useState('');
  const [coordDescription, setCoordDescription] = useState('');
  const [coordLat, setCoordLat] = useState('');
  const [coordLon, setCoordLon] = useState('');
  const [isSavingCoord, setIsSavingCoord] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOrders = () => {
    setIsLoading(true);
    const url =
      statusFilter === 'ALL'
        ? '/api/orders'
        : `/api/orders?status=${statusFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil pesanan:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: OrderStatus,
    trackingNumber?: string
  ) => {
    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui status');
      }

      setShippingOrderId(null);
      setTrackingInput('');
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCoordinate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinateOrderId || !coordLocationName.trim()) return;

    setIsSavingCoord(true);
    try {
      const res = await fetch(`/api/orders/${coordinateOrderId}/checkpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_name: coordLocationName.trim(),
          description: coordDescription.trim() || undefined,
          latitude: coordLat ? parseFloat(coordLat) : undefined,
          longitude: coordLon ? parseFloat(coordLon) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan koordinat');

      setCoordinateOrderId(null);
      setCoordLocationName('');
      setCoordDescription('');
      setCoordLat('');
      setCoordLon('');
      alert('Titik koordinat berhasil ditambahkan! Pembeli sekarang dapat memantaunya di peta.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingCoord(false);
    }
  };

  const handleOpenDetail = (order: Order) => {
    fetch(`/api/orders?invoice=${order.invoice_number}`)
      .then((res) => res.json())
      .then((data) => setSelectedOrder(data))
      .catch((err) => console.error(err));
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.invoice_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_whatsapp.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">
            Manajemen Pesanan, Koordinat & Chat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi pembayaran, update titik koordinat kurir, balas pesan pembeli, dan kirim pengingat resi.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Invoice / Nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-surface py-2 pl-9 pr-3 text-xs text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 bg-surface text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Pesanan */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-surface">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Pembeli</th>
              <th className="px-4 py-3">Pengiriman & Resi</th>
              <th className="px-4 py-3">Total Tagihan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi, Koordinat & Chat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  {isLoading ? 'Memuat pesanan...' : 'Tidak ada data pesanan.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                    {order.invoice_number}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-primary">{order.customer_name}</p>
                    <span className="text-[11px] text-slate-500">
                      WA: {order.customer_whatsapp}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate max-w-[180px]">{order.courier_info}</p>
                    {order.tracking_number && (
                      <p className="font-mono text-[10px] text-emerald-700 font-bold">
                        Resi: {order.tracking_number}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">
                    {formatRupiah(order.total_amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        order.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'PAID'
                          ? 'bg-blue-100 text-accent'
                          : order.status === 'SHIPPED'
                          ? 'bg-emerald-100 text-success'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Tombol Buka In-App Chatting */}
                      <button
                        onClick={() => setChattingOrder(order)}
                        title="Chat Langsung dengan Pembeli"
                        className="rounded border border-blue-200 bg-blue-50 p-1.5 text-accent hover:bg-blue-100"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>

                      {/* Tombol Update Titik Koordinat (Bisa diupdate saat proses kirim) */}
                      <button
                        onClick={() => {
                          setCoordinateOrderId(order.id);
                          setCoordLocationName('');
                          setCoordDescription('');
                          setCoordLat('-6.2088');
                          setCoordLon('106.8456');
                        }}
                        title="Perbarui Titik Koordinat Kurir"
                        className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Navigation className="h-3.5 w-3.5 text-slate-700" />
                      </button>

                      <button
                        onClick={() => handleOpenDetail(order)}
                        title="Lihat Detail Pesanan"
                        className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {/* Tombol Konfirmasi PAID (Potong Stok) */}
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PAID')}
                          disabled={isProcessing}
                          title="Konfirmasi Pembayaran Diterima (Potong Stok)"
                          className="rounded bg-accent px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
                        >
                          Tandai Lunas
                        </button>
                      )}

                      {/* Tombol Input Resi & Update SHIPPED */}
                      {order.status === 'PAID' && (
                        <button
                          onClick={() => {
                            setShippingOrderId(order.id);
                            setTrackingInput(order.tracking_number || '');
                          }}
                          className="rounded bg-success px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-success-hover"
                        >
                          Kirim Barang
                        </button>
                      )}

                      {/* Tombol Reminder WA: Barang Tiba Hari Ini */}
                      {order.status === 'SHIPPED' && (
                        <a
                          href={`https://wa.me/${order.customer_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Halo Kak ${order.customer_name}, paket pesanan ${order.invoice_number} Anda sedang dibawa kurir dan diperkirakan *AKAN TIBA PADA HARI INI*. Mohon pastikan ada penerima di lokasi pengiriman. Terima kasih!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Kirim Reminder WA: Barang Tiba Hari Ini"
                          className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                        >
                          <Bell className="h-3 w-3 text-success" />
                          Reminder WA
                        </a>
                      )}

                      {/* Tombol Batalkan Pesanan */}
                      {order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && (
                        <button
                          onClick={() => {
                            if (confirm('Yakin ingin membatalkan pesanan ini?')) {
                              handleUpdateStatus(order.id, 'CANCELLED');
                            }
                          }}
                          title="Batalkan Pesanan"
                          className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal In-App Chat Admin - Pembeli */}
      {chattingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <span className="text-xs font-bold text-primary">Ruang Chat Penjual - Pembeli</span>
              <button
                onClick={() => setChattingOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <OrderChatBox
                orderId={chattingOrder.id}
                senderRole="SELLER"
                invoiceNumber={chattingOrder.invoice_number}
                customerName={chattingOrder.customer_name}
                customerWhatsApp={chattingOrder.customer_whatsapp}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Titik Koordinat Checkpoint Kurir */}
      {coordinateOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl text-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-primary">Update Titik Koordinat Kurir</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Masukkan titik koordinat dan nama checkpoint lokasi kurir saat ini.
              </p>
            </div>

            <form onSubmit={handleSaveCoordinate} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Titik Lokasi / Checkpoint <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hub Transit Jakarta Selatan / Menuju Lokasi"
                  value={coordLocationName}
                  onChange={(e) => setCoordLocationName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Paket sedang dibawa kurir Budi Santoso"
                  value={coordDescription}
                  onChange={(e) => setCoordDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="-6.2088"
                    value={coordLat}
                    onChange={(e) => setCoordLat(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="106.8456"
                    value={coordLon}
                    onChange={(e) => setCoordLon(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCoordinateOrderId(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoord}
                  className="rounded-lg bg-accent px-4 py-1.5 font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  {isSavingCoord ? 'Menyimpan...' : 'Simpan Koordinat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Nomor Resi Pengiriman */}
      {shippingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="text-sm font-bold text-primary">Input Nomor Resi Kurir</h3>
            <p className="mt-1 text-xs text-slate-500">
              Masukkan nomor resi untuk mengubah status pesanan menjadi SHIPPED.
            </p>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Contoh: JNE1234567890"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs font-mono uppercase text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShippingOrderId(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleUpdateStatus(shippingOrderId, 'SHIPPED', trackingInput)}
                disabled={!trackingInput.trim() || isProcessing}
                className="rounded-lg bg-success px-4 py-1.5 font-semibold text-white hover:bg-success-hover disabled:opacity-50"
              >
                Simpan & Tandai Dikirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Pesanan */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400">Rincian Lengkap</span>
                <h3 className="font-mono text-sm font-bold text-primary">
                  {selectedOrder.invoice_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-slate-600">
              <p>
                <strong>Nama:</strong> {selectedOrder.customer_name}
              </p>
              <p>
                <strong>WhatsApp:</strong> {selectedOrder.customer_whatsapp}
              </p>
              <p>
                <strong>Alamat:</strong> {selectedOrder.shipping_address}
              </p>
              <p>
                <strong>Kurir:</strong> {selectedOrder.courier_info}
              </p>
              {selectedOrder.tracking_number && (
                <p>
                  <strong>No. Resi:</strong> {selectedOrder.tracking_number}
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="font-semibold text-primary mb-2">Item Pembelian</h4>
              <div className="divide-y divide-slate-100">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1.5">
                    <span>
                      {it.product_name} <strong>x{it.quantity}</strong>
                    </span>
                    <span className="font-medium text-primary">
                      {formatRupiah(Number(it.price) * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-primary text-sm">
              <span>Total Pesanan</span>
              <span className="text-accent">{formatRupiah(selectedOrder.total_amount)}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full rounded-lg bg-slate-100 py-2 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
