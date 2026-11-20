import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { listRecords } from '@/lib/atproto/pds';
import { applyWrites } from '@/lib/atproto/writes';
import { queryKeys } from '@/lib/query/keys';
import { ok } from '@/lib/sources/result';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import { ADA } from '@/test/people';
import { signedInSession } from '@/test/person';

import { planMediaMove, useMediaMove } from './useMediaMove';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/lib/atproto/pds', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/pds')>()),
  listRecords: vi.fn(),
}));
vi.mock('@/lib/atproto/writes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/writes')>()),
  applyWrites: vi.fn(),
}));

const OLD = '2025-01-01T09:00:00.000Z';
const AUDIO = 'app.lanyards.link.media.audio';
const VIDEO = 'app.lanyards.link.media.video';
const ITEM = 'app.lanyards.media.item';
const uri = (collection: string, rkey: string) =>
  `at://${ADA.did}/${collection}/${rkey}`;
const TID = /^[2-7a-z]{13}$/;

const podcast = {
  uri: uri(AUDIO, '3mpod'),
  value: {
    $type: AUDIO,
    url: 'https://pod.example/1',
    platform: 'spotify',
    title: 'Episode one',
    publishedDate: '2025-06-01T09:00:00.000Z',
    createdAt: OLD,
  },
};
const video = {
  uri: uri(VIDEO, '3mvid'),
  value: {
    $type: VIDEO,
    url: 'https://video.example/1',
    platform: 'youtube',
    type: 'conference-talk',
    createdAt: OLD,
  },
};

describe('planMediaMove', () => {
  it('moves each legacy record to a media item and rewrites its hidden key', () => {
    const plan = planMediaMove({
      did: ADA.did,
      legacy: [podcast, video],
      items: new Map(),
      hidden: ['https://ada.example/', video.uri],
    });
    expect(plan).toEqual({
      moves: [
        [
          {
            type: 'create',
            collection: ITEM,
            rkey: '3mpod',
            fields: {
              kind: 'audio',
              url: 'https://pod.example/1',
              platform: 'spotify',
              title: 'Episode one',
              publishedAt: '2025-06-01T09:00:00.000Z',
              createdAt: OLD,
            },
          },
          { type: 'delete', collection: AUDIO, rkey: '3mpod' },
        ],
        [
          {
            type: 'create',
            collection: ITEM,
            rkey: '3mvid',
            fields: {
              kind: 'video',
              url: 'https://video.example/1',
              platform: 'youtube',
              type: 'other',
              createdAt: OLD,
            },
          },
          { type: 'delete', collection: VIDEO, rkey: '3mvid' },
        ],
      ],
      hidden: ['https://ada.example/', uri(ITEM, '3mvid')],
    });
  });

  it('gives a moved record a new key when a different item holds its own', () => {
    const plan = planMediaMove({
      did: ADA.did,
      legacy: [podcast],
      items: new Map([['3mpod', 'https://other.example/']]),
      hidden: [podcast.uri],
    });
    const create = plan?.moves[0]?.[0];
    expect(create).toMatchObject({ type: 'create', collection: ITEM });
    expect(create && 'rkey' in create && create.rkey).toMatch(TID);
    expect(create && 'rkey' in create && create.rkey).not.toBe('3mpod');
    expect(plan?.hidden).toEqual([
      uri(ITEM, (create as { rkey: string }).rkey),
    ]);
  });

  it('only deletes a legacy record whose move already created its item', () => {
    const plan = planMediaMove({
      did: ADA.did,
      legacy: [podcast],
      items: new Map([['3mpod', 'https://pod.example/1']]),
      hidden: [],
    });
    expect(plan?.moves).toEqual([
      [{ type: 'delete', collection: AUDIO, rkey: '3mpod' }],
    ]);
  });

  it('rewrites a hidden key left behind by an earlier move', () => {
    const plan = planMediaMove({
      did: ADA.did,
      legacy: [],
      items: new Map([['3mpod', 'https://pod.example/1']]),
      hidden: [podcast.uri],
    });
    expect(plan).toEqual({ moves: [], hidden: [uri(ITEM, '3mpod')] });
  });

  it('has nothing to do without legacy records or stale hidden keys', () => {
    expect(
      planMediaMove({
        did: ADA.did,
        legacy: [],
        items: new Map([['3mpod', 'https://pod.example/1']]),
        hidden: ['https://ada.example/'],
      })
    ).toBeNull();
  });
});

describe('useMediaMove', () => {
  let client: QueryClient;
  const config = {
    $type: 'app.lanyards.actor.lanyard',
    blocks: [{ type: 'media', visible: true }],
    hidden: [podcast.uri],
    createdAt: OLD,
  };

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <AppI18nProvider>{children}</AppI18nProvider>
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData<LanyardRecords>(queryKeys.source('lanyards', ADA.did), {
      media: [],
    });
    client.setQueryData(queryKeys.source('lanyards', ADA.did, 'config'), {
      value: config,
      cid: 'cid',
      valid: true,
    });
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    vi.mocked(applyWrites).mockResolvedValue(undefined);
    vi.mocked(listRecords).mockImplementation(async (_service, _did, nsid) =>
      ok(nsid === AUDIO ? [{ ...podcast, cid: 'cid' }] : [])
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('moves the owner’s legacy media once, with their hidden keys, and says so', async () => {
    const { rerender } = renderHook(
      ({ enabled }) => useMediaMove(ADA.did, enabled),
      { wrapper, initialProps: { enabled: true } }
    );
    await waitFor(() => expect(notify.success).toHaveBeenCalledTimes(1));
    expect(notify.success).toHaveBeenCalledWith(
      'Your podcasts and videos were updated to the new format.'
    );
    expect(vi.mocked(applyWrites).mock.calls.map(([, ops]) => ops)).toEqual([
      [
        expect.objectContaining({ type: 'create', collection: ITEM }),
        { type: 'delete', collection: AUDIO, rkey: '3mpod' },
        {
          type: 'update',
          collection: 'app.lanyards.actor.lanyard',
          rkey: 'self',
          fields: expect.objectContaining({
            hidden: [uri(ITEM, '3mpod')],
            blocks: config.blocks,
            createdAt: OLD,
          }),
        },
      ],
    ]);
    rerender({ enabled: true });
    expect(applyWrites).toHaveBeenCalledTimes(1);
  });

  it('writes nothing when there is nothing to move', async () => {
    vi.mocked(listRecords).mockResolvedValue(ok([]));
    client.setQueryData(queryKeys.source('lanyards', ADA.did, 'config'), {
      value: { ...config, hidden: [] },
      cid: 'cid',
      valid: true,
    });
    renderHook(() => useMediaMove(ADA.did, true), { wrapper });
    await waitFor(() => expect(listRecords).toHaveBeenCalled());
    expect(applyWrites).not.toHaveBeenCalled();
    expect(notify.success).not.toHaveBeenCalled();
  });

  it('waits until it is enabled', () => {
    renderHook(() => useMediaMove(ADA.did, false), { wrapper });
    expect(listRecords).not.toHaveBeenCalled();
  });
});
