// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { createOgHandler } from './ogHandler.ts';

const DID = 'did:plc:fixturealiceaaaaaaaaaaaa';
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input);
  if (url.includes('app.bsky.actor.getProfile')) {
    return Response.json({
      did: DID,
      handle: 'alice.test',
      displayName: 'Ada Example',
      avatar: `https://cdn.bsky.app/img/avatar/plain/${DID}/cid@jpeg`,
      labels: [],
    });
  }
  if (url.startsWith('https://cdn.bsky.app/img/avatar_thumbnail/')) {
    return new Response(new Uint8Array([1, 2, 3]), {
      headers: { 'content-type': 'image/jpeg' },
    });
  }
  return Response.json({ headline: 'Research Engineer' });
}) as unknown as typeof fetch;

describe('OG image handler', () => {
  it('draws the person’s badge with their small avatar', async () => {
    const render = vi.fn(async () => PNG);
    const response = await createOgHandler({ fetchImpl, render })(
      new Request(`https://next.lanyards.app/og/p/${DID}.png?did=${DID}`)
    );
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe(
      'public, s-maxage=86400, stale-while-revalidate=604800'
    );
    expect(render).toHaveBeenCalledWith({
      displayName: 'Ada Example',
      handle: 'alice.test',
      headline: 'Research Engineer',
      avatarDataUri: 'data:image/jpeg;base64,AQID',
    });
  });

  it('draws the default badge without a DID', async () => {
    const render = vi.fn(async () => PNG);
    await createOgHandler({ fetchImpl, render })(
      new Request('https://next.lanyards.app/og/default.png')
    );
    expect(render).toHaveBeenCalledWith(null);
  });

  it('keeps the default badge for a day when no person was asked for', async () => {
    const render = vi.fn(async () => PNG);
    const response = await createOgHandler({ fetchImpl, render })(
      new Request('https://next.lanyards.app/og/default.png')
    );
    expect(response.headers.get('cache-control')).toBe(
      'public, s-maxage=86400, stale-while-revalidate=604800'
    );
  });

  it('draws the default badge, briefly cached, when the profile cannot be read', async () => {
    const render = vi.fn(async () => PNG);
    const failing = (async () =>
      new Response(null, { status: 500 })) as typeof fetch;
    const response = await createOgHandler({ fetchImpl: failing, render })(
      new Request(`https://next.lanyards.app/api/og?did=${DID}`)
    );
    expect(render).toHaveBeenCalledWith(null);
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=60');
  });

  it('falls back to the default badge, briefly cached, when drawing fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const render = vi.fn(async (input: unknown) => {
      if (input) throw new Error('unsupported glyph');
      return PNG;
    });
    const response = await createOgHandler({ fetchImpl, render })(
      new Request(`https://next.lanyards.app/api/og?did=${DID}`)
    );
    expect(render).toHaveBeenLastCalledWith(null);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=60');
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('answers 503, never cached, when even the default badge cannot be drawn', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const render = vi.fn(async () => {
      throw new Error('wasm failed to load');
    });
    const response = await createOgHandler({ fetchImpl, render })(
      new Request(`https://next.lanyards.app/api/og?did=${DID}`)
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
