import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Check for both new OAuth session (sid) and legacy session (lanyard_session)
  const sessionCookie = request.cookies.get('sid') || request.cookies.get('lanyard_session');

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedPage =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile/edit');

  // Redirect authenticated users away from auth page
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to auth page
  if (isProtectedPage && !sessionCookie) {
    console.log('[Middleware] No session cookie found, redirecting to /auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth', '/dashboard/:path*', '/profile/edit/:path*'],
};
