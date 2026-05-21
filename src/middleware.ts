import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page and login API
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Only protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = req.cookies.get('admin_token')?.value;

    if (token === 'elite_gaming_auth_ok') {
      return NextResponse.next();
    }

    // Redirect to custom login page
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
