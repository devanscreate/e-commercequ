'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Truck,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoginPage) return;

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      </div>
    );
  }

  const navItems = [
    { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
    { label: 'Pesanan & Resi', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Katalog Produk', href: '/admin/products', icon: Package },
    { label: 'Kategori', href: '/admin/categories', icon: Layers },
    { label: 'Tarif Ongkir', href: '/admin/shipping', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Top Navigation */}
      <header className="border-b border-slate-200 bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-white">
              ADMIN
            </span>
            <span className="text-sm font-bold text-primary">Dashboard Toko</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Lihat Toko
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Keluar
            </button>
          </div>
        </div>

        {/* Sub-navbar Menu Navigasi Tabs */}
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 text-xs font-medium sm:px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 border-b-2 py-3 px-3 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Konten Halaman Admin */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}

