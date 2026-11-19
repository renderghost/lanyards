import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { getRecord } from '@/lib/atproto/pds';
import {
  applyWrites,
  putRecord,
  RecordChangedError,
} from '@/lib/atproto/writes';
import { queryKeys } from '@/lib/query/keys';
import {
  fetchLanyardConfig,
  fetchLanyardRecords,
} from '@/lib/sources/lanyards/lanyards';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import { ADA } from '@/test/people';
import { signedInSession } from '@/test/person';

import { useCustomiserDraft } from './useCustomiserDraft';

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
  fetchLanyardRecords: vi.fn(),
}));
vi.mock('@/lib/atproto/pds', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/pds')>()),
  getRecord: vi.fn(),
}));
vi.mock('@/lib/atproto/writes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/writes')>()),
  applyWrites: vi.fn(),
  putRecord: vi.fn(),
}));

const CID = `bafyrei${'a'.repeat(52)}`;
const OTHER = `bafyrei${'b'.repeat(52)}`;
const CONFIG = {
  $type: 'app.lanyards.actor.lanyard',
  accent: 'violet',
  createdAt: '2026-11-01T09:00:00.000Z',
};
const RECORDS: LanyardRecords = { media: [] };

let client: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <AppI18nProvider>{children}</AppI18nProvider>
    </QueryClientProvider>
  );
}

const render = () => renderHook(() => useCustomiserDraft(ADA.did), { wrapper });

type Draft = ReturnType<typeof render>['result'];

/** A link added and the accent changed: both halves dirty. */
function editBoth(result: Draft) {
  act(() =>
    result.current.records.addMedia({
      kind: 'audio',
      url: 'https://pod.example/2',
      platform: 'spotify',
    })
  );
  act(() => result.current.settings.update((c) => ({ ...c, accent: 'teal' })));
}

async function save(result: Draft) {
  await act(async () => {
    await result.current.save();
  });
}

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(queryKeys.source('lanyards', ADA.did, 'config'), {
    value: CONFIG,
    cid: CID,
    valid: true,
  });
  client.setQueryData(queryKeys.source('lanyards', ADA.did), RECORDS);
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  vi.mocked(fetchLanyardConfig).mockResolvedValue({
    ok: true,
    value: { value: CONFIG, cid: CID, valid: true },
  });
  vi.mocked(fetchLanyardRecords).mockResolvedValue({
    ok: true,
    value: RECORDS,
  });
  vi.mocked(getRecord).mockResolvedValue({ ok: true, value: null } as never);
  vi.mocked(applyWrites).mockResolvedValue(undefined);
  vi.mocked(putRecord).mockResolvedValue({
    uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
    cid: CID,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCustomiserDraft', () => {
  it('counts both halves of the draft', () => {
    const { result } = render();
    editBoth(result);
    expect(result.current.dirty).toBe(true);
    expect(result.current.changes).toBe(2);
  });

  it('saves records then settings, with one toast', async () => {
    const { result } = render();
    editBoth(result);
    await save(result);
    expect(applyWrites).toHaveBeenCalledTimes(1);
    expect(putRecord).toHaveBeenCalledTimes(1);
    expect(vi.mocked(applyWrites).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(putRecord).mock.invocationCallOrder[0]!
    );
    expect(notify.success).toHaveBeenCalledTimes(1);
    expect(notify.success).toHaveBeenCalledWith('Lanyard updated');
    expect(result.current.dirty).toBe(false);
  });

  it('when settings conflict twice, records stay saved and only settings remain; Retry doesn’t re-send records', async () => {
    vi.mocked(putRecord).mockRejectedValue(
      new RecordChangedError('InvalidSwap')
    );
    vi.mocked(fetchLanyardConfig).mockResolvedValue({
      ok: true,
      value: { value: CONFIG, cid: OTHER, valid: true },
    });
    const { result } = render();
    editBoth(result);
    await save(result);
    expect(result.current.records.dirty).toBe(false);
    expect(result.current.settings.dirty).toBe(true);
    expect(notify.success).not.toHaveBeenCalled();
    expect(notify.error).toHaveBeenCalledTimes(1);
    expect(notify.error).toHaveBeenCalledWith(
      'Failed to save. Please try again.',
      expect.objectContaining({ id: 'lanyard-settings-save' })
    );

    vi.mocked(putRecord).mockResolvedValue({
      uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
      cid: OTHER,
    });
    const retry = vi.mocked(notify.error).mock.calls[0]?.[1]?.action;
    await act(async () => {
      retry?.onClick();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(applyWrites).toHaveBeenCalledTimes(1);
    expect(result.current.dirty).toBe(false);
  });

  it('a lost permission keeps the whole draft and shows the permission notice', async () => {
    const { result, rerender } = render();
    editBoth(result);
    // The session is replaced by one without write access.
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did, 'atproto'));
    rerender();
    await save(result);
    expect(applyWrites).not.toHaveBeenCalled();
    expect(putRecord).not.toHaveBeenCalled();
    expect(result.current.permissionLost).toBe(true);
    expect(result.current.dirty).toBe(true);
    expect(result.current.changes).toBe(2);
    expect(notify.error).not.toHaveBeenCalled();
  });

  it('discard drops both halves', () => {
    const { result } = render();
    editBoth(result);
    act(() => result.current.discard());
    expect(result.current.dirty).toBe(false);
  });
});
