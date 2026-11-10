import { describe, expect, it } from 'vitest';

import { buildOAuthEnv, resolveBaseUrl, safeReturnTo } from './oauthConfig';

describe('buildOAuthEnv', () => {
  it('uses the RFC 8252 loopback client on 127.0.0.1', () => {
    expect(buildOAuthEnv('http://127.0.0.1:5173', 'atproto')).toEqual({
      clientId:
        'http://localhost?redirect_uri=http%3A%2F%2F127.0.0.1%3A5173%2Foauth%2Fcallback&scope=atproto',
      redirectUri: 'http://127.0.0.1:5173/oauth/callback',
      metadata: null,
    });
  });

  it('builds hosted client metadata for https origins', () => {
    expect(
      buildOAuthEnv('https://next.lanyards.app', 'atproto').metadata
    ).toEqual({
      client_id: 'https://next.lanyards.app/oauth-client-metadata.json',
      client_name: 'Lanyards',
      client_uri: 'https://next.lanyards.app',
      logo_uri: 'https://next.lanyards.app/pwa-192x192.png',
      redirect_uris: ['https://next.lanyards.app/oauth/callback'],
      scope: 'atproto',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      application_type: 'web',
      dpop_bound_access_tokens: true,
    });
  });

  it('refuses plain http on anything but the loopback address', () => {
    expect(() => buildOAuthEnv('http://example.com', 'atproto')).toThrow();
    expect(() => buildOAuthEnv('http://localhost:5173', 'atproto')).toThrow();
  });
});

describe('resolveBaseUrl', () => {
  it('uses the loopback dev server when serving', () => {
    expect(resolveBaseUrl({ command: 'serve', env: {} })).toBe(
      'http://127.0.0.1:5173'
    );
  });

  it('uses PUBLIC_BASE_URL without a trailing slash for builds', () => {
    expect(
      resolveBaseUrl({
        command: 'build',
        env: { PUBLIC_BASE_URL: 'https://next.lanyards.app/' },
      })
    ).toBe('https://next.lanyards.app');
  });

  it('falls back to the Vercel branch URL for preview builds', () => {
    expect(
      resolveBaseUrl({
        command: 'build',
        env: { VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'x.vercel.app' },
      })
    ).toBe('https://x.vercel.app');
  });

  it('refuses production builds without a base URL', () => {
    expect(() => resolveBaseUrl({ command: 'build', env: {} })).toThrow(
      'PUBLIC_BASE_URL must be set for production builds'
    );
  });
});

describe('safeReturnTo', () => {
  it('keeps same-origin paths', () => {
    expect(safeReturnTo('/settings')).toBe('/settings');
    expect(safeReturnTo('/e/did:plc:abc/3k?x=1')).toBe('/e/did:plc:abc/3k?x=1');
  });

  it.each([
    '//evil.com',
    'https://evil.com',
    '/\\evil',
    42,
    undefined,
    null,
    '',
    'settings',
    '/' + 'a'.repeat(600),
  ])('replaces %s with the home page', (bad) => {
    expect(safeReturnTo(bad)).toBe('/');
  });
});
