import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { ChatMessage, Order } from '@/types';

// GET: Ambil percakapan untuk pesanan ini
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const messages = await query<ChatMessage[]>(
      'SELECT * FROM order_messages WHERE order_id = ? ORDER BY created_at ASC, id ASC',
      [id]
    );

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil pesan: ' + error.message },
      { status: 500 }
    );
  }
}

// POST: Kirim pesan percakapan (Pembeli atau Penjual)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { sender, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    if (sender !== 'BUYER' && sender !== 'SELLER') {
      return NextResponse.json(
        { error: 'Pengirim tidak valid.' },
        { status: 400 }
      );
    }

    // Jika pengirim SELLER, pastikan admin login
    if (sender === 'SELLER') {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Akses ditolak. Silakan login sebagai penjual.' },
          { status: 401 }
        );
      }
    } else {
      // Jika BUYER, pastikan order ada
      const orders = await query<Order[]>('SELECT id FROM orders WHERE id = ?', [id]);
      if (orders.length === 0) {
        return NextResponse.json(
          { error: 'Pesanan tidak ditemukan.' },
          { status: 404 }
        );
      }
    }

    const result: any = await query(
      'INSERT INTO order_messages (order_id, sender, message) VALUES (?, ?, ?)',
      [id, sender, message.trim()]
    );

    return NextResponse.json(
      {
        success: true,
        message_id: result.insertId,
        sender,
        message: message.trim(),
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengirim pesan: ' + error.message },
      { status: 500 }
    );
  }
}

