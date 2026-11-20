import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { track } from '@/lib/analytics/analytics';
import { getRecord } from '@/lib/atproto/pds';
import { applyWriteGroups, WriteFailedError } from '@/lib/atproto/writes';
import { queryKeys } from '@/lib/query/keys';
import { fetchLanyardRecords } from '@/lib/sources/lanyards/lanyards';
import { ok } from '@/lib/sources/result';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import { ADA } from '@/test/people';
import { signedInSession } from '@/test/person';

import { useKeptRecordsDraft } from './useKeptRecordsDraft';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/lib/atproto/pds', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/pds')>()),
  getRecord: vi.fn(),
}));
vi.mock('@/lib/sources/lanyards/lanyards', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/sources/lanyards/lanyards')>();
  return { ...actual, fetchLanyardRecords: vi.fn(actual.fetchLanyardRecords) };
});
vi.mock('@/lib/atproto/writes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/writes')>()),
  applyWriteGroups: vi.fn(),
}));

const NOW = '2026-11-19T12:00:00.000Z';
const OLD = '2026-01-01T09:00:00.000Z';
const AUDIO = `at://${ADA.did}/app.lanyards.media.item/3maud1`;
const LEGACY = `at://${ADA.did}/app.lanyards.link.media.audio/3mleg1`;
/** A record key made from the time: 13 base32-sortable characters. */
const TID = /^[2-7a-z]{13}$/;
const STORED: LanyardRecords = {
  media: [
    {
      key: AUDIO,
      kind: 'audio',
      url: 'https://pod.example/1',
      platform: 'spotify',
      title: 'Episode one',
    },
  ],
};
/** A podcast still in the legacy collection (#132). */
const LEGACY_ITEM = {
  key: LEGACY,
  kind: 'audio' as const,
  url: 'https://pod.example/old',
  platform: 'spotify',
  title: 'Old episode',
  legacy: true as const,
};

let client: QueryClient;
const key = () => queryKeys.source('lanyards', ADA.did);

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <AppI18nProvider>{children}</AppI18nProvider>
    </QueryClientProvider>
  );
}

const render = () =>
  renderHook(() => useKeptRecordsDraft(ADA.did), { wrapper });

type Draft = ReturnType<typeof render>['result'];

async function save(result: Draft) {
  let outcome = false;
  await act(async () => {
    outcome = await result.current.save();
  });
  return outcome;
}

