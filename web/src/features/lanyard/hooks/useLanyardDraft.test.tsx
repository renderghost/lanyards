import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { captureError, track } from '@/lib/analytics/analytics';
import { putRecord, RecordChangedError } from '@/lib/atproto/writes';
import { fetchLanyardConfig } from '@/lib/sources/lanyards/lanyards';
import { queryKeys } from '@/lib/query/keys';
import { ADA } from '@/test/people';
import { signedInSession } from '@/test/person';

import { useLanyardDraft } from './useLanyardDraft';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('@/lib/sources/lanyards/lanyards', () => ({
  fetchLanyardConfig: vi.fn(),
}));
vi.mock('@/lib/atproto/writes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/writes')>()),
  putRecord: vi.fn(),
}));

const CID = `bafyrei${'a'.repeat(52)}`;
/** The CID after another device saved the settings. */
const OTHER = `bafyrei${'b'.repeat(52)}`;
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

const render = () => renderHook(() => useLanyardDraft(), { wrapper });

type Draft = ReturnType<typeof render>['result'];

/** Lets timers and the promises they start run. */
const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

/** Presses Save and waits for it to finish; resolves to its result. */
async function save(result: Draft): Promise<boolean> {
  let outcome = false;
  await act(async () => {
    outcome = await result.current.save();
  });
  return outcome;
}

const saved = () =>
  vi.mocked(putRecord).mock.calls.map(([, collection, rkey, fields]) => ({
    collection,
    rkey,
    fields,
  }));

const key = () => queryKeys.source('lanyards', ADA.did, 'config');
const refetch = () =>
  act(async () => {
    await client.refetchQueries({ queryKey: key() });
  });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-10T12:00:00.000Z'));
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(key(), { value: STORED, cid: CID, valid: true });
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

