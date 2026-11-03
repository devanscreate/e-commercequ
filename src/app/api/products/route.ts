import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { Product } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const isAdminView = searchParams.get('admin') === 'true';

    let sql = `
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (!isAdminView) {
      sql += ' AND p.is_active = TRUE';
    } else {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
      }
    }

    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.id DESC';

    const products = await query<Product[]>(sql, params);
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil data produk: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak. Silakan login sebagai Admin.' }, { status: 401 });
    }

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

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Nama dan harga produk wajib diisi' },
        { status: 400 }
      );
    }

    const slug = `${slugify(name)}-${Date.now()}`;

    const result: any = await query(
      `INSERT INTO products 
      (category_id, name, slug, price, stock, weight_gram, image_url, description, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null,
        name.trim(),
        slug,
        Number(price) || 0,
        Number(stock) || 0,
        Number(weight_gram) || 100,
        image_url || null,
        description || null,
        is_active !== undefined ? Boolean(is_active) : true,
      ]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        message: 'Produk berhasil ditambahkan',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menambah produk: ' + error.message },
      { status: 500 }
    );
  }
}

