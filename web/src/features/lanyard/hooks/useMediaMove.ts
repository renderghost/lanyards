import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { now as tidNow } from '@atcute/tid';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError } from '@/lib/analytics/analytics';
import { listRecords } from '@/lib/atproto/pds';
import {
  applyWriteGroups,
  putRecord,
  RecordChangedError,
  type WriteOp,
  type WriteSession,
} from '@/lib/atproto/writes';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { validateRecord, validRecords } from '@/lib/lexicons/validate';
import { queryKeys } from '@/lib/query/keys';
import { fetchLanyardConfig } from '@/lib/sources/lanyards/lanyards';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import {
  collectionOf,
  itemFromLegacy,
  legacyKindOf,
  movedKeyOf,
} from '@/lib/sources/lanyards/media';

import { rkeyOf } from './useKeptRecords';

/** A record in a legacy media collection, as listRecords returns it. */
export type LegacyRecord = { uri: string; value: Record<string, unknown> };

export type MediaMovePlan = {
  /** One move per legacy record: its writes must land together. */
  moves: WriteOp[][];
  /** Each legacy record's AT-URI, and the media item it becomes. */
  moved: ReadonlyMap<string, string>;
  /** The lanyard's hidden keys, pointing at where the records now live. */
  hidden: string[];
};

/**
 * Hidden keys pointing at where their records now live: a moved legacy
 * record's new key, or, when an earlier move couldn't finish, the media
 * item that holds its rkey.
 */
export function rewriteHidden(
  hidden: readonly string[],
  moved: ReadonlyMap<string, string>,
  itemRkeys: ReadonlySet<string>
): string[] {
  return hidden.map(
    (key) =>
      moved.get(key) ??
      (itemRkeys.has(rkeyOf(key)) ? (movedKeyOf(key) ?? key) : key)
  );
}

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
    const fields = itemFromLegacy(kind, value);
    // A record the new lexicon can't hold stays where it is, still shown:
    // it never blocks the others.
    const { ok } = validateRecord(LANYARDS_NSID.mediaItem, {
      $type: LANYARDS_NSID.mediaItem,
      ...fields,
    });
    if (!ok) return [];
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
          fields,
        },
        remove,
      ],
    ];
  });

  const rewritten = rewriteHidden(hidden, moved, new Set(items.keys()));
  const hiddenChanged = rewritten.some((key, index) => key !== hidden[index]);

  if (moves.length === 0 && !hiddenChanged) return null;
  return { moves, moved, hidden: rewritten };
}

/**
 * Writes `hidden`'s rewrite onto the lanyard record as it is stored, never
 * the customiser's draft: read fresh, replaced only if unchanged since, and
 * tried once more if another device saved in between.
 */
async function rewriteStoredHidden(
  owner: WriteSession,
  did: Did,
  rewrite: (hidden: readonly string[]) => string[]
): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const read = await fetchLanyardConfig(did);
    if (!read.ok) throw read.error;
    const config = read.value;
    // No record, or one this app can't read: nothing to rewrite.
    if (!config?.valid || !config.value || typeof config.value !== 'object') {
      return false;
    }
    const { $type: _type, ...fields } = config.value as Record<string, unknown>;
    const hidden = Array.isArray(fields.hidden)
      ? (fields.hidden as string[])
      : [];
    const next = rewrite(hidden);
    if (next.every((key, index) => key === hidden[index])) return false;
    try {
      await putRecord(
        owner,
        LANYARDS_NSID.lanyard,
        'self',
        { ...fields, hidden: next, updatedAt: new Date().toISOString() },
        { swapRecord: config.cid }
      );
      return true;
    } catch (cause) {
      if (!(cause instanceof RecordChangedError) || attempt > 0) throw cause;
    }
  }
  return false;
}

/** Whether the customiser's read shows anything left to move. */
const needsMove = (
  records: LanyardRecords | undefined,
  hidden: readonly string[]
) =>
  Boolean(records?.media.some((item) => item.legacy)) ||
  hidden.some((key) => legacyKindOf(key) !== undefined);

/**
 * Moves the owner's legacy podcasts and videos to app.lanyards.media.item
 * once the customiser has read their records and settings (#132), while
 * editing waits (`moving`). The lanyard reads both collections and a
 * hidden legacy key still hides its item, so nothing shows or disappears
 * meanwhile; a move that fails is tried again on the next visit.
 */
export function useMediaMove(
  did: Did,
  options: {
    enabled: boolean;
    /** The owner's records and hidden keys, as the customiser read them. */
    records: LanyardRecords | undefined;
    hidden: readonly string[];
  }
): { moving: boolean } {
  const { enabled, records, hidden } = options;
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const session = useSession();
  const writer = session.status === 'signedIn' ? session.session : null;
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const needed = enabled && Boolean(writer) && needsMove(records, hidden);

  useEffect(() => {
    if (!needed || !writer || started.current) return;
    started.current = true;
    const recordsKey = queryKeys.source('lanyards', did);
    const configKey = queryKeys.source('lanyards', did, 'config');

    /** Moves what's left to move; true when it wrote anything. */
    async function move(owner: WriteSession): Promise<boolean> {
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
      const read = queryClient.getQueryData<LanyardRecords>(recordsKey);
      const items = new Map(
        (read?.media ?? [])
          .filter((item) => collectionOf(item.key) === LANYARDS_NSID.mediaItem)
          .map((item) => [rkeyOf(item.key), item.url])
      );
      const plan = planMediaMove({
        did,
        legacy: lists.flat(),
        items,
        hidden: [],
      });
      const moves = plan?.moves ?? [];
      if (moves.length) await applyWriteGroups(owner, moves);
      // The media items that stand now: those read, and those just made.
      const itemRkeys = new Set(items.keys());
      for (const target of plan?.moved.values() ?? []) {
        itemRkeys.add(rkeyOf(target));
      }
      const rewrote = await rewriteStoredHidden(owner, did, (stored) =>
        rewriteHidden(stored, plan?.moved ?? new Map(), itemRkeys)
      );
      if (moves.length) {
        notify.success(
          t`Your podcasts and videos were updated to the new format.`
        );
      }
      return moves.length > 0 || rewrote;
    }

    // Read back what changed before editing resumes, so no edit builds on
    // records that have moved.
    const refresh = () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: recordsKey, exact: true }),
        queryClient.invalidateQueries({ queryKey: configKey, exact: true }),
      ]);
    move(writer)
      .then(
        (wrote) => (wrote ? refresh() : undefined),
        async (cause: unknown) => {
          captureError(cause, { source: 'media-move' });
          await refresh();
        }
      )
      .finally(() => setDone(true));
  }, [needed, writer, did, hidden, queryClient, t]);

  return { moving: needed && !done };
}
