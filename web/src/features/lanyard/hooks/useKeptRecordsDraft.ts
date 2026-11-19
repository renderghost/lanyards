import type { Did } from '@atcute/lexicons';
import { now as tidNow } from '@atcute/tid';
import { hashKey, useQueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { captureError, track } from '@/lib/analytics/analytics';
import { getRecord } from '@/lib/atproto/pds';
import {
  applyWrites,
  WriteFailedError,
  type WriteOp,
} from '@/lib/atproto/writes';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { queryKeys } from '@/lib/query/keys';
import type {
  LanyardRecords,
  MediaLink,
} from '@/lib/sources/lanyards/lanyards.types';

import { rkeyOf, useKeptRecords } from './useKeptRecords';

export type MediaFields = Omit<MediaLink, 'key'>;

export type UseKeptRecordsDraft = {
  /** The stored records with the draft's changes applied. */
  records: LanyardRecords;
  /** The stored records have been read; until then edits are ignored. */
  ready: boolean;
  dirty: boolean;
  /** How many records the draft creates, edits or deletes. */
  changes: number;
  addMedia(fields: MediaFields): void;
  updateMedia(key: string, fields: MediaFields): void;
  removeMedia(key: string): void;
  /** Writes the changes; whatever lands leaves the draft. */
  save(): Promise<boolean>;
  discard(): void;
};

/**
 * What the owner has changed, kept apart from the stored records so that
 * a fresh read (after Save, or from another device) never turns into
 * changes they didn't make (#118 review, C1).
 */
type Pending = {
  /** New entries, already under the key they'll be saved at. */
  added: MediaLink[];
  /** Edits to stored entries, by key. */
  updated: ReadonlyMap<string, MediaFields>;
  /** Stored entries to delete. */
  removed: ReadonlySet<string>;
};

const NONE: Pending = { added: [], updated: new Map(), removed: new Set() };

const MEDIA_COLLECTION = {
  audio: LANYARDS_NSID.audio,
  video: LANYARDS_NSID.video,
} as const;

/** The fields the media form holds; an edit replaces exactly these. */
const FORM_FIELDS = ['url', 'platform', 'title', 'description', 'type'];

/**
 * A media record's fields: its kind is its collection, and its key is
 * where it's stored; neither is written into the record.
 */
const mediaFields = ({
  kind: _kind,
  key: _key,
  ...fields
}: MediaFields & { key?: string }) =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== undefined && value !== ''
    )
  );

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const count = (pending: Pending) =>
  pending.added.length + pending.updated.size + pending.removed.size;

/** The stored records as the owner's changes leave them. */
function apply(stored: LanyardRecords, pending: Pending): LanyardRecords {
  return {
    media: [
      ...stored.media
        .filter((item) => !pending.removed.has(item.key))
        .map((item) => {
          const fields = pending.updated.get(item.key);
          return fields ? { ...fields, key: item.key } : item;
        }),
      ...pending.added,
    ],
  };
}

/**
 * Drops changes that no longer apply: edits and deletes of entries gone
 * from the stored records (deleted elsewhere), and edits that match them.
 */
function prune(stored: LanyardRecords, pending: Pending): Pending {
  const byKey = new Map(stored.media.map((item) => [item.key, item]));
  const updated = new Map(
    [...pending.updated].filter(([key, fields]) => {
      const item = byKey.get(key);
      return item && !same(mediaFields(item), mediaFields(fields));
    })
  );
  const removed = new Set([...pending.removed].filter((key) => byKey.has(key)));
  return { added: pending.added, updated, removed };
}

/** `pending` without the changes in `settled`. */
function without(pending: Pending, settled: Pending): Pending {
  const added = new Set(settled.added.map((item) => item.key));
  return {
    added: pending.added.filter((item) => !added.has(item.key)),
    updated: new Map(
      [...pending.updated].filter(
        ([key, fields]) => !same(settled.updated.get(key), fields)
      )
    ),
    removed: new Set(
      [...pending.removed].filter((key) => !settled.removed.has(key))
    ),
  };
}

