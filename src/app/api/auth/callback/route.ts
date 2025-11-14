import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/auth/oauth-client';
import { createSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const client = await getOAuthClient();

    // Exchange code for tokens - pass the full URL searchParams
    const { session } = await client.callback(searchParams);

    // Create session - store the session object as JSON for now
    // The actual session structure contains all necessary auth info
    await createSession({
      did: session.sub,
      handle: session.sub, // DID will be used as handle initially
      accessToken: JSON.stringify(session), // Store full session as string
      refreshToken: '', // Not directly accessible
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
    });

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/?error=auth_failed', request.url)
    );
  }
}
