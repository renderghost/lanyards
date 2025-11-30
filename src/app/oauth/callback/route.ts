import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sealData } from 'iron-session';

import { getDb } from '@/lib/db-instance';
import { createOAuthClient } from '@/lib/oauth/client';

export async function GET(request: NextRequest) {
  try {
    console.log('[OAuth] Callback started');
    const params = new URLSearchParams(request.nextUrl.searchParams);
    console.log('Callback params:', Object.fromEntries(params.entries()));

    const db = await getDb();
    console.log('Database initialized');

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
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

    // Use NextResponse.redirect() to ensure cookie is set before redirect
    // Always use 127.0.0.1 for consistency (required by RFC 8252)
    const url = new URL(request.url);
    const protocol = url.protocol;
    const port = url.port || '3000';
    const redirectUrl = `${protocol}//127.0.0.1:${port}/dashboard`;

    console.log('Redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('OAuth callback failed:', err);
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    });

    // Redirect to auth page on error
    const url = new URL(request.url);
    const protocol = url.protocol;
    const port = url.port || '3000';
    return NextResponse.redirect(`${protocol}//127.0.0.1:${port}/auth?error=auth`);
  }
}
