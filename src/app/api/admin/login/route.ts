import { NextResponse } from 'next/server';
import {
  createAdminSessionToken,
  getAdminCookieName,
  isAdminAuthenticated,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { password?: string };
    const password = typeof body.password === 'string' ? body.password : '';

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid admin password.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ authenticated: true });
    res.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}
