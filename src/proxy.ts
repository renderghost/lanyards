import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('lanyard_session');
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
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth', '/dashboard/:path*', '/profile/edit/:path*'],
};
