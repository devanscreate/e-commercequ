import { NextResponse } from 'next/server';
import { createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = await createAdminToken(username);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { username, role: 'admin' },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}

