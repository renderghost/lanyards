import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { track } from '@/lib/analytics/analytics';
import { putRecord } from '@/lib/atproto/writes';
import { fetchLanyardConfig } from '@/lib/sources/lanyards/lanyards';
import { queryKeys } from '@/lib/query/keys';
import { ADA } from '@/test/people';
import { signedInSession } from '@/test/person';

import { useLanyardConfig } from './useLanyardConfig';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('@/lib/sources/lanyards/lanyards', () => ({
  fetchLanyardConfig: vi.fn(),
}));
vi.mock('@/lib/atproto/writes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/writes')>()),
  putRecord: vi.fn(),
}));

const CID = `bafyrei${'a'.repeat(52)}`;
const STORED = {
  $type: 'app.lanyards.actor.lanyard',
  accent: 'violet',
  createdAt: '2026-11-01T09:00:00.000Z',
};

let client: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <AppI18nProvider>{children}</AppI18nProvider>
    </QueryClientProvider>
  );
}

const render = () => renderHook(() => useLanyardConfig(), { wrapper });

/** Lets timers and the promises they start run. */
const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const saved = () =>
  vi.mocked(putRecord).mock.calls.map(([, collection, rkey, fields]) => ({
    collection,
    rkey,
    fields,
  }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-10T12:00:00.000Z'));
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(queryKeys.source('lanyards', ADA.did, 'config'), {
    value: STORED,
    cid: CID,
    valid: true,
  });
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  vi.mocked(fetchLanyardConfig).mockResolvedValue({
    ok: true,
    value: { value: STORED, cid: CID, valid: true },
  });
  vi.mocked(putRecord).mockResolvedValue({
    uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
    cid: CID,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useLanyardConfig', () => {
  it('reads the owner’s stored settings', () => {
    const { result } = render();
    expect(result.current.config.accent).toBe('violet');
    expect(result.current.saving).toBe(false);
  });

  it('applies changes at once and saves them together after 800 ms', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'rose' })));
    expect(result.current.config.accent).toBe('rose');
    expect(result.current.saving).toBe(true);
    await advance(300);
    act(() => result.current.update((c) => ({ ...c, accent: 'moss' })));
    await advance(300);
    act(() => result.current.update((c) => ({ ...c, showJob: false })));
    await advance(799);
    expect(putRecord).not.toHaveBeenCalled();
    await advance(1);
    expect(saved()).toEqual([
      {
        collection: 'app.lanyards.actor.lanyard',
        rkey: 'self',
        fields: expect.objectContaining({
          accent: 'moss',
          showJob: false,
          createdAt: STORED.createdAt,
          updatedAt: '2026-11-10T12:00:01.400Z',
        }),
      },
    ]);
    expect(result.current.saving).toBe(false);
    expect(notify.success).toHaveBeenCalledWith('Lanyard updated');
    expect(track).toHaveBeenCalledWith('lanyard_updated');
  });

  it('keeps the change and offers Retry when the save fails', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await advance(800);
    expect(result.current.error).toBe(true);
    expect(result.current.saving).toBe(false);
    expect(result.current.config.accent).toBe('teal');
    expect(notify.error).toHaveBeenCalledWith(
      'Failed to save. Please try again.',
      { action: { label: 'Retry', onClick: expect.any(Function) } }
    );

    act(() => result.current.retry());
    await advance(0);
    expect(putRecord).toHaveBeenCalledTimes(2);
    expect(saved()[1]?.fields).toMatchObject({ accent: 'teal' });
    expect(result.current.error).toBe(false);
    expect(notify.success).toHaveBeenCalledWith('Lanyard updated');
  });

  it('retries from the toast’s Retry action', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'ember' })));
    await advance(800);
    const options = vi.mocked(notify.error).mock.calls[0]?.[1];
    act(() => options?.action?.onClick());
    await advance(0);
    expect(putRecord).toHaveBeenCalledTimes(2);
  });

  it('saves a pending change straight away when the page is hidden', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'plum' })));
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    await advance(0);
    expect(saved()).toEqual([
      expect.objectContaining({
        fields: expect.objectContaining({ accent: 'plum' }),
      }),
    ]);
  });

  it('never saves over a stored record it cannot read, until reset', async () => {
    const invalid = {
      ...STORED,
      events: [{ event: 'at://did:plc:x/community.lexicon.calendar.event/1' }],
      blocks: [{ type: 'links', visible: true, limit: 0 }],
    };
    client.setQueryData(queryKeys.source('lanyards', ADA.did, 'config'), {
      value: invalid,
      cid: CID,
      valid: false,
    });
    const { result } = render();
    expect(result.current.ready).toBe(false);
    expect(result.current.invalid).toBe(true);
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await advance(1000);
    expect(putRecord).not.toHaveBeenCalled();

    act(() => result.current.reset());
    await advance(0);
    expect(saved()).toEqual([
      expect.objectContaining({
        rkey: 'self',
        fields: expect.objectContaining({
          accent: 'violet',
          createdAt: STORED.createdAt,
        }),
      }),
    ]);
    expect(saved()[0]?.fields).not.toHaveProperty('events');
    expect(result.current.invalid).toBe(false);
    expect(result.current.ready).toBe(true);
  });

  const key = () => queryKeys.source('lanyards', ADA.did, 'config');
  const refetch = () =>
    act(async () => {
      await client.refetchQueries({ queryKey: key() });
    });

  it('keeps an unsaved change when the settings are fetched again', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await refetch();
    expect(fetchLanyardConfig).toHaveBeenCalled();
    expect(result.current.config.accent).toBe('teal');
    await advance(800);
    expect(saved()).toEqual([
      expect.objectContaining({
        fields: expect.objectContaining({ accent: 'teal' }),
      }),
    ]);
  });

  it('keeps a change whose save failed when the settings are fetched again', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await advance(800);
    expect(result.current.error).toBe(true);
    await refetch();
    expect(result.current.config.accent).toBe('teal');
    act(() => result.current.retry());
    await advance(0);
    expect(saved()[1]?.fields).toMatchObject({ accent: 'teal' });
  });

  it('puts back the saved settings for everyone when it closes after a failed save', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result, unmount } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await advance(800);
    unmount();
    const stored = client.getQueryData<{ value: { accent: string } }>(key());
    expect(stored?.value.accent).toBe('violet');
  });

  it('saves a pending change when the app goes into the background', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'moss' })));
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await advance(0);
    expect(saved()).toEqual([
      expect.objectContaining({
        fields: expect.objectContaining({ accent: 'moss' }),
      }),
    ]);
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
  });

  it('saves a pending change when the customiser closes', async () => {
    const { result, unmount } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'ocean' })));
    unmount();
    await vi.advanceTimersByTimeAsync(0);
    expect(saved()).toEqual([
      expect.objectContaining({
        fields: expect.objectContaining({ accent: 'ocean' }),
      }),
    ]);
  });
});
