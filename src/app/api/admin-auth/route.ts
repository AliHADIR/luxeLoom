import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_SECONDS,
  createAdminSession,
  isAdminConfigured,
  isAdminSessionValid,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ authenticated: false, error: 'Admin access is not configured.' }, { status: 503 });
  }
  const authenticated = isAdminSessionValid(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401 });
}

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ authenticated: false, error: 'Admin access is not configured.' }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (!verifyAdminPassword(body?.password)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSession()!, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
