import { NextResponse } from 'next/server';
import { getDbPool, query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { Order, OrderItem, OrderStatus } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const orders = await query<Order[]>('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const order = orders[0];
    const items = await query<OrderItem[]>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );
    order.items = items;

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil rincian pesanan: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
  }

  const { id } = params;
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();
    const { status, tracking_number } = body as {
      status?: OrderStatus;
      tracking_number?: string;
    };

    if (!status) {
      return NextResponse.json({ error: 'Status pesanan wajib diisi.' }, { status: 400 });
    }

    await connection.beginTransaction();

    // 1. Ambil order saat ini dengan lock baris
    const [orders]: any = await connection.execute(
      'SELECT * FROM orders WHERE id = ? FOR UPDATE',
      [id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    const currentOrder = orders[0];
    const previousStatus = currentOrder.status;

    // Ambil item dalam pesanan ini
    const [orderItems]: any = await connection.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );

    // KASUS 1: Perubahan status menjadi PAID (Wajib potong stok dengan locking SELECT FOR UPDATE)
    if (status === 'PAID' && previousStatus !== 'PAID') {
      for (const item of orderItems) {
        // Lock baris produk untuk mencegah race condition (Concurrency Control)
        const [prodRows]: any = await connection.execute(
          'SELECT id, name, stock FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );

        if (prodRows.length === 0) {
          await connection.rollback();
          return NextResponse.json(
            { error: `Produk "${item.product_name}" sudah tidak ada di sistem.` },
            { status: 400 }
          );
        }

        const currentStock = prodRows[0].stock;
        if (currentStock < item.quantity) {
          await connection.rollback();
          return NextResponse.json(
            {
              error: `Gagal konfirmasi PAID! Stok produk "${prodRows[0].name}" tidak mencukupi. Sisa: ${currentStock}, Dibutuhkan: ${item.quantity}.`,
            },
            { status: 400 }
          );
        }

        // Potong stok
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // KASUS 2: Pembatalan pesanan yang sebelumnya sudah PAID (Kembalikan stok)
    if (status === 'CANCELLED' && previousStatus === 'PAID') {
      for (const item of orderItems) {
        await connection.execute(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Update status order
    if (status === 'SHIPPED') {
      await connection.execute(
        'UPDATE orders SET status = ?, tracking_number = ? WHERE id = ?',
        [status, tracking_number || currentOrder.tracking_number || null, id]
      );
    } else {
      await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi ${status}.`,
    });
  } catch (error: any) {
    await connection.rollback();
    return NextResponse.json(
      { error: 'Gagal memperbarui status pesanan: ' + error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

