import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { Product } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const products = await query<Product[]>(
      `SELECT p.*, c.name AS category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ? OR p.slug = ?`,
      [id, id]
    );

    if (products.length === 0) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(products[0]);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil detail produk: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      category_id,
      name,
      price,
      stock,
      weight_gram,
      image_url,
      description,
      is_active,
    } = body;

    const slug = slugify(name);

    await query(
      `UPDATE products SET 
        category_id = ?, 
        name = ?, 
        slug = ?, 
        price = ?, 
        stock = ?, 
        weight_gram = ?, 
        image_url = ?, 
        description = ?, 
        is_active = ? 
      WHERE id = ?`,
      [
        category_id || null,
        name.trim(),
        slug,
        Number(price) || 0,
        Number(stock) || 0,
        Number(weight_gram) || 100,
        image_url || null,
        description || null,
        Boolean(is_active),
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Produk berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal memperbarui produk: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { id } = params;
    await query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menghapus produk: ' + error.message },
      { status: 500 }
    );
  }
}

