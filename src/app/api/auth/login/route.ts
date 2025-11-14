import { NextRequest, NextResponse } from 'next/server';
import { loginWithAppPassword } from '@/lib/auth/app-password';
import { createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, pdsUrl } = body;

    // Validate required fields
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Login with app password
    const session = await loginWithAppPassword(
      identifier,
      password,
      pdsUrl || 'https://bsky.social'
    );

    // Create session
    await createSession({
      did: session.did,
      handle: session.handle,
      accessToken: session.accessJwt,
      refreshToken: session.refreshJwt,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return NextResponse.json({
      success: true,
      redirect: '/dashboard',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to login',
      },
      { status: 500 }
    );
  }
}
