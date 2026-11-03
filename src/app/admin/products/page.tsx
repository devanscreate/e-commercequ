'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [weightGram, setWeightGram] = useState('100');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/products?admin=true').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        if (Array.isArray(prods)) setProducts(prods);
        if (Array.isArray(cats)) setCategories(cats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0] ? String(categories[0].id) : '');
    setPrice('');
    setStock('10');
    setWeightGram('100');
    setImageUrl('');
    setDescription('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategoryId(product.category_id ? String(product.category_id) : '');
    setPrice(String(product.price));
    setStock(String(product.stock));
    setWeightGram(String(product.weight_gram));
    setImageUrl(product.image_url || '');
    setDescription(product.description || '');
    setIsActive(Boolean(product.is_active));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !price) {
      setFormError('Nama dan harga produk wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        price: Number(price),
        stock: Number(stock) || 0,
        weight_gram: Number(weightGram) || 100,
        image_url: imageUrl.trim() || null,
        description: description.trim() || null,
        is_active: isActive,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan produk');

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus produk');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">
            Katalog Produk Toko
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah, perbarui harga, pantau sisa stok, dan nonaktifkan produk.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-light"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk Baru
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-surface py-2 pl-9 pr-3 text-xs text-primary focus:border-accent focus:outline-none"
        />
      </div>

      {/* Tabel Produk */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-surface">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  {isLoading ? 'Memuat katalog produk...' : 'Belum ada produk.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package className="h-5 w-5 stroke-1" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate max-w-[200px]">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {product.weight_gram} gr
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {product.category_name || '-'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        product.stock === 0
                          ? 'text-red-600'
                          : product.stock <= 5
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {product.stock} pcs
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <XCircle className="h-3 w-3" /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(product)}
                        className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                        title="Edit Produk"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        title="Hapus Produk"
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

      {/* Modal Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="text-sm font-bold text-primary mb-4">
              {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
            </h3>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kemeja Flanel Premium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="">-- Tanpa Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 150000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Berat (Gram)</label>
                  <input
                    type="number"
                    min="1"
                    value={weightGram}
                    onChange={(e) => setWeightGram(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... atau URL Cloudinary"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Tempel URL foto produk (rekomendasi rasio 1:1, max 1080x1080)
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail bahan, spesifikasi, dan panduan ukuran..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-slate-700">
                  Tampilkan produk ini di katalog toko (Aktif)
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-1.5 font-semibold text-white hover:bg-primary-light disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

