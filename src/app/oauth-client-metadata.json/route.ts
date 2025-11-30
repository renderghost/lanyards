import { NextResponse } from 'next/server';

export async function GET() {
  const publicUrl = process.env.PUBLIC_URL;
  const clientIdUrl = publicUrl || 'http://localhost:3000';
  const redirectUrl = publicUrl || 'http://127.0.0.1:3000';

  return NextResponse.json({
    client_id: `${clientIdUrl}/oauth-client-metadata.json`,
    client_name: 'Lanyards',
    client_uri: clientIdUrl,
    redirect_uris: [`${redirectUrl}/oauth/callback`],
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true,
  });
}
