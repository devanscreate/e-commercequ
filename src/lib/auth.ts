import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'fallback_secret_ecommercequ_change_me_32_chars';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = 'admin_session';

export interface AdminPayload {
  username: string;
  role: 'admin';
}

export async function createAdminToken(username: string): Promise<string> {
  return await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AdminPayload;
  } catch (error) {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

