import { NextResponse } from 'next/server';
import { getDbPool, query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/utils';
import { Order, OrderItem } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice = searchParams.get('invoice');

    // Jika mencari berdasarkan invoice spesifik (Bisa diakses publik oleh pembeli untuk lacak pesanan)
    if (invoice) {
      const orders = await query<Order[]>(
        'SELECT * FROM orders WHERE invoice_number = ?',
        [invoice.trim().toUpperCase()]
      );

      if (orders.length === 0) {
        return NextResponse.json(
          { error: 'Pesanan dengan nomor invoice tersebut tidak ditemukan.' },
          { status: 404 }
        );
      }

      const order = orders[0];
      const items = await query<OrderItem[]>(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;

      return NextResponse.json(order);
    }

    // Jika melihat semua pesanan, wajib autentikasi Admin
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const statusFilter = searchParams.get('status');
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (statusFilter && statusFilter !== 'ALL') {
      sql += ' AND status = ?';
      params.push(statusFilter);
    }

    sql += ' ORDER BY id DESC';

    const orders = await query<Order[]>(sql, params);
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();
    const {
      customer_name,
      customer_whatsapp,
      shipping_address,
      courier_info,
      shipping_cost,
      items,
    } = body;

    // Validasi kelengkapan form
    if (
      !customer_name ||
      !customer_whatsapp ||
      !shipping_address ||
      !courier_info ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Mohon lengkapi semua data formulir checkout dan pastikan keranjang tidak kosong.' },
        { status: 400 }
      );
    }

    // Validasi stok awal sebelum membuat invoice
    for (const item of items) {
      const [prodRows]: any = await connection.execute(
        'SELECT id, name, price, stock, is_active FROM products WHERE id = ?',
        [item.product_id]
      );

      if (prodRows.length === 0 || !prodRows[0].is_active) {
        return NextResponse.json(
          { error: `Produk "${item.product_name || 'ID ' + item.product_id}" tidak tersedia lagi.` },
          { status: 400 }
        );
      }

      if (prodRows[0].stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stok produk "${prodRows[0].name}" tidak mencukupi (Sisa stok: ${prodRows[0].stock}).`,
          },
          { status: 400 }
        );
      }
    }

    // Hitung total nilai belanja
    const subtotal = items.reduce(
      (sum: number, it: any) => sum + Number(it.price) * Number(it.quantity),
      0
    );
    const finalShippingCost = Number(shipping_cost) || 0;
    const totalAmount = subtotal + finalShippingCost;
    const invoiceNumber = generateInvoiceNumber();

    await connection.beginTransaction();

    // 1. Simpan Header Pesanan (status awal: PENDING sesuai PRD)
    const [orderResult]: any = await connection.execute(
      `INSERT INTO orders 
      (invoice_number, customer_name, customer_whatsapp, shipping_address, courier_info, shipping_cost, total_amount, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        invoiceNumber,
        customer_name.trim(),
        customer_whatsapp.trim(),
        shipping_address.trim(),
        courier_info.trim(),
        finalShippingCost,
        totalAmount,
      ]
    );

    const orderId = orderResult.insertId;

    // 2. Simpan Detail Item Pesanan (Snapshot nama & harga)
    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          Number(item.price),
          Number(item.quantity),
        ]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        order_id: orderId,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        message: 'Pesanan berhasil dibuat.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    await connection.rollback();
    return NextResponse.json(
      { error: 'Gagal memproses pesanan: ' + error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

