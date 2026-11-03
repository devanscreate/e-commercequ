import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'E-Commercequ | Toko Online Mandiri',
  description: 'Toko online cepat, hemat, dan mudah belanja via WhatsApp',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col bg-background text-primary antialiased">
        <CartProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
