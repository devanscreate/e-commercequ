export function formatRupiah(amount: number | string): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit acak
  return `INV-${year}${month}${day}-${random}`;
}

export interface WhatsAppMessageParams {
  invoiceNumber: string;
  customerName: string;
  customerWhatsApp: string;
  shippingAddress: string;
  courierInfo: string;
  shippingCost: number;
  totalAmount: number;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  storeWhatsApp: string;
}

export function generateWhatsAppCheckoutUrl(params: WhatsAppMessageParams): string {
  const cleanPhone = params.storeWhatsApp.replace(/[^0-9]/g, '');
  
  const itemList = params.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product_name}* (${item.quantity}x) - ${formatRupiah(item.price * item.quantity)}`
    )
    .join('\n');

  const message = `Halo Admin, saya ingin konfirmasi pesanan:

📄 *No. Invoice:* ${params.invoiceNumber}
👤 *Nama:* ${params.customerName}
📱 *No. WA:* ${params.customerWhatsApp}
📍 *Alamat:* ${params.shippingAddress}
🚚 *Pengiriman:* ${params.courierInfo} (${formatRupiah(params.shippingCost)})

🛍️ *Daftar Pesanan:*
${itemList}

💰 *Total Tagihan:* *${formatRupiah(params.totalAmount)}*

Mohon instruksi nomor rekening/QRIS untuk pembayaran. Terima kasih!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

