'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, User, Store, RefreshCw, Bell } from 'lucide-react';
import { ChatMessage, MessageSender } from '@/types';

interface OrderChatBoxProps {
  orderId: number;
  senderRole: MessageSender; // 'BUYER' atau 'SELLER'
  invoiceNumber: string;
  customerName: string;
  customerWhatsApp?: string;
}

export default function OrderChatBox({
  orderId,
  senderRole,
  invoiceNumber,
  customerName,
  customerWhatsApp,
}: OrderChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch(`/api/orders/${orderId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil pesan:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();

    // Polling setiap 4 detik untuk update pesan baru
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const messageToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: senderRole,
          message: messageToSend,
        }),
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Gagal mengirim pesan:', err);
    } finally {
      setIsSending(false);
    }
  };

  // WhatsApp Reminder URL (Khusus reminder "Barang Akan Tiba Hari Ini" sesuai PRD update)
  const cleanPhone = customerWhatsApp ? customerWhatsApp.replace(/[^0-9]/g, '') : '';
  const reminderMessage = `Halo Kak ${customerName}, kami ingin menginfokan bahwa paket pesanan ${invoiceNumber} Anda sedang dibawa kurir dan diperkirakan *AKAN TIBA PADA HARI INI*. Mohon pastikan ada penerima di alamat pengiriman. Terima kasih!`;
  const waReminderUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderMessage)}`;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-surface shadow-sm overflow-hidden h-[460px]">
      {/* Header Chat */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">
            {senderRole === 'BUYER' ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-primary">
              {senderRole === 'BUYER' ? 'Percakapan dengan Toko / Penjual' : `Chat dengan Pembeli: ${customerName}`}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">Invoice: {invoiceNumber}</p>
          </div>
        </div>

        {/* Jika dibuka oleh Admin/Penjual, sediakan tombol khusus WA Reminder Hari H */}
        {senderRole === 'SELLER' && customerWhatsApp && (
          <a
            href={waReminderUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Kirim Reminder ke WhatsApp Pembeli bahwa barang tiba hari ini"
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Bell className="h-3.5 w-3.5 text-success" />
            <span className="hidden sm:inline">Reminder WA: Tiba Hari Ini</span>
          </a>
        )}
      </div>

      {/* Body Area Pesan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 text-xs">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 p-4">
            <MessageCircle className="h-8 w-8 stroke-1 text-slate-300 mb-1" />
            <p className="font-medium text-slate-600">Belum ada percakapan</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Kirim pesan langsung di sini untuk bertanya mengenai produk, pengiriman, atau konfirmasi pesanan.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === senderRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                  {msg.sender === 'SELLER' ? 'Admin Toko' : 'Pembeli'}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-accent text-white rounded-tr-none'
                      : 'bg-surface text-primary border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Chat */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-surface p-2.5 flex gap-2">
        <input
          type="text"
          placeholder={senderRole === 'BUYER' ? 'Tulis pesan kepada penjual...' : 'Balas pesan pembeli...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-40 transition-opacity"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

