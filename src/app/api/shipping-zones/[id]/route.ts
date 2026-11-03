import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

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
    const { city_name, courier_name, cost_per_kg } = await request.json();

    await query(
      'UPDATE shipping_zones SET city_name = ?, courier_name = ?, cost_per_kg = ? WHERE id = ?',
      [city_name.trim(), courier_name.trim(), Number(cost_per_kg), id]
    );

    return NextResponse.json({ success: true, message: 'Tarif berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal memperbarui tarif: ' + error.message },
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
    await query('DELETE FROM shipping_zones WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Tarif berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menghapus tarif: ' + error.message },
      { status: 500 }
    );
  }
}

