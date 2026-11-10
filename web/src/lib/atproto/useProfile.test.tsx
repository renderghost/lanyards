import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { ALICE } from '@/test/fixtures';
import { server } from '@/test/msw';

import { useProfile } from './useProfile';

const PROFILE_URL =
  'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe('useProfile', () => {
  it('loads the public profile for an actor', async () => {
    server.use(
      http.get(PROFILE_URL, ({ request }) => {
        expect(new URL(request.url).searchParams.get('actor')).toBe(ALICE.did);
        return HttpResponse.json({ ...ALICE, followersCount: 10 });
      })
    );
    const { result } = renderHook(() => useProfile(ALICE.did), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      did: ALICE.did,
      handle: ALICE.handle,
      displayName: ALICE.displayName,
      avatar: ALICE.avatar,
    });
  });

  it('does nothing until there is an actor', () => {
    const { result } = renderHook(() => useProfile(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});
