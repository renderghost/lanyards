import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { coverFor } from '@/design/covers';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';
import { servePerson } from '@/test/person';

import { useOwnerBadge } from './useOwnerBadge';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const sifaDown = () =>
  server.use(
    http.get('https://sifa.id/xrpc/id.sifa.getProfileView', () =>
      HttpResponse.json({}, { status: 500 })
    ),
    http.get(`${ADA.pds}/xrpc/com.atproto.repo.listRecords`, ({ request }) =>
      new URL(request.url).searchParams.get('collection')?.startsWith('id.sifa')
        ? HttpResponse.json({}, { status: 500 })
        : undefined
    )
  );

describe('useOwnerBadge', () => {
  it('reads the owner’s badge, accent and cover the way the lanyard does', async () => {
    servePerson({ config: { accent: 'pink', badge: { cover: 'hazard' } } });
    const { result } = renderHook(() => useOwnerBadge(ADA.did), { wrapper });
    await waitFor(() => expect(result.current.accent).toBe('pink'));
    await waitFor(() =>
      expect(result.current.hero).toMatchObject({
        displayName: 'Ada Example',
        honorificPrefix: 'Dr',
        cover: 'hazard',
        role: { title: 'Research Engineer', company: 'Example Lab' },
      })
    );
  });

  it('falls back to the Bluesky name when Sifa fails', async () => {
    servePerson({ config: null, profile: { displayName: 'Ada (Bluesky)' } });
    sifaDown();
    const { result } = renderHook(() => useOwnerBadge(ADA.did), { wrapper });
    await waitFor(
      () =>
        expect(result.current.hero).toMatchObject({
          displayName: 'Ada (Bluesky)',
          cover: coverFor(ADA.did),
        }),
      { timeout: 4000 }
    );
    expect(result.current.hero?.role).toBeUndefined();
    expect(result.current.accent).toBe('blue');
  });

  it('has no badge, and the default accent, when nothing can be read', async () => {
    server.use(
      http.get(
        'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile',
        () => HttpResponse.error()
      ),
      http.get('https://plc.directory/*', () => HttpResponse.error()),
      http.get('https://sifa.id/xrpc/id.sifa.getProfileView', () =>
        HttpResponse.error()
      )
    );
    const { result } = renderHook(() => useOwnerBadge(ADA.did), { wrapper });
    expect(result.current).toEqual({ hero: null, accent: 'blue' });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(result.current).toEqual({ hero: null, accent: 'blue' });
  });
});