/** One write, and the change it settles once it has landed. */
type Write = { op: WriteOp; settles: Pending };

/**
 * The owner's kept records (podcasts and videos) as a draft until Save
 * (#118). Changes show at once: the lanyard reads the same query. Save
 * writes them in atomic batches; leaving drops them for everyone.
 */
export function useKeptRecordsDraft(did: Did): UseKeptRecordsDraft {
  const queryClient = useQueryClient();
  const session = useSession();
  const writer = session.status === 'signedIn' ? session.session : null;
  const query = useKeptRecords(did);
  const key = useMemo(() => queryKeys.source('lanyards', did), [did]);

  /** The records as the repository holds them, as far as we know. */
  const stored = useRef<LanyardRecords | undefined>(undefined);
  const [base, setBase] = useState<LanyardRecords | undefined>(undefined);
  const pendingRef = useRef<Pending>(NONE);
  const [pending, setPendingState] = useState<Pending>(NONE);
  const latest = useRef(writer);
  useLayoutEffect(() => {
    latest.current = writer;
  });
  // The first read is the stored records; later reads arrive through the
  // query cache's events. (The cache then shows the draft on top, so it
  // can't be the base itself.)
  useLayoutEffect(() => {
    if (stored.current !== undefined || !query.data) return;
    stored.current = query.data;
    setBase(query.data);
  }, [query.data]);

  /** Shows the stored records with `next` applied, to everyone reading. */
  const show = useCallback(
    (next: Pending) => {
      pendingRef.current = next;
      setPendingState(next);
      if (stored.current) {
        queryClient.setQueryData<LanyardRecords>(
          key,
          apply(stored.current, next)
        );
      }
    },
    [queryClient, key]
  );

  /** Takes `records` as what the repository holds. */
  const settle = useCallback((records: LanyardRecords) => {
    stored.current = records;
    setBase(records);
  }, []);

  // A fresh read of the records is the repository's version: the owner's
  // changes are re-applied to it, so nothing saved or added elsewhere is
  // undone or deleted.
  useEffect(() => {
    const watched = hashKey(key);
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'success') return;
      if ('manual' in event.action && event.action.manual) return;
      if (event.query.queryHash !== watched) return;
      const fresh = event.query.state.data as LanyardRecords;
      settle(fresh);
      const next = prune(fresh, pendingRef.current);
      if (count(next) > 0 || count(pendingRef.current) > 0) show(next);
    });
  }, [queryClient, key, settle, show]);

  const edit = useCallback(
    (change: (pending: Pending, stored: LanyardRecords) => Pending) => {
      const from = stored.current;
      // A draft built before the records are read could delete them all.
      if (!from) return;
      show(prune(from, change(pendingRef.current, from)));
    },
    [show]
  );

  const save = useCallback(async (): Promise<boolean> => {
    const from = stored.current;
    const owner = latest.current;
    if (!from || !owner) return count(pendingRef.current) === 0;
    const current = prune(from, pendingRef.current);
    if (count(current) === 0) return true;
    const byKey = new Map(from.media.map((item) => [item.key, item]));
    const now = new Date().toISOString();
    /** Folds landed writes into the stored records and out of the draft. */
    const landed = (done: Write[]) => {
      const settled = done.reduce<Pending>(
        (all, { settles }) => ({
          added: [...all.added, ...settles.added],
          updated: new Map([...all.updated, ...settles.updated]),
          removed: new Set([...all.removed, ...settles.removed]),
        }),
        NONE
      );
      settle(apply(from, settled));
      show(without(pendingRef.current, settled));
    };
    let writes: Write[] = [];
    try {
      writes = await Promise.all([
        ...[...current.removed].map(async (removedKey): Promise<Write> => {
          const item = byKey.get(removedKey)!;
          return {
            op: {
              type: 'delete',
              collection: MEDIA_COLLECTION[item.kind],
              rkey: rkeyOf(removedKey),
            },
            settles: { ...NONE, removed: new Set([removedKey]) },
          };
        }),
        ...[...current.updated].map(
          async ([updatedKey, fields]): Promise<Write> => {
            const item = byKey.get(updatedKey)!;
            const collection = MEDIA_COLLECTION[item.kind];
            const rkey = rkeyOf(updatedKey);
            // Keep what the form doesn't hold: the record's own extra
            // fields and when it was created.
            const read = await getRecord(
              'lanyards',
              owner.did,
              collection,
              rkey
            );
            if (!read.ok) throw read.error;
            const {
              $type: _type,
              createdAt,
              ...kept
            } = (read.value?.value ?? {}) as Record<string, unknown>;
            for (const field of FORM_FIELDS) delete kept[field];
            return {
              op: {
                type: 'update',
                collection,
                rkey,
                fields: {
                  ...mediaFields(fields),
                  ...kept,
                  createdAt: typeof createdAt === 'string' ? createdAt : now,
                },
              },
              settles: { ...NONE, updated: new Map([[updatedKey, fields]]) },
            };
          }
        ),
        ...current.added.map(async (item): Promise<Write> => ({
          op: {
            type: 'create',
            collection: MEDIA_COLLECTION[item.kind],
            rkey: rkeyOf(item.key),
            fields: { ...mediaFields(item), createdAt: now },
          },
          settles: { ...NONE, added: [item] },
        })),
      ]);
      await applyWrites(
        owner,
        writes.map((write) => write.op)
      );
      landed(writes);
      track('kept_record_saved', { changes: writes.length });
      // Read the records back; until then, what was written is on show.
      void queryClient.invalidateQueries({ queryKey: key, exact: true });
      return true;
    } catch (cause) {
      // Whatever landed before a failure leaves the draft, so a retry
      // never sends it again.
      if (cause instanceof WriteFailedError && cause.applied > 0) {
        landed(writes.slice(0, cause.applied));
      }
      captureError(cause, { source: 'kept-records' });
      return false;
    }
  }, [queryClient, key, settle, show]);

  /** Puts the stored records back, dropping the draft. */
  const discard = useCallback(() => {
    pendingRef.current = NONE;
    setPendingState(NONE);
    if (stored.current) {
      queryClient.setQueryData<LanyardRecords>(key, stored.current);
    }
  }, [queryClient, key]);

  // Closing the customiser drops the draft: everyone sees the stored
  // records again.
  useEffect(
    () => () => {
      if (count(pendingRef.current) > 0) discard();
    },
    [discard]
  );

  const changes = base ? count(prune(base, pending)) : 0;
  const records =
    base && count(pending) > 0
      ? apply(base, pending)
      : (query.data ?? { media: [] });

  return {
    records,
    ready: query.data !== undefined,
    dirty: changes > 0,
    changes,
    addMedia: (fields) =>
      edit((current) => ({
        ...current,
        added: [
          ...current.added,
          {
            ...fields,
            key: `at://${did}/${MEDIA_COLLECTION[fields.kind]}/${tidNow()}`,
          },
        ],
      })),
    updateMedia: (mediaKey, fields) =>
      edit((current) =>
        current.added.some((item) => item.key === mediaKey)
          ? {
              ...current,
              added: current.added.map((item) =>
                item.key === mediaKey ? { ...fields, key: mediaKey } : item
              ),
            }
          : {
              ...current,
              updated: new Map(current.updated).set(mediaKey, fields),
            }
      ),
    removeMedia: (mediaKey) =>
      edit((current) => {
        if (current.added.some((item) => item.key === mediaKey)) {
          return {
            ...current,
            added: current.added.filter((item) => item.key !== mediaKey),
          };
        }
        const updated = new Map(current.updated);
        updated.delete(mediaKey);
        return {
          ...current,
          updated,
          removed: new Set(current.removed).add(mediaKey),
        };
      }),
    save,
    discard,
  };
}
