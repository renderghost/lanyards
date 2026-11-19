import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { getRecord } from '@/lib/atproto/pds';
import { applyWrites } from '@/lib/atproto/writes';
import { queryKeys } from '@/lib/query/keys';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import { ADA } from '@/test/people';
import { signedInSession } from '@/test/person';

import { useKeptRecordsDraft } from './useKeptRecordsDraft';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/pds', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/pds')>()),
  getRecord: vi.fn(),
}));
vi.mock('@/lib/atproto/writes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/writes')>()),
  applyWrites: vi.fn(),
}));

const NOW = '2026-11-19T12:00:00.000Z';
const OLD = '2026-01-01T09:00:00.000Z';
const WEB = `at://${ADA.did}/app.lanyards.link.web/3mweb1`;
const AUDIO = `at://${ADA.did}/app.lanyards.link.media.audio/3maud1`;
const STORED: LanyardRecords = {
  honorific: 'Dr',
  webLinks: [{ key: WEB, url: 'https://ada.example/', title: 'Site' }],
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

const ops = () => vi.mocked(applyWrites).mock.calls.map(([, batch]) => batch);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(NOW));
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(key(), STORED);
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  vi.mocked(applyWrites).mockResolvedValue(undefined);
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
  it('an added link shows at once with a draft key and isn’t written until save', () => {
    const { result } = render();
    act(() =>
      result.current.addLink({ url: 'https://new.example/', title: 'New' })
    );
    expect(result.current.records.webLinks).toEqual([
      STORED.webLinks[0],
      { key: 'draft:1', url: 'https://new.example/', title: 'New' },
    ]);
    // The lanyard (reading the same cache) shows it too.
    expect(
      client.getQueryData<LanyardRecords>(key())?.webLinks.map((l) => l.key)
    ).toEqual([WEB, 'draft:1']);
    expect(result.current.dirty).toBe(true);
    expect(result.current.changes).toBe(1);
    expect(applyWrites).not.toHaveBeenCalled();
  });

  it('editing a stored link keeps its createdAt', async () => {
    const { result } = render();
    act(() =>
      result.current.updateLink(WEB, {
        url: 'https://ada.example/cv',
        title: 'CV',
      })
    );
    expect(await save(result)).toBe(true);
    expect(ops()).toEqual([
      [
        {
          type: 'update',
          collection: 'app.lanyards.link.web',
          rkey: '3mweb1',
          fields: {
            url: 'https://ada.example/cv',
            title: 'CV',
            createdAt: OLD,
          },
        },
      ],
    ]);
  });

  it('a removed link disappears from the draft records', () => {
    const { result } = render();
    act(() => result.current.removeLink(WEB));
    expect(result.current.records.webLinks).toEqual([]);
    expect(result.current.changes).toBe(1);
  });

  it('save sends one batch and clears the draft', async () => {
    const { result } = render();
    act(() => result.current.addLink({ url: 'https://new.example/' }));
    act(() => result.current.removeMedia(AUDIO));
    act(() => result.current.setHonorific('Prof'));
    expect(result.current.changes).toBe(3);
    expect(await save(result)).toBe(true);
    expect(applyWrites).toHaveBeenCalledTimes(1);
    expect(ops()[0]).toEqual([
      {
        type: 'create',
        collection: 'app.lanyards.link.web',
        fields: { url: 'https://new.example/', createdAt: NOW },
      },
      {
        type: 'delete',
        collection: 'app.lanyards.link.media.audio',
        rkey: '3maud1',
      },
      {
        type: 'update',
        collection: 'app.lanyards.actor.biography.honorific',
        rkey: 'self',
        fields: { value: 'Prof', createdAt: OLD },
      },
    ]);
    expect(result.current.dirty).toBe(false);
  });

  it('creates the honorific when there is none', async () => {
    vi.mocked(getRecord).mockResolvedValue({ ok: true, value: null } as never);
    client.setQueryData(key(), { ...STORED, honorific: undefined });
    const { result } = render();
    act(() => result.current.setHonorific('Dr'));
    await save(result);
    expect(ops()[0]).toEqual([
      {
        type: 'create',
        collection: 'app.lanyards.actor.biography.honorific',
        rkey: 'self',
        fields: { value: 'Dr', createdAt: NOW },
      },
    ]);
  });

  it('a failed save keeps every change', async () => {
    vi.mocked(applyWrites).mockRejectedValue(new Error('PDS down'));
    const { result } = render();
    act(() => result.current.addLink({ url: 'https://new.example/' }));
    act(() => result.current.removeLink(WEB));
    expect(await save(result)).toBe(false);
    expect(result.current.dirty).toBe(true);
    expect(result.current.records.webLinks.map((link) => link.key)).toEqual([
      'draft:1',
    ]);
  });

  it('discard returns to the stored records, for everyone', () => {
    const { result } = render();
    act(() => result.current.addLink({ url: 'https://new.example/' }));
    act(() => result.current.discard());
    expect(result.current.records).toEqual(STORED);
    expect(client.getQueryData(key())).toEqual(STORED);
    expect(result.current.dirty).toBe(false);
  });
});
