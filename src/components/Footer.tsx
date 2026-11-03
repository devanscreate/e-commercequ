import React from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'E-Commercequ';
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';
  const storeAddress = process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Indonesia';

  return (
    <footer className="mt-auto border-t border-slate-200 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-primary">{storeName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{storeAddress}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-success font-medium hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Bantuan WhatsApp
            </a>
            <span>•</span>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Area Admin
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {storeName}. Platform E-Commerce Mandiri.
        </div>
      </div>
    </footer>
  );
}

