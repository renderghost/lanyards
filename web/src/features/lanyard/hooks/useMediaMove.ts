import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { now as tidNow } from '@atcute/tid';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError } from '@/lib/analytics/analytics';
import { listRecords } from '@/lib/atproto/pds';
import { applyWrites, type WriteOp } from '@/lib/atproto/writes';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { validRecords } from '@/lib/lexicons/validate';
import { queryKeys } from '@/lib/query/keys';
import type {
  LanyardConfigRecord,
  LanyardRecords,
} from '@/lib/sources/lanyards/lanyards.types';
import {
  collectionOf,
  itemFromLegacy,
  legacyKindOf,
} from '@/lib/sources/lanyards/media';

import { rkeyOf } from './useKeptRecords';

/** A record in a legacy media collection, as listRecords returns it. */
export type LegacyRecord = { uri: string; value: Record<string, unknown> };

export type MediaMovePlan = {
  /** One move per legacy record: its writes must land together. */
  moves: WriteOp[][];
  /** The lanyard's hidden keys, pointing at where the records now live. */
  hidden: string[];
};

/** The PDS takes at most this many writes in one applyWrites call. */
const BATCH = 10;

const LIST_LIMIT = 500;

/**
 * How to move the owner's legacy podcasts and videos to
 * app.lanyards.media.item (#132). `items` maps each media item's rkey to
 * its URL. Null when there is nothing to do.
 */
export function planMediaMove(input: {
  did: Did;
  legacy: readonly LegacyRecord[];
  items: ReadonlyMap<string, string>;
  hidden: readonly string[];
}): MediaMovePlan | null {
  const { did, legacy, items, hidden } = input;
  const itemUri = (rkey: string) =>
    `at://${did}/${LANYARDS_NSID.mediaItem}/${rkey}`;
  const moved = new Map<string, string>();
  const taken = new Set(items.keys());

  const moves = legacy.flatMap(({ uri, value }): WriteOp[][] => {
    const kind = legacyKindOf(uri);
    if (!kind) return [];
    const rkey = rkeyOf(uri);
    const remove: WriteOp = {
      type: 'delete',
      collection: collectionOf(uri),
      rkey,
    };
    // An earlier move created the item but didn't delete this record.
    if (items.get(rkey) === value.url) {
      moved.set(uri, itemUri(rkey));
      return [[remove]];
    }
    const target = taken.has(rkey) ? tidNow() : rkey;
    taken.add(target);
    moved.set(uri, itemUri(target));
    return [
      [
        {
          type: 'create',
          collection: LANYARDS_NSID.mediaItem,
          rkey: target,
          fields: itemFromLegacy(kind, value),
        },
        remove,
      ],
    ];
  });

  // A hidden legacy key keeps pointing at its record wherever it moved,
  // including by an earlier move that couldn't finish.
  const rewritten = hidden.map((key) => {
    const target = moved.get(key);
    if (target) return target;
    return legacyKindOf(key) && items.has(rkeyOf(key))
      ? itemUri(rkeyOf(key))
      : key;
  });
  const hiddenChanged = rewritten.some((key, index) => key !== hidden[index]);

  if (moves.length === 0 && !hiddenChanged) return null;
  return { moves, hidden: rewritten };
}

/** Groups the moves into batches the PDS takes, a move never split. */
function batches(moves: WriteOp[][], last?: WriteOp): WriteOp[][] {
  const groups: WriteOp[][] = [];
  for (const move of moves) {
    const group = groups.at(-1);
    if (group && group.length + move.length <= BATCH) group.push(...move);
    else groups.push([...move]);
  }
  if (last) {
    const group = groups.at(-1);
    if (group && group.length < BATCH) group.push(last);
    else groups.push([last]);
  }
  return groups;
}

/**
 * Moves the owner's legacy podcasts and videos to app.lanyards.media.item
 * once the customiser has read their records and settings (#132). The
 * lanyard reads both collections, so nothing disappears meanwhile; a move
 * that fails is tried again on the next visit.
 */
export function useMediaMove(did: Did, enabled: boolean): void {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const session = useSession();
  const writer = session.status === 'signedIn' ? session.session : null;
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || !writer || ran.current) return;
    ran.current = true;
    const recordsKey = queryKeys.source('lanyards', did);
    const configKey = queryKeys.source('lanyards', did, 'config');

    /** Moves what's left to move; true when it wrote anything. */
    async function move(owner: NonNullable<typeof writer>): Promise<boolean> {
      const lists = await Promise.all(
        [LANYARDS_NSID.legacyAudio, LANYARDS_NSID.legacyVideo].map(
          async (collection) => {
            const listed = await listRecords('lanyards', did, collection, {
              limit: LIST_LIMIT,
            });
            if (!listed.ok) throw listed.error;
            return validRecords<Record<string, unknown>>(
              collection,
              listed.value
            );
          }
        )
      );
      const records = queryClient.getQueryData<LanyardRecords>(recordsKey);
      const config = queryClient.getQueryData<LanyardConfigRecord | null>(
        configKey
      );
      const stored =
        config?.valid && config.value && typeof config.value === 'object'
          ? (config.value as Record<string, unknown>)
          : null;
      const items = new Map(
        (records?.media ?? [])
          .filter((item) => collectionOf(item.key) === LANYARDS_NSID.mediaItem)
          .map((item) => [rkeyOf(item.key), item.url])
      );
      const hidden = Array.isArray(stored?.hidden)
        ? (stored.hidden as string[])
        : [];
      const plan = planMediaMove({ did, legacy: lists.flat(), items, hidden });
      if (!plan) return false;

      const { $type: _type, ...fields } = stored ?? {};
      const hiddenChanged = plan.hidden.some((key, i) => key !== hidden[i]);
      const settings: WriteOp | undefined =
        stored && hiddenChanged
          ? {
              type: 'update',
              collection: LANYARDS_NSID.lanyard,
              rkey: 'self',
              fields: {
                ...fields,
                hidden: plan.hidden,
                updatedAt: new Date().toISOString(),
              },
            }
          : undefined;
      for (const batch of batches(plan.moves, settings)) {
        await applyWrites(owner, batch);
      }
      if (plan.moves.length > 0) {
        notify.success(
          t`Your podcasts and videos were updated to the new format.`
        );
      }
      return true;
    }

    // Read back only what changed: a fresh read of the settings would
    // replace a draft's base for nothing.
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: recordsKey, exact: true });
      void queryClient.invalidateQueries({ queryKey: configKey, exact: true });
    };
    move(writer).then(
      (wrote) => {
        if (wrote) refresh();
      },
      (cause: unknown) => {
        captureError(cause, { source: 'media-move' });
        refresh();
      }
    );
  }, [enabled, writer, did, queryClient, t]);
}
