import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sealData } from 'iron-session';

import { getDb } from '@/lib/db-instance';
import { createOAuthClient } from '@/lib/oauth/client';
import { normalizeLocalhostTo127 } from '@/lib/oauth/normalize-url';

export async function GET(request: NextRequest) {
  try {
    console.log('[OAuth] Callback started');
    const params = new URLSearchParams(request.nextUrl.searchParams);
    // Removed sensitive param logging

    const db = await getDb();
    console.log('Database initialized');

    // Normalize localhost to 127.0.0.1 for RFC 8252 compliance
    const baseUrl = normalizeLocalhostTo127(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );

    const oauthClient = await createOAuthClient(db, baseUrl);
    console.log('OAuth client created');

    const { session } = await oauthClient.callback(params);
    console.log('OAuth callback succeeded, DID:', session.did);

    // Seal the session data
    const sessionData = { did: session.did };
    const password = process.env.COOKIE_SECRET || 'complex_password_at_least_32_characters_long';
    const sealed = await sealData(sessionData, { password });

    console.log('Session sealed for DID:', session.did);

    // Set the cookie using cookies() API
    const cookieStore = await cookies();
    cookieStore.set('sid', sealed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log('Cookie set, redirecting to dashboard');

    // Derive redirect URL from request (already normalized in baseUrl above)
    const redirectUrl = `${baseUrl}/dashboard`;

    console.log('Redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('OAuth callback failed:', err);
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    });

    // Redirect to auth page on error (normalize localhost to 127.0.0.1)
    const redirectBase = normalizeLocalhostTo127(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );
    return NextResponse.redirect(`${redirectBase}/auth?error=auth`);
  }
}
