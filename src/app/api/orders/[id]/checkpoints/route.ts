import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { TrackingCheckpoint } from '@/types';

// GET: Ambil seluruh riwayat checkpoint dan koordinat pengiriman untuk pesanan ini
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const checkpoints = await query<TrackingCheckpoint[]>(
      'SELECT * FROM order_tracking_checkpoints WHERE order_id = ? ORDER BY created_at ASC, id ASC',
      [id]
    );

    return NextResponse.json(checkpoints);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat koordinat: ' + error.message },
      { status: 500 }
    );
  }
}

// POST: Admin menambahkan titik koordinat baru / status lokasi paket
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya penjual/admin yang dapat memperbarui titik lokasi.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { location_name, description, latitude, longitude } = body;

    if (!location_name || !location_name.trim()) {
      return NextResponse.json(
        { error: 'Nama lokasi checkpoint wajib diisi.' },
        { status: 400 }
      );
    }

    const result: any = await query(
      `INSERT INTO order_tracking_checkpoints (order_id, location_name, description, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        location_name.trim(),
        description ? description.trim() : null,
        latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null,
        longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        checkpoint_id: result.insertId,
        message: 'Titik koordinat berhasil ditambahkan.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menyimpan checkpoint: ' + error.message },
      { status: 500 }
    );
  }
}

