import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[oauth-client-metadata] Route hit! Request URL:', request.url);

  // Use PUBLIC_URL if set (production), otherwise derive from request (Vercel previews, local dev)
  const publicUrl = process.env.PUBLIC_URL;
  let baseUrl: string;

  if (publicUrl) {
    baseUrl = publicUrl;
  } else {
    // Derive from request URL for Vercel preview deployments
    const url = new URL(request.url);
    baseUrl = `${url.protocol}//${url.host}`;
  }

  console.log('[oauth-client-metadata] Using baseUrl:', baseUrl);

  return NextResponse.json({
    client_id: `${baseUrl}/oauth-client-metadata.json`,
    client_name: 'Lanyards',
    client_uri: baseUrl,
    redirect_uris: [`${baseUrl}/oauth/callback`],
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true,
  });
}
