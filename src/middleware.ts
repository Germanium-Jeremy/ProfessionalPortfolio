import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_SECRET = process.env.AUTH_SECRET;
const key = new TextEncoder().encode(AUTH_SECRET || '');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/configuration') && !pathname.startsWith('/configuration/login')) {
    const sessionCookie = request.cookies.get('portfolio_session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL(`/configuration/login?next=${encodeURIComponent(pathname)}`, request.url));
    }

    try {
      await jwtVerify(sessionCookie, key);
    } catch {
      return NextResponse.redirect(new URL(`/configuration/login?next=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/configuration/:path*'],
};
