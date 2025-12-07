import { NextRequest, NextResponse } from 'next/server';
import { OAuthResolverError } from '@atproto/oauth-client-node';
import { isValidHandle } from '@atproto/syntax';

import { getDb } from '@/lib/db-instance';
import { createOAuthClient } from '@/lib/oauth/client';

function isValidUrl(url: string): boolean {
  try {
    const urlp = new URL(url);
    return urlp.protocol === 'http:' || urlp.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const handle = body?.handle;

    if (
      typeof handle !== 'string' ||
      !(isValidHandle(handle) || isValidUrl(handle))
    ) {
      return NextResponse.json(
        { error: 'Invalid handle' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const oauthClient = await createOAuthClient(db, baseUrl);

    const url = await oauthClient.authorize(handle, {
      scope: 'atproto transition:generic',
    });

    return NextResponse.json({ redirectUrl: url.toString() });
  } catch (err) {
    console.error('OAuth authorize failed:', err);
    const errorMsg =
      err instanceof OAuthResolverError
        ? err.message
        : "Couldn't initiate login";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
