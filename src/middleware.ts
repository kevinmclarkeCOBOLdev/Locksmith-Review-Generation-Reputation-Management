import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;

  // Verify the JWT token
  const session = sessionToken ? await verifyJWT(sessionToken) : null;

  // Route protection: If unauthenticated user tries to access /dashboard directly, redirect to /login
  if (pathname.startsWith('/dashboard') && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user visits /login, redirect to /dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Pass user and tenant context to downstream headers if authenticated
  const response = NextResponse.next();
  if (session) {
    response.headers.set('x-tenant-id', session.tenantId);
    response.headers.set('x-user-id', session.userId);
    response.headers.set('x-user-email', session.email);
    response.headers.set('x-user-role', session.role || 'admin');
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
