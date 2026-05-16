import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production-please'
);

const PROTECTED = ['/dashboard', '/activity', '/food', '/coach', '/challenges'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get('fitlife_session')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.set({ name: 'fitlife_session', value: '', maxAge: 0, path: '/' });
    return res;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/activity/:path*',
    '/food/:path*',
    '/coach/:path*',
    '/challenges/:path*',
  ],
};
