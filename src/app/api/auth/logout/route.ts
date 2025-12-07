import { NextResponse, NextRequest } from 'next/server';
import { deleteSession } from '@/lib/oauth/session';

export async function POST(request: NextRequest) {
  try {
    await deleteSession();

    const contentType = request.headers.get('content-type');
    const acceptsJson = request.headers
      .get('accept')
      ?.includes('application/json');

    if (acceptsJson || contentType?.includes('application/json')) {
      return NextResponse.json({ success: true });
    }

    const url = new URL('/', request.url);
    return NextResponse.redirect(url, 303);
  } catch (error) {
    console.error('Logout error:', error);

    const acceptsJson = request.headers
      .get('accept')
      ?.includes('application/json');
    if (acceptsJson) {
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 500 }
      );
    }

    const url = new URL('/', request.url);
    return NextResponse.redirect(url, 303);
  }
}

export async function GET(request: NextRequest) {
  try {
    await deleteSession();
    const url = new URL('/', request.url);
    return NextResponse.redirect(url, 303);
  } catch (error) {
    console.error('Logout error:', error);
    const url = new URL('/', request.url);
    return NextResponse.redirect(url, 303);
  }
}
