import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

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
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const slug = slugify(name);
    await query(
      'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
      [name.trim(), slug, id]
    );

    return NextResponse.json({ success: true, id, name: name.trim(), slug });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal memperbarui kategori: ' + error.message },
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
    await query('DELETE FROM categories WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menghapus kategori: ' + error.message },
      { status: 500 }
    );
  }
}