/** The writes each save sent, groups flattened. */
const ops = () =>
  vi.mocked(applyWriteGroups).mock.calls.map(([, groups]) => groups.flat());

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(NOW));
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(key(), STORED);
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  vi.mocked(applyWriteGroups).mockResolvedValue(undefined);
  vi.mocked(getRecord).mockResolvedValue({
    ok: true,
    value: { value: { createdAt: OLD }, cid: 'cid' },
  } as never);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('useKeptRecordsDraft', () => {
  const EPISODE = {
    kind: 'audio' as const,
    url: 'https://pod.example/2',
    platform: 'spotify',
  };

  it('an added episode shows at once with a draft key and isn’t written until save', () => {
    const { result } = render();
    act(() => result.current.addMedia(EPISODE));
    const added = result.current.records.media[1]!;
    expect(result.current.records.media).toEqual([
      STORED.media[0],
      { key: added.key, ...EPISODE },
    ]);
    // The lanyard (reading the same cache) shows it too.
    expect(
      client.getQueryData<LanyardRecords>(key())?.media.map((m) => m.key)
    ).toEqual([AUDIO, added.key]);
    expect(result.current.dirty).toBe(true);
    expect(result.current.changes).toBe(1);
    expect(applyWriteGroups).not.toHaveBeenCalled();
  });

  it('holds only podcasts and videos', () => {
    const { result } = render();
    expect(Object.keys(result.current.records)).toEqual(['media']);
    expect(result.current).not.toHaveProperty('addLink');
    expect(result.current).not.toHaveProperty('setHonorific');
  });

  it('editing a stored episode keeps its createdAt', async () => {
    const { result } = render();
    act(() =>
      result.current.updateMedia(AUDIO, {
        kind: 'audio',
        url: 'https://pod.example/1',
        platform: 'spotify',
        title: 'Episode 1',
      })
    );
    expect(await save(result)).toBe(true);
    expect(ops()).toEqual([
      [
        {
          type: 'update',
          collection: 'app.lanyards.media.item',
          rkey: '3maud1',
          fields: {
            url: 'https://pod.example/1',
            kind: 'audio',
            platform: 'spotify',
            title: 'Episode 1',
            createdAt: OLD,
          },
        },
      ],
    ]);
  });

  it('a new entry gets its real key at once, and is created at it', async () => {
    const { result } = render();
    act(() => result.current.addMedia(EPISODE));
    const added = result.current.records.media[1]!;
    expect(added.key).toMatch(
      new RegExp(`^at://${ADA.did}/app\\.lanyards\\.media\\.item/[2-7a-z]{13}$`)
    );
    await save(result);
    expect(ops()[0]).toEqual([
      expect.objectContaining({
        type: 'create',
        rkey: added.key.split('/').pop(),
      }),
    ]);
  });

  it('an edit right after Save builds on what was saved', async () => {
    const { result } = render();
    act(() => result.current.addMedia(EPISODE));
    const added = result.current.records.media[1]!.key;
    // The read-back after Save hasn't landed yet.
    vi.mocked(fetchLanyardRecords).mockReturnValue(new Promise(() => {}));
    expect(await save(result)).toBe(true);
    act(() => result.current.removeMedia(AUDIO));
    expect(result.current.records.media.map((item) => item.key)).toEqual([
      added,
    ]);
    vi.mocked(applyWriteGroups).mockClear();
    expect(await save(result)).toBe(true);
    expect(ops()).toEqual([
      [
        {
          type: 'delete',
          collection: 'app.lanyards.media.item',
          rkey: '3maud1',
        },
      ],
    ]);
  });

  it('a record added elsewhere survives a refetch and Save', async () => {
    const elsewhere = {
      key: `at://${ADA.did}/app.lanyards.media.item/3mvid9`,
      kind: 'video' as const,
      url: 'https://video.example/9',
      platform: 'youtube',
    };
    const { result } = render();
    act(() => result.current.removeMedia(AUDIO));
    vi.mocked(fetchLanyardRecords).mockResolvedValue(
      ok({ media: [STORED.media[0]!, elsewhere] })
    );
    await act(() => client.refetchQueries({ queryKey: key() }));
    expect(result.current.records.media).toEqual([elsewhere]);
    expect(await save(result)).toBe(true);
    expect(ops()).toEqual([
      [
        {
          type: 'delete',
          collection: 'app.lanyards.media.item',
          rkey: '3maud1',
        },
      ],
    ]);
  });

  it('an edit to a record deleted elsewhere is dropped, not sent', async () => {
    const { result } = render();
    act(() =>
      result.current.updateMedia(AUDIO, { ...STORED.media[0]!, title: 'New' })
    );
    vi.mocked(fetchLanyardRecords).mockResolvedValue(ok({ media: [] }));
    await act(() => client.refetchQueries({ queryKey: key() }));
    expect(result.current.dirty).toBe(false);
    expect(await save(result)).toBe(true);
    expect(applyWriteGroups).not.toHaveBeenCalled();
  });

  it('a failure part-way keeps only what didn’t land; Retry sends the rest', async () => {
    const { result } = render();
    for (let index = 0; index < 11; index += 1) {
      act(() =>
        result.current.addMedia({
          ...EPISODE,
          url: `https://pod.example/${index}`,
        })
      );
    }
    vi.mocked(applyWriteGroups).mockRejectedValueOnce(
      new WriteFailedError('InternalServerError', 10)
    );
    expect(await save(result)).toBe(false);
    expect(result.current.changes).toBe(1);
    // Everything stays on show: ten saved, one still to save.
    expect(result.current.records.media).toHaveLength(12);
    vi.mocked(applyWriteGroups).mockClear();
    expect(await save(result)).toBe(true);
    expect(ops()).toEqual([
      [
        expect.objectContaining({
          type: 'create',
          fields: expect.objectContaining({ url: 'https://pod.example/10' }),
        }),
      ],
    ]);
  });

  it('editing keeps the fields Lanyards doesn’t edit', async () => {
    vi.mocked(getRecord).mockResolvedValue({
      ok: true,
      value: {
        cid: 'cid',
        value: {
          $type: 'app.lanyards.media.item',
          url: 'https://pod.example/1',
          kind: 'audio',
          platform: 'spotify',
          title: 'Episode one',
          description: 'Old notes',
          seriesName: 'The series',
          duration: 1800,
          publishedAt: '2025-06-01T09:00:00.000Z',
          createdAt: OLD,
        },
      },
    } as never);
    const { result } = render();
    act(() =>
      result.current.updateMedia(AUDIO, {
        kind: 'audio',
        url: 'https://pod.example/1',
        platform: 'spotify',
        title: 'Episode 1',
      })
    );
    await save(result);
    expect(ops()[0]).toEqual([
      {
        type: 'update',
        collection: 'app.lanyards.media.item',
        rkey: '3maud1',
        fields: {
          url: 'https://pod.example/1',
          kind: 'audio',
          platform: 'spotify',
          title: 'Episode 1',
          // The form cleared the description: it goes.
          seriesName: 'The series',
          duration: 1800,
          publishedAt: '2025-06-01T09:00:00.000Z',
          createdAt: OLD,
        },
      },
    ]);
  });

  it('changing an item’s kind is one update, not a delete and add', async () => {
    const { result } = render();
    act(() =>
      result.current.updateMedia(AUDIO, {
        kind: 'video',
        url: 'https://pod.example/1',
        platform: 'youtube',
        title: 'Episode one',
      })
    );
    await save(result);
    expect(ops()[0]).toEqual([
      expect.objectContaining({
        type: 'update',
        collection: 'app.lanyards.media.item',
        rkey: '3maud1',
        fields: expect.objectContaining({ kind: 'video', platform: 'youtube' }),
      }),
    ]);
  });

  it('editing a legacy item moves it to a media item, keeping its fields', async () => {
    client.setQueryData(key(), { media: [LEGACY_ITEM] });
    vi.mocked(getRecord).mockResolvedValue({
      ok: true,
      value: {
        cid: 'cid',
        value: {
          $type: 'app.lanyards.link.media.audio',
          url: 'https://pod.example/old',
          platform: 'spotify',
          title: 'Old episode',
          type: 'lecture',
          seriesName: 'The series',
          publishedDate: '2025-06-01T09:00:00.000Z',
          createdAt: OLD,
        },
      },
    } as never);
    const { result } = render();
    act(() =>
      result.current.updateMedia(LEGACY, {
        kind: 'audio',
        url: 'https://pod.example/old',
        platform: 'spotify',
        title: 'Renamed episode',
      })
    );
    await save(result);
    expect(ops()[0]).toEqual([
      {
        type: 'create',
        collection: 'app.lanyards.media.item',
        rkey: '3mleg1',
        fields: {
          url: 'https://pod.example/old',
          kind: 'audio',
          platform: 'spotify',
          title: 'Renamed episode',
          seriesName: 'The series',
          publishedAt: '2025-06-01T09:00:00.000Z',
          createdAt: OLD,
        },
      },
      {
        type: 'delete',
        collection: 'app.lanyards.link.media.audio',
        rkey: '3mleg1',
      },
    ]);
  });

  it('keeps a legacy item’s create and delete in one group', async () => {
    const many = Array.from({ length: 9 }, (_, index) => ({
      key: `at://${ADA.did}/app.lanyards.media.item/3mgone${index}`,
      kind: 'audio' as const,
      url: `https://pod.example/gone/${index}`,
      platform: 'spotify',
    }));
    client.setQueryData(key(), { media: [...many, LEGACY_ITEM] });
    const { result } = render();
    act(() => {
      for (const item of many) result.current.removeMedia(item.key);
    });
    act(() =>
      result.current.updateMedia(LEGACY, {
        kind: 'audio',
        url: 'https://pod.example/old',
        platform: 'spotify',
        title: 'Renamed episode',
      })
    );
    await save(result);
    const groups = vi.mocked(applyWriteGroups).mock.calls[0]![1];
    expect(groups.at(-1)).toEqual([
      expect.objectContaining({ type: 'create', rkey: '3mleg1' }),
      expect.objectContaining({ type: 'delete', rkey: '3mleg1' }),
    ]);
  });

  it('deleting a legacy item deletes it from its legacy collection', async () => {
    client.setQueryData(key(), { media: [LEGACY_ITEM] });
    const { result } = render();
    act(() => result.current.removeMedia(LEGACY));
    await save(result);
    expect(ops()[0]).toEqual([
      {
        type: 'delete',
        collection: 'app.lanyards.link.media.audio',
        rkey: '3mleg1',
      },
    ]);
  });

  it('takes no edits until the stored records are read', () => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(fetchLanyardRecords).mockReturnValue(new Promise(() => {}));
    const { result } = render();
    expect(result.current.ready).toBe(false);
    act(() => result.current.addMedia(EPISODE));
    // A draft built on nothing would delete every stored record on Save.
    expect(result.current.dirty).toBe(false);
    expect(result.current.records.media).toEqual([]);
  });

  it('is ready once the stored records are read', () => {
    const { result } = render();
    expect(result.current.ready).toBe(true);
  });

  it('a removed episode disappears from the draft records', () => {
    const { result } = render();
    act(() => result.current.removeMedia(AUDIO));
    expect(result.current.records.media).toEqual([]);
    expect(result.current.changes).toBe(1);
  });

  it('save sends one batch and clears the draft', async () => {
    const { result } = render();
    act(() => result.current.addMedia(EPISODE));
    act(() => result.current.removeMedia(AUDIO));
    expect(result.current.changes).toBe(2);
    expect(await save(result)).toBe(true);
    expect(applyWriteGroups).toHaveBeenCalledTimes(1);
    expect(ops()[0]).toEqual([
      {
        type: 'delete',
        collection: 'app.lanyards.media.item',
        rkey: '3maud1',
      },
      {
        type: 'create',
        collection: 'app.lanyards.media.item',
        rkey: expect.stringMatching(TID),
        fields: {
          url: 'https://pod.example/2',
          kind: 'audio',
          platform: 'spotify',
          createdAt: NOW,
        },
      },
    ]);
    expect(result.current.dirty).toBe(false);
  });

  it('records a save, by how many records it changed', async () => {
    const { result } = render();
    act(() => result.current.addMedia(EPISODE));
    act(() => result.current.removeMedia(AUDIO));
    await save(result);
    expect(track).toHaveBeenCalledWith('kept_record_saved', { changes: 2 });
  });

  it('a failed save keeps every change', async () => {
    vi.mocked(applyWriteGroups).mockRejectedValue(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.addMedia(EPISODE));
    act(() => result.current.removeMedia(AUDIO));
    expect(await save(result)).toBe(false);
    expect(result.current.dirty).toBe(true);
    expect(result.current.records.media.map((item) => item.kind)).toEqual([
      'audio',
    ]);
  });

  it('discard returns to the stored records, for everyone', () => {
    const { result } = render();
    act(() => result.current.addMedia(EPISODE));
    act(() => result.current.discard());
    expect(result.current.records).toEqual(STORED);
    expect(client.getQueryData(key())).toEqual(STORED);
    expect(result.current.dirty).toBe(false);
  });
});
