import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import profile from '@/lib/sources/bluesky/fixtures/getProfile.json';
import sifaView from '@/lib/sources/sifa/fixtures/getProfileView.json';
import {
  mockDidDocument,
  mockGetRecord,
  mockListRecords,
} from '@/test/handlers';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';

import { usePersonView } from './usePersonView';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const SIFA_VIEW = 'https://sifa.id/xrpc/id.sifa.getProfileView';
const NOW = '2026-11-01T09:00:00.000Z';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function serveLanyards(config: Record<string, unknown> | null) {
  mockDidDocument(ADA.did, ADA.pds);
  mockGetRecord(
    ADA.pds,
    ADA.did,
    'app.lanyards.actor.lanyard',
    'self',
    config
      ? {
          uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
          cid: `bafyrei${'a'.repeat(52)}`,
          value: {
            $type: 'app.lanyards.actor.lanyard',
            createdAt: NOW,
            ...config,
          },
        }
      : null
  );
  mockGetRecord(
    ADA.pds,
    ADA.did,
    'app.lanyards.actor.biography.honorific',
    'self',
    null
  );
  for (const collection of [
    'app.lanyards.link.web',
    'app.lanyards.link.media.audio',
    'app.lanyards.link.media.video',
  ]) {
    mockListRecords(ADA.pds, ADA.did, collection, []);
  }
}

let requests: string[] = [];

beforeEach(() => {
  requests = [];
  server.events.on('request:start', ({ request }) => {
    requests.push(decodeURIComponent(request.url));
  });
  vi.mocked(useSession).mockReturnValue({
    status: 'signedOut',
    signOut: vi.fn(),
    refresh: vi.fn(),
  });
  server.use(
    http.get('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile', () =>
      HttpResponse.json(profile)
    ),
    http.get(SIFA_VIEW, () => HttpResponse.json(sifaView))
  );
});

afterEach(() => {
  server.events.removeAllListeners();
});

const settled = (result: { current: ReturnType<typeof usePersonView> }) =>
  waitFor(() => {
    expect(result.current.configReady).toBe(true);
    expect(
      result.current.blocks.every((block) => block.status !== 'loading')
    ).toBe(true);
    expect(result.current.hero).toBeDefined();
  });

describe('usePersonView', () => {
  it('reads only the profile, Sifa and Lanyards for the default lanyard', async () => {
    serveLanyards(null);
    const { result } = renderHook(() => usePersonView(ADA.did), { wrapper });
    await settled(result);
    expect(result.current.blocks.map((block) => block.type)).toEqual([
      'links',
      'talks',
    ]);
    expect(requests.some((url) => url.includes('getAuthorFeed'))).toBe(false);
    expect(requests.some((url) => url.includes('pub.orcid.org'))).toBe(false);
    expect(requests.some((url) => url.includes('api.tangled.org'))).toBe(false);
    expect(requests.some((url) => url.includes('site.standard'))).toBe(false);
  });

  it('reads ORCID once the publications block is visible', async () => {
    serveLanyards({ blocks: [{ type: 'publications', visible: true }] });
    server.use(
      http.get('https://pub.orcid.org/v3.0/0000-0002-1825-0097/works', () =>
        HttpResponse.json({ group: [] })
      ),
      http.get(
        'https://pub.orcid.org/v3.0/0000-0002-1825-0097/researcher-urls',
        () => HttpResponse.json({ 'researcher-url': [] })
      )
    );
    const { result } = renderHook(() => usePersonView(ADA.did), { wrapper });
    await settled(result);
    expect(
      requests.filter((url) => url.includes('pub.orcid.org')).sort()
    ).toEqual([
      'https://pub.orcid.org/v3.0/0000-0002-1825-0097/researcher-urls',
      'https://pub.orcid.org/v3.0/0000-0002-1825-0097/works',
    ]);
  });

  it('still builds the badge from Bluesky when Sifa and its fallback fail', async () => {
    server.use(
      http.get(`${ADA.pds}/xrpc/com.atproto.repo.listRecords`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    serveLanyards(null);
    server.use(
      http.get(SIFA_VIEW, () => HttpResponse.json({}, { status: 500 }))
    );
    const { result } = renderHook(() => usePersonView(ADA.did), { wrapper });
    await waitFor(() => expect(result.current.hero).toBeDefined());
    // Sifa is retried once (about a second) before it counts as failed.
    await waitFor(
      () =>
        expect(result.current.blocks.map((block) => block.type)).toEqual([
          'links',
        ]),
      { timeout: 5000 }
    );
    expect(result.current.hero).toMatchObject({
      displayName: 'Ada Example',
      headline: 'Research engineer working on open protocols.',
    });
    expect(result.current.hero?.job).toBeUndefined();
  });

  it('knows when the viewer is the owner', async () => {
    serveLanyards(null);
    vi.mocked(useSession).mockReturnValue({
      status: 'signedIn',
      session: { did: ADA.did, scope: 'atproto' } as never,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    const { result } = renderHook(() => usePersonView(ADA.did), { wrapper });
    await settled(result);
    expect(result.current.mode).toBe('owner');
  });
});
