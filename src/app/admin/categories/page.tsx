'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle } from 'lucide-react';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = () => {
    setIsLoading(true);
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryName.trim()) {
      setError('Nama kategori tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kategori');

      setCategoryName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus kategori');
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Manajemen Kategori Produk
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur pengelompokan produk untuk mempermudah pencarian oleh pembeli di etalase.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Formulir Tambah / Edit */}
        <div className="md:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-surface p-5">
            <h2 className="text-sm font-bold text-primary mb-3">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h2>

            {error && (
              <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aksesoris & Tas"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-primary py-2 font-semibold text-white hover:bg-primary-light disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingCategory
                    ? 'Simpan Perubahan'
                    : 'Tambah Kategori'}
                </button>
                {editingCategory && (
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

        {/* Tabel Kategori */}
        <div className="md:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Slug URL</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                      {isLoading ? 'Memuat kategori...' : 'Belum ada data kategori.'}
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-primary">{cat.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{cat.slug}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                            title="Edit Kategori"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                            title="Hapus Kategori"
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

