// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { createMetaHandler } from './metaHandler.ts';

const DID = 'did:plc:fixturealiceaaaaaaaaaaaa';
const INDEX =
  '<!doctype html><html><head><meta name="description" content="Default" /><title>Lanyards</title></head><body></body></html>';

const profileFetch = vi.fn(async (input: RequestInfo | URL) =>
  String(input).includes('app.bsky.actor.getProfile')
    ? Response.json({
        did: DID,
        handle: 'alice.test',
        displayName: 'Ada Example',
        labels: [],
      })
    : Response.json({ error: 'ProfileNotFound' }, { status: 400 })
) as unknown as typeof fetch;

const handler = (fetchImpl: typeof fetch = profileFetch) =>
  createMetaHandler({
    readIndex: async () => INDEX,
    fetchImpl,
    baseUrl: 'https://next.lanyards.app',
  });

describe('meta handler', () => {
  it('serves the app with person-specific meta, cached for ten minutes', async () => {
    const response = await handler()(
      new Request('https://next.lanyards.app/@alice.test?handle=alice.test')
    );
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=utf-8'
    );
    expect(response.headers.get('cache-control')).toBe(
      'public, s-maxage=600, stale-while-revalidate=86400'
    );
    expect(html).toContain(
      '<meta property="og:title" content="Ada Example (@alice.test) · Lanyards" />'
    );
    expect(html).toContain(
      `<meta property="og:image" content="https://next.lanyards.app/og/p/${DID}.png" />`
    );
  });

  it('reads the handle or DID from the path when the query has none', async () => {
    const fetchImpl = vi.fn(profileFetch);
    await handler(fetchImpl as unknown as typeof fetch)(
      new Request(`https://next.lanyards.app/d/${DID}`)
    );
    expect(String(vi.mocked(fetchImpl).mock.calls[0]?.[0])).toContain(
      `actor=${encodeURIComponent(DID)}`
    );
  });

  it('serves default meta, briefly cached, when the person is unknown', async () => {
    const missing = (async () =>
      Response.json(
        { error: 'InvalidRequest' },
        { status: 400 }
      )) as typeof fetch;
    const response = await handler(missing)(
      new Request('https://next.lanyards.app/@nobody.test?handle=nobody.test')
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=60');
    expect(await response.text()).toContain(
      '<meta property="og:image" content="https://next.lanyards.app/og/default.png" />'
    );
  });

  it.each([
    'https://next.lanyards.app/@ada%',
    'https://next.lanyards.app/@x?handle=ada%25',
    'https://next.lanyards.app/d/did%3Aplc%3Aa%',
  ])('serves default meta for a malformed escape in %s', async (url) => {
    const fetchImpl = vi.fn(profileFetch);
    const response = await handler(fetchImpl as unknown as typeof fetch)(
      new Request(url)
    );
    expect(response.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(await response.text()).toContain('<title>Lanyards</title>');
  });

  it('never looks up something that is not a handle or DID', async () => {
    const fetchImpl = vi.fn(profileFetch);
    const response = await handler(fetchImpl as unknown as typeof fetch)(
      new Request('https://next.lanyards.app/@x?handle=%3Cscript%3E')
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(await response.text()).toContain('<title>Lanyards</title>');
  });
});
