import { NextResponse, NextRequest } from 'next/server';
import { deleteSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await deleteSession();

    // If it's a fetch request (from JavaScript), return JSON
    const contentType = request.headers.get('content-type');
    const acceptsJson = request.headers.get('accept')?.includes('application/json');

    if (acceptsJson || contentType?.includes('application/json')) {
      return NextResponse.json({ success: true });
    }

    // For form submissions, redirect to home page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/', baseUrl));
  } catch (error) {
    console.error('Logout error:', error);

    // Always redirect on error for form submissions, return JSON for fetch requests
    const acceptsJson = request.headers.get('accept')?.includes('application/json');
    if (acceptsJson) {
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/', baseUrl));
  }
}

export async function GET() {
  try {
    await deleteSession();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/', baseUrl));
  } catch (error) {
    console.error('Logout error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/', baseUrl));
  }
}
