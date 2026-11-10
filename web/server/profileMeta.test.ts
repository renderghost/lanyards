// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { fetchProfileMeta } from './profileMeta.ts';

const DID = 'did:plc:fixturealiceaaaaaaaaaaaa';
const BASE = 'https://lanyards.app';

const profile = {
  did: DID,
  handle: 'alice.test',
  displayName: 'Ada Example',
  description: 'First paragraph of the bio.\n\nSecond paragraph.',
  avatar: 'https://cdn.bsky.app/img/avatar/plain/x/y@jpeg',
  labels: [],
};

function stubFetch(answers: {
  profile?: unknown;
  profileStatus?: number;
  sifa?: unknown;
  sifaStatus?: number;
  hang?: boolean;
}): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (answers.hang) {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    }
    if (url.includes('app.bsky.actor.getProfile')) {
      return Response.json(answers.profile ?? profile, {
        status: answers.profileStatus ?? 200,
      });
    }
    return Response.json(answers.sifa ?? { error: 'ProfileNotFound' }, {
      status: answers.sifaStatus ?? 400,
    });
  }) as typeof fetch;
}

describe('fetchProfileMeta', () => {
  it('describes a person with their Sifa headline', async () => {
    const meta = await fetchProfileMeta(
      { handle: 'alice.test' },
      BASE,
      stubFetch({
        sifa: { did: DID, handle: 'alice.test', headline: 'Research Engineer' },
        sifaStatus: 200,
      })
    );
    expect(meta).toEqual({
      title: 'Ada Example (@alice.test) · Lanyards',
      description: 'Research Engineer',
      canonical: 'https://lanyards.app/@alice.test',
      image: `https://lanyards.app/og/p/${DID}.png`,
      imageAlt: "Ada Example's lanyard",
      type: 'profile',
    });
  });

  it('falls back to the first paragraph of the Bluesky bio, up to 200 characters', async () => {
    const short = await fetchProfileMeta({ did: DID }, BASE, stubFetch({}));
    expect(short?.description).toBe('First paragraph of the bio.');
    const long = await fetchProfileMeta(
      { did: DID },
      BASE,
      stubFetch({ profile: { ...profile, description: 'x'.repeat(300) } })
    );
    expect(long?.description).toBe(`${'x'.repeat(200)}…`);
  });

  it('points the DID page at the handle URL', async () => {
    const meta = await fetchProfileMeta({ did: DID }, BASE, stubFetch({}));
    expect(meta?.canonical).toBe('https://lanyards.app/@alice.test');
  });

  it('gives nothing away for someone who opted out of logged-out viewing', async () => {
    const meta = await fetchProfileMeta(
      { did: DID },
      BASE,
      stubFetch({
        profile: {
          ...profile,
          labels: [
            {
              src: DID,
              uri: 'at://x',
              val: '!no-unauthenticated',
              cts: '2026-01-01T00:00:00Z',
            },
          ],
        },
      })
    );
    expect(meta).toBeNull();
  });

  it('returns null when the profile does not exist', async () => {
    const meta = await fetchProfileMeta(
      { handle: 'nobody.test' },
      BASE,
      stubFetch({
        profile: { error: 'InvalidRequest', message: 'Profile not found' },
        profileStatus: 400,
      })
    );
    expect(meta).toBeNull();
  });

  it('returns null rather than waiting when Bluesky is slow', async () => {
    vi.useFakeTimers();
    const pending = fetchProfileMeta(
      { did: DID },
      BASE,
      stubFetch({ hang: true })
    );
    await vi.advanceTimersByTimeAsync(1500);
    await expect(pending).resolves.toBeNull();
    vi.useRealTimers();
  });
});
