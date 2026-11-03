import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { ShippingZone } from '@/types';

export async function GET() {
  try {
    const zones = await query<ShippingZone[]>('SELECT * FROM shipping_zones ORDER BY city_name ASC');
    return NextResponse.json(zones);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil tarif pengiriman: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { city_name, courier_name, cost_per_kg } = await request.json();

    if (!city_name || !courier_name || cost_per_kg === undefined) {
      return NextResponse.json(
        { error: 'Nama kota, nama kurir, dan biaya per kg wajib diisi.' },
        { status: 400 }
      );
    }

    const result: any = await query(
      'INSERT INTO shipping_zones (city_name, courier_name, cost_per_kg) VALUES (?, ?, ?)',
      [city_name.trim(), courier_name.trim(), Number(cost_per_kg)]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        city_name: city_name.trim(),
        courier_name: courier_name.trim(),
        cost_per_kg: Number(cost_per_kg),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal menambah tarif: ' + error.message },
      { status: 500 }
    );
  }
}
