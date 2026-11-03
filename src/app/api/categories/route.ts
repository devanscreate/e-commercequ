import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { Category } from '@/types';

export async function GET() {
  try {
    const categories = await query<Category[]>('SELECT * FROM categories ORDER BY name ASC');
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori: ' + error.message },
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

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const slug = slugify(name);
    const result: any = await query(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name.trim(), slug]
    );

    return NextResponse.json({
      id: result.insertId,
      name: name.trim(),
      slug,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menambah kategori: ' + error.message },
      { status: 500 }
    );
  }
}

