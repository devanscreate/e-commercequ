'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Truck, AlertCircle } from 'lucide-react';
import { ShippingZone } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function AdminShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [cityName, setCityName] = useState('');
  const [courierName, setCourierName] = useState('JNE Reguler');
  const [costPerKg, setCostPerKg] = useState('');
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchZones = () => {
    setIsLoading(true);
    fetch('/api/shipping-zones')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setZones(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cityName.trim() || !costPerKg) {
      setError('Nama wilayah/kota dan biaya pengiriman wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingZone
        ? `/api/shipping-zones/${editingZone.id}`
        : '/api/shipping-zones';
      const method = editingZone ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_name: cityName.trim(),
          courier_name: courierName.trim(),
          cost_per_kg: Number(costPerKg),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan tarif');

      setCityName('');
      setCostPerKg('');
      setEditingZone(null);
      fetchZones();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setCityName(zone.city_name);
    setCourierName(zone.courier_name);
    setCostPerKg(String(zone.cost_per_kg));
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
    setCityName('');
    setCostPerKg('');
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus zona tarif ini?')) return;

    try {
      const res = await fetch(`/api/shipping-zones/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus tarif');
      fetchZones();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Pengaturan Tarif Ongkos Kirim (Flat / Zona)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur daftar wilayah tujuan dan tarif per kilogram untuk pilihan kurir pembeli saat checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Form Tambah/Edit Tarif */}
        <div className="md:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-surface p-5">
            <h2 className="text-sm font-bold text-primary mb-3">
              {editingZone ? 'Edit Tarif Wilayah' : 'Tambah Zona Pengiriman'}
            </h2>

            {error && (
              <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Kota / Wilayah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jabodetabek, Surabaya, Bali"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Kurir</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JNE Reguler, SiCepat, J&T"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tarif Ongkir (Rp / Kg)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Contoh: 12000"
                  value={costPerKg}
                  onChange={(e) => setCostPerKg(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-primary py-2 font-semibold text-white hover:bg-primary-light disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingZone
                    ? 'Simpan Perubahan'
                    : 'Tambah Tarif'}
                </button>
                {editingZone && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Tabel Tarif */}
        <div className="md:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Wilayah / Kota</th>
                  <th className="px-4 py-3">Kurir</th>
                  <th className="px-4 py-3">Tarif / Kg</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {zones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      {isLoading ? 'Memuat tarif...' : 'Belum ada data tarif pengiriman.'}
                    </td>
                  </tr>
                ) : (
                  zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-primary">
                        {zone.city_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{zone.courier_name}</td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {formatRupiah(zone.cost_per_kg)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(zone)}
                            className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                            title="Edit Tarif"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(zone.id)}
                            className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                            title="Hapus Tarif"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

