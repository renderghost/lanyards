import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { track } from '@/lib/analytics/analytics';
import { server } from '@/test/msw';
import { ADA, BEA } from '@/test/people';
import { serveViewerReads, signedInSession, VIEWER_PDS } from '@/test/person';

import { useFollow } from './useFollow';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <AppI18nProvider>{children}</AppI18nProvider>
    </QueryClientProvider>
  );
}

const render = () =>
  renderHook(() => useFollow(ADA.did, 'alice.test'), { wrapper });

const notFollowing = { followedBy: `at://${ADA.did}/app.bsky.graph.follow/3m` };

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did));
});

describe('useFollow', () => {
  it('follows, shows the new state and confirms', async () => {
    serveViewerReads({ relationship: notFollowing });
    let body: unknown;
    server.use(
      http.post(
        `${VIEWER_PDS}/xrpc/com.atproto.repo.createRecord`,
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({
            uri: `at://${BEA.did}/app.bsky.graph.follow/3mnew`,
            cid: `bafyrei${'a'.repeat(52)}`,
          });
        }
      )
    );
    const { result } = render();
    await waitFor(() => expect(result.current.state).toBe('notFollowing'));
    act(() => result.current.follow());
    expect(result.current.state).toBe('following');
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(body).toMatchObject({
      collection: 'app.bsky.graph.follow',
      record: { $type: 'app.bsky.graph.follow', subject: ADA.did },
    });
    expect(notify.success).toHaveBeenCalledWith('Followed @alice.test');
    expect(track).toHaveBeenCalledWith('follow_created');
  });

  it('unfollows by deleting the existing follow record', async () => {
    serveViewerReads();
    let body: unknown;
    server.use(
      http.post(
        `${VIEWER_PDS}/xrpc/com.atproto.repo.deleteRecord`,
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({});
        }
      )
    );
    const { result } = render();
    await waitFor(() => expect(result.current.state).toBe('following'));
    act(() => result.current.unfollow());
    expect(result.current.state).toBe('notFollowing');
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(body).toEqual({
      repo: BEA.did,
      collection: 'app.bsky.graph.follow',
      rkey: '3mfixturefollow',
    });
    expect(notify.success).toHaveBeenCalledWith('Unfollowed @alice.test');
  });

  it('puts the state back and says so when the follow fails', async () => {
    serveViewerReads({ relationship: notFollowing });
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.createRecord`, () =>
        HttpResponse.json({ error: 'InternalServerError' }, { status: 500 })
      )
    );
    const { result } = render();
    await waitFor(() => expect(result.current.state).toBe('notFollowing'));
    act(() => result.current.follow());
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.state).toBe('notFollowing');
    expect(notify.error).toHaveBeenCalledWith(
      'Failed to follow. Please try again.'
    );
  });

  it('rechecks with the server after a failed follow that went through', async () => {
    let checks = 0;
    server.use(
      http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () => {
        checks += 1;
        return HttpResponse.json({
          actor: BEA.did,
          relationships: [
            {
              $type: 'app.bsky.graph.defs#relationship',
              did: ADA.did,
              ...(checks > 1
                ? {
                    following: `at://${BEA.did}/app.bsky.graph.follow/3mlanded`,
                  }
                : {}),
            },
          ],
        });
      }),
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.createRecord`, () =>
        HttpResponse.json({ error: 'UpstreamTimeout' }, { status: 504 })
      )
    );
    const { result } = render();
    await waitFor(() => expect(result.current.state).toBe('notFollowing'));
    act(() => result.current.follow());
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.state).toBe('following');
    expect(notify.error).toHaveBeenCalledWith(
      'Failed to follow. Please try again.'
    );
  });

  it('rechecks with the server after a failed unfollow that went through', async () => {
    let checks = 0;
    server.use(
      http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () => {
        checks += 1;
        return HttpResponse.json({
          actor: BEA.did,
          relationships: [
            {
              $type: 'app.bsky.graph.defs#relationship',
              did: ADA.did,
              ...(checks > 1
                ? {}
                : { following: `at://${BEA.did}/app.bsky.graph.follow/3mold` }),
            },
          ],
        });
      }),
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.deleteRecord`, () =>
        HttpResponse.json({ error: 'UpstreamTimeout' }, { status: 504 })
      )
    );
    const { result } = render();
    await waitFor(() => expect(result.current.state).toBe('following'));
    act(() => result.current.unfollow());
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.state).toBe('notFollowing');
  });

  it('asks for permission instead of writing when the session lacks it', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did, 'atproto'));
    let writes = 0;
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.createRecord`, () => {
        writes += 1;
        return HttpResponse.json({});
      })
    );
    const { result } = render();
    expect(result.current.needsPermission).toBe(true);
    act(() => result.current.follow());
    expect(writes).toBe(0);
  });

  it('stays unknown, never following blindly, when the relationship fails', async () => {
    server.use(
      http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () =>
        HttpResponse.json({ error: 'InternalServerError' }, { status: 500 })
      )
    );
    const { result } = render();
    await waitFor(() => expect(result.current.checkFailed).toBe(true), {
      timeout: 4000,
    });
    expect(result.current.state).toBe('unknown');
  });
});