describe('useLanyardDraft', () => {
  it('reads the owner’s stored settings, with nothing to save', () => {
    const { result } = render();
    expect(result.current.config.accent).toBe('violet');
    expect(result.current.saved).toEqual(result.current.config);
    expect(result.current.dirty).toBe(false);
    expect(result.current.changes).toBe(0);
    expect(result.current.saving).toBe(false);
  });

  it('shows a change at once but writes nothing until Save', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'rose' })));
    expect(result.current.config.accent).toBe('rose');
    await advance(5000);
    expect(putRecord).not.toHaveBeenCalled();
    expect(result.current.dirty).toBe(true);
    expect(result.current.changes).toBe(1);
    expect(result.current.saved.accent).toBe('violet');
  });

  it('counts each changed setting once', () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'rose' })));
    act(() => result.current.update((c) => ({ ...c, accent: 'moss' })));
    act(() => result.current.update((c) => ({ ...c, showJob: false })));
    expect(result.current.changes).toBe(2);
  });

  it('counts each block and hidden item that changed', () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, hidden: ['k1', 'k2'] })));
    expect(result.current.changes).toBe(2);
    act(() =>
      result.current.update((c) => ({
        ...c,
        blocks: c.blocks.map((block, index) =>
          index === 0 ? { ...block, visible: !block.visible } : block
        ),
      }))
    );
    expect(result.current.changes).toBe(3);
    // Swapping the first two blocks moves both.
    act(() =>
      result.current.update((c) => ({
        ...c,
        blocks: [c.blocks[1]!, c.blocks[0]!, ...c.blocks.slice(2)],
      }))
    );
    expect(result.current.changes).toBe(4);
  });

  it('is clean again when a change is undone by hand', () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'rose' })));
    act(() => result.current.update((c) => ({ ...c, accent: 'violet' })));
    expect(result.current.dirty).toBe(false);
    expect(result.current.changes).toBe(0);
  });

  it('Save writes the draft and clears dirty', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'moss' })));
    act(() => result.current.update((c) => ({ ...c, showJob: false })));
    await advance(1400);
    expect(await save(result)).toBe(true);
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
    expect(result.current.dirty).toBe(false);
    expect(result.current.saved.accent).toBe('moss');
    expect(result.current.saving).toBe(false);
    expect(notify.success).toHaveBeenCalledTimes(1);
    expect(notify.success).toHaveBeenCalledWith('Lanyard updated');
    expect(track).toHaveBeenCalledWith('lanyard_updated');
  });

  it('saves quietly when asked, for a caller that announces it', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'moss' })));
    let outcome = false;
    await act(async () => {
      outcome = await result.current.save({ announce: false });
    });
    expect(outcome).toBe(true);
    expect(notify.success).not.toHaveBeenCalled();
  });

  it('Save with nothing changed writes nothing', async () => {
    const { result } = render();
    expect(await save(result)).toBe(true);
    expect(putRecord).not.toHaveBeenCalled();
    expect(notify.success).not.toHaveBeenCalled();
  });

  it('keeps a change made during a save that returns to the state before it', async () => {
    let land: (value: { uri: string; cid: string }) => void = () => {};
    vi.mocked(putRecord).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          land = resolve;
        })
    );
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    let pending: Promise<boolean> = Promise.resolve(false);
    act(() => {
      pending = result.current.save();
    });
    await advance(0);
    // The owner changes their mind while the save is on its way.
    act(() => result.current.update((c) => ({ ...c, accent: 'violet' })));
    await act(async () => {
      land({
        uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
        cid: OTHER,
      });
      await pending;
    });
    expect(result.current.saved.accent).toBe('teal');
    expect(result.current.config.accent).toBe('violet');
    expect(result.current.dirty).toBe(true);
    expect(result.current.changes).toBe(1);
    expect(await save(result)).toBe(true);
    expect(saved()[1]?.fields).toMatchObject({ accent: 'violet' });
    expect(vi.mocked(putRecord).mock.calls[1]?.[4]).toEqual({
      swapRecord: OTHER,
    });
  });

  it('save resolves false and keeps the draft when the write fails', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    expect(await save(result)).toBe(false);
    expect(result.current.error).toBe(true);
    expect(result.current.saving).toBe(false);
    expect(result.current.config.accent).toBe('teal');
    expect(result.current.dirty).toBe(true);
    expect(notify.error).toHaveBeenCalledWith(
      'Failed to save. Please try again.',
      {
        id: 'lanyard-settings-save',
        action: { label: 'Retry', onClick: expect.any(Function) },
      }
    );
    expect(captureError).toHaveBeenCalledWith(new Error('PDS down'), {
      source: 'lanyard-settings',
    });

    expect(await save(result)).toBe(true);
    expect(saved()[1]?.fields).toMatchObject({ accent: 'teal' });
    expect(result.current.error).toBe(false);
    expect(result.current.dirty).toBe(false);
    expect(notify.dismiss).toHaveBeenCalledWith('lanyard-settings-save');
  });

  it('retries from the toast’s Retry action', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'ember' })));
    await save(result);
    const options = vi.mocked(notify.error).mock.calls[0]?.[1];
    act(() => options?.action?.onClick());
    await advance(0);
    expect(putRecord).toHaveBeenCalledTimes(2);
    expect(result.current.dirty).toBe(false);
  });

  it('discard returns to the last save', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'rose' })));
    act(() => result.current.update((c) => ({ ...c, hidden: ['k1'] })));
    act(() => result.current.discard());
    expect(result.current.config).toEqual(result.current.saved);
    expect(result.current.config.accent).toBe('violet');
    expect(result.current.dirty).toBe(false);
    // The preview reads the same cache: it shows the stored settings again.
    expect(
      client.getQueryData<{ value: { accent: string } }>(key())?.value.accent
    ).toBe('violet');
    await advance(5000);
    expect(putRecord).not.toHaveBeenCalled();
  });

  it('replaces only the version of the settings it read', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await save(result);
    expect(vi.mocked(putRecord).mock.calls[0]?.[4]).toEqual({
      swapRecord: CID,
    });
  });

  it('creates the record only if none was saved meanwhile', async () => {
    client.setQueryData(key(), null);
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await save(result);
    expect(vi.mocked(putRecord).mock.calls[0]?.[4]).toEqual({
      swapRecord: null,
    });
  });

  it('swaps against the version it saved, after leaving and coming back', async () => {
    vi.mocked(putRecord).mockResolvedValueOnce({
      uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
      cid: OTHER,
    });
    const first = render();
    act(() => first.result.current.update((c) => ({ ...c, accent: 'teal' })));
    await save(first.result);
    first.unmount();

    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, showJob: false })));
    await save(result);
    expect(vi.mocked(putRecord).mock.calls[1]?.[4]).toEqual({
      swapRecord: OTHER,
    });
  });

  it('builds on what another device saved meanwhile, then saves again', async () => {
    const elsewhere = {
      ...STORED,
      connect: { follow: false },
      updatedAt: '2026-11-10T11:59:00.000Z',
    };
    vi.mocked(putRecord).mockRejectedValueOnce(
      new RecordChangedError('InvalidSwap')
    );
    vi.mocked(fetchLanyardConfig).mockResolvedValue({
      ok: true,
      value: { value: elsewhere, cid: OTHER, valid: true },
    });
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    expect(await save(result)).toBe(true);
    expect(putRecord).toHaveBeenCalledTimes(2);
    expect(saved()[1]?.fields).toMatchObject({
      accent: 'teal',
      connect: { follow: false },
    });
    expect(vi.mocked(putRecord).mock.calls[1]?.[4]).toEqual({
      swapRecord: OTHER,
    });
    expect(result.current.error).toBe(false);
    expect(result.current.dirty).toBe(false);
    expect(notify.error).not.toHaveBeenCalled();
    expect(notify.success).toHaveBeenCalledWith('Lanyard updated');
  });

  it('keeps another device’s changes to settings this one didn’t touch', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(
      new RecordChangedError('InvalidSwap')
    );
    vi.mocked(fetchLanyardConfig).mockResolvedValue({
      ok: true,
      value: { value: { ...STORED, accent: 'teal' }, cid: OTHER, valid: true },
    });
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, hidden: ['k1'] })));
    await save(result);
    expect(saved()[1]?.fields).toMatchObject({
      accent: 'teal',
      hidden: ['k1'],
    });
  });

  it('offers Reset when another device saved settings it can’t read', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(
      new RecordChangedError('InvalidSwap')
    );
    vi.mocked(fetchLanyardConfig).mockResolvedValue({
      ok: true,
      value: { value: { ...STORED, accent: 42 }, cid: OTHER, valid: false },
    });
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await save(result);
    expect(putRecord).toHaveBeenCalledTimes(1);
    expect(result.current.invalid).toBe(true);
    expect(result.current.error).toBe(false);
    expect(result.current.dirty).toBe(false);
    expect(notify.error).not.toHaveBeenCalled();
  });

  it('gives up with Retry if the settings change again meanwhile', async () => {
    vi.mocked(putRecord).mockRejectedValue(
      new RecordChangedError('InvalidSwap')
    );
    vi.mocked(fetchLanyardConfig).mockResolvedValue({
      ok: true,
      value: { value: STORED, cid: OTHER, valid: true },
    });
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    expect(await save(result)).toBe(false);
    expect(putRecord).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBe(true);
    expect(result.current.dirty).toBe(true);
    expect(notify.error).toHaveBeenCalledWith(
      'Failed to save. Please try again.',
      expect.objectContaining({ id: 'lanyard-settings-save' })
    );
  });

  it('swaps against the version a change was built on, after a refetch', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    vi.mocked(fetchLanyardConfig).mockResolvedValue({
      ok: true,
      value: {
        value: { ...STORED, connect: { vouch: false } },
        cid: OTHER,
        valid: true,
      },
    });
    await refetch();
    await save(result);
    // Built on CID, so the save conflicts and is merged over OTHER.
    expect(vi.mocked(putRecord).mock.calls[0]?.[4]).toEqual({
      swapRecord: CID,
    });
  });

  it('never saves over a stored record it cannot read, until reset', async () => {
    const invalid = {
      ...STORED,
      events: [{ event: 'at://did:plc:x/community.lexicon.calendar.event/1' }],
      blocks: [{ type: 'links', visible: true, limit: 0 }],
    };
    client.setQueryData(key(), { value: invalid, cid: CID, valid: false });
    const { result } = render();
    expect(result.current.ready).toBe(false);
    expect(result.current.invalid).toBe(true);
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await save(result);
    expect(putRecord).not.toHaveBeenCalled();

    act(() => result.current.resetInvalid());
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
    expect(result.current.dirty).toBe(false);
  });

  it('puts an unreadable record back, with Retry, when resetting it fails', async () => {
    client.setQueryData(key(), {
      value: { ...STORED, accent: 42 },
      cid: CID,
      valid: false,
    });
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.resetInvalid());
    await advance(0);
    expect(result.current.invalid).toBe(true);
    expect(result.current.error).toBe(true);
    expect(result.current.dirty).toBe(false);
    const options = vi.mocked(notify.error).mock.calls[0]?.[1];
    act(() => options?.action?.onClick());
    await advance(0);
    expect(putRecord).toHaveBeenCalledTimes(2);
    expect(result.current.invalid).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it('keeps the draft when the settings are fetched again', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    vi.mocked(fetchLanyardConfig).mockResolvedValue({
      ok: true,
      value: { value: { ...STORED, showJob: false }, cid: OTHER, valid: true },
    });
    await refetch();
    expect(fetchLanyardConfig).toHaveBeenCalled();
    expect(result.current.config.accent).toBe('teal');
    expect(result.current.dirty).toBe(true);
    // The last save is now what the server returned.
    expect(result.current.saved.showJob).toBe(false);
    await save(result);
    expect(saved()[0]?.fields).toMatchObject({ accent: 'teal' });
  });

  it('stays ready, keeping the draft, when a refetch of the settings fails', async () => {
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    vi.mocked(fetchLanyardConfig).mockRejectedValue(new Error('PDS down'));
    let refetched: Promise<unknown> = Promise.resolve();
    act(() => {
      refetched = client
        .refetchQueries({ queryKey: key() })
        .catch(() => undefined);
    });
    // Let the source's own retries run out.
    await advance(120_000);
    await act(async () => {
      await refetched;
    });
    expect(client.getQueryState(key())?.status).toBe('error');
    expect(result.current.ready).toBe(true);
    expect(result.current.config.accent).toBe('teal');
    act(() => result.current.update((c) => ({ ...c, showJob: false })));
    expect(result.current.config.showJob).toBe(false);
  });

  it('keeps a change whose save failed when the settings are fetched again', async () => {
    vi.mocked(putRecord).mockRejectedValueOnce(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    await save(result);
    expect(result.current.error).toBe(true);
    await refetch();
    expect(result.current.config.accent).toBe('teal');
    await save(result);
    expect(saved()[1]?.fields).toMatchObject({ accent: 'teal' });
  });

  it('writes nothing when the page hides, backgrounds or closes', async () => {
    const { result, unmount } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'plum' })));
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    unmount();
    await advance(5000);
    expect(putRecord).not.toHaveBeenCalled();
  });

  it('puts back the saved settings for everyone when it closes with a draft', () => {
    const { result, unmount } = render();
    act(() => result.current.update((c) => ({ ...c, accent: 'teal' })));
    unmount();
    const stored = client.getQueryData<{ value: { accent: string } }>(key());
    expect(stored?.value.accent).toBe('violet');
  });
});
