import { Client, simpleFetchHandler } from '@atcute/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { GRANULAR_SCOPE } from '@/lib/atproto/oauthConfig';
import knownFollowers from '@/lib/sources/bluesky/fixtures/getKnownFollowers.json';
import relationships from '@/lib/sources/bluesky/fixtures/getRelationships.json';
import { server } from '@/test/msw';
import { ADA, BEA } from '@/test/people';

import { useSharedContext } from './useSharedContext';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

const VIEWER_PDS = 'https://pds.bea.test';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const signedInAs = (did: string, scope: string) =>
  vi.mocked(useSession).mockReturnValue({
    status: 'signedIn',
    session: {
      did,
      scope,
      appview: new Client({
        handler: simpleFetchHandler({ service: VIEWER_PDS }),
      }),
    } as never,
    signOut: vi.fn(),
    refresh: vi.fn(),
  });

let calls = 0;

beforeEach(() => {
  calls = 0;
  server.use(
    http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () => {
      calls += 1;
      return HttpResponse.json(relationships);
    }),
    http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getKnownFollowers`, () => {
      calls += 1;
      return HttpResponse.json(knownFollowers);
    })
  );
});

describe('useSharedContext', () => {
  it('reports mutual follows and known followers', async () => {
    signedInAs(BEA.did, GRANULAR_SCOPE);
    const { result } = renderHook(() => useSharedContext(ADA.did), {
      wrapper,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.mutual).toBe(true);
    expect(result.current.knownFollowers?.count).toBe(5);
    expect(result.current.relationship?.blocked).toBe(false);
  });

  it('asks nothing when signed out', () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    const { result } = renderHook(() => useSharedContext(ADA.did), {
      wrapper,
    });
    expect(result.current).toEqual({ mutual: false, loading: false });
    expect(calls).toBe(0);
  });

  it('asks nothing on your own lanyard', () => {
    signedInAs(ADA.did, GRANULAR_SCOPE);
    const { result } = renderHook(() => useSharedContext(ADA.did), {
      wrapper,
    });
    expect(result.current.loading).toBe(false);
    expect(calls).toBe(0);
  });

  it('asks nothing when the session was not granted the reads', () => {
    signedInAs(BEA.did, 'atproto');
    const { result } = renderHook(() => useSharedContext(ADA.did), {
      wrapper,
    });
    expect(result.current.loading).toBe(false);
    expect(calls).toBe(0);
  });
});
