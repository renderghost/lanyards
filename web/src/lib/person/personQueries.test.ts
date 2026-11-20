import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import profile from '@/lib/sources/bluesky/fixtures/getProfile.json';
import sifaView from '@/lib/sources/sifa/fixtures/getProfileView.json';
import { queryKeys } from '@/lib/query/keys';
import {
  mockDidDocument,
  mockGetRecord,
  mockListRecords,
} from '@/test/handlers';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';

import { prefetchHandleLanyard, prefetchLanyard } from './personQueries';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const PROFILE = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile';
const SIFA_VIEW = 'https://sifa.id/xrpc/id.sifa.getProfileView';

let requests: string[] = [];

beforeEach(() => {
  requests = [];
  server.events.on('request:start', ({ request }) => {
    requests.push(decodeURIComponent(request.url));
  });
  mockDidDocument(ADA.did, ADA.pds);
  mockGetRecord(ADA.pds, ADA.did, 'app.lanyards.actor.lanyard', 'self', null);
  for (const collection of [
    'app.lanyards.media.item',
    'app.lanyards.link.media.audio',
    'app.lanyards.link.media.video',
  ]) {
    mockListRecords(ADA.pds, ADA.did, collection, []);
  }
  server.use(
    http.get(PROFILE, () => HttpResponse.json(profile)),
    http.get(SIFA_VIEW, () => HttpResponse.json(sifaView))
  );
});

afterEach(() => {
  server.events.removeAllListeners();
});

const client = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

// The badge waits for these (#129): the lanyard's routes start them before
// its code has loaded, under the keys the page itself reads.
describe('prefetching a lanyard', () => {
  it('starts the profile, Sifa, kept records and settings by DID', async () => {
    const queryClient = client();
    prefetchLanyard(queryClient, ADA.did);
    await vi.waitFor(() => {
      for (const key of [
        queryKeys.source('bluesky', ADA.did),
        queryKeys.source('sifa', ADA.did),
        queryKeys.source('lanyards', ADA.did),
        queryKeys.source('lanyards', ADA.did, 'config'),
      ]) {
        expect(queryClient.getQueryState(key)?.status).not.toBe('pending');
      }
    });
    expect(
      queryClient.getQueryData(queryKeys.source('bluesky', ADA.did))
    ).toMatchObject({ did: ADA.did, handle: 'alice.test' });
    expect(
      queryClient.getQueryState(queryKeys.source('sifa', ADA.did))?.status
    ).toBe('success');
  });

  it('resolves a handle first, then prefetches by its DID', async () => {
    const queryClient = client();
    prefetchHandleLanyard(queryClient, 'alice.test');
    await vi.waitFor(() =>
      expect(
        queryClient.getQueryState(queryKeys.source('sifa', ADA.did))?.status
      ).toBe('success')
    );
    expect(queryClient.getQueryData(['resolveHandle', 'alice.test'])).toBe(
      ADA.did
    );
    // The profile comes from resolving the handle: it isn't read twice.
    expect(requests.filter((url) => url.startsWith(PROFILE))).toHaveLength(1);
  });

  it('prefetches nothing more when the handle doesn’t resolve', async () => {
    server.use(
      http.get(PROFILE, () =>
        HttpResponse.json(
          { error: 'InvalidRequest', message: 'Profile not found' },
          { status: 400 }
        )
      )
    );
    const queryClient = client();
    prefetchHandleLanyard(queryClient, 'nobody.test');
    await vi.waitFor(() =>
      expect(
        queryClient.getQueryState(['resolveHandle', 'nobody.test'])?.status
      ).toBe('error')
    );
    expect(requests.some((url) => url.startsWith(SIFA_VIEW))).toBe(false);
  });
});
