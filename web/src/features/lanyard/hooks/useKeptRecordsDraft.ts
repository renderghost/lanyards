import type { Did } from '@atcute/lexicons';
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
  type WritableNsid,
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
  /** Writes the changes in one batch; clears them on success. */
  save(): Promise<boolean>;
  discard(): void;
};

/** New records' keys until they are saved: `draft:1`, `draft:2`… */
const DRAFT_PREFIX = 'draft:';

const EMPTY: LanyardRecords = { media: [] };

const MEDIA_COLLECTION = {
  audio: LANYARDS_NSID.audio,
  video: LANYARDS_NSID.video,
} as const;

/**
 * A media record's fields: its kind is its collection, and its key (the
 * draft's handle on it) is never written.
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

/** One record to write, before its createdAt is settled. */
type Change =
  | { op: 'create'; collection: WritableNsid; fields: Record<string, unknown> }
  | {
      op: 'update';
      collection: WritableNsid;
      rkey: string;
      fields: Record<string, unknown>;
    }
  | { op: 'delete'; collection: WritableNsid; rkey: string };

/** What it takes to turn `stored` into `draft`. */
function diff(stored: LanyardRecords, draft: LanyardRecords): Change[] {
  const changes: Change[] = [];
  const storedMedia = new Map(stored.media.map((item) => [item.key, item]));
  const keptMedia = new Set(draft.media.map((item) => item.key));
  for (const item of draft.media) {
    const before = storedMedia.get(item.key);
    const collection = MEDIA_COLLECTION[item.kind];
    if (before && before.kind !== item.kind) {
      // Audio and video are different collections: move it.
      changes.push({
        op: 'delete',
        collection: MEDIA_COLLECTION[before.kind],
        rkey: rkeyOf(before.key),
      });
    }
    if (!before || before.kind !== item.kind) {
      changes.push({ op: 'create', collection, fields: mediaFields(item) });
    } else if (!same(mediaFields(before), mediaFields(item))) {
      changes.push({
        op: 'update',
        collection,
        rkey: rkeyOf(item.key),
        fields: mediaFields(item),
      });
    }
  }
  for (const item of stored.media) {
    if (!keptMedia.has(item.key)) {
      changes.push({
        op: 'delete',
        collection: MEDIA_COLLECTION[item.kind],
        rkey: rkeyOf(item.key),
      });
    }
  }

  return changes;
}

/**
 * The owner's kept records (podcasts and videos) as a draft until Save
 * (#118). Changes show at once: the lanyard reads the same
 * query. Save writes them in one batch; leaving drops them for everyone.
 */
export function useKeptRecordsDraft(did: Did): UseKeptRecordsDraft {
  const queryClient = useQueryClient();
  const session = useSession();
  const writer = session.status === 'signedIn' ? session.session : null;
  const query = useKeptRecords(did);
  const key = useMemo(() => queryKeys.source('lanyards', did), [did]);

  /** The records as last read from the repository. */
  const stored = useRef<LanyardRecords | undefined>(undefined);
  const draftRef = useRef<LanyardRecords | null>(null);
  const [draft, setDraft] = useState<LanyardRecords | null>(null);
  const [base, setBase] = useState<LanyardRecords | undefined>(undefined);
  const counter = useRef(0);
  const latest = useRef(writer);
  useLayoutEffect(() => {
    latest.current = writer;
    if (stored.current === undefined && query.data) {
      stored.current = query.data;
    }
  });

  const keepDraft = useCallback(
    (value: LanyardRecords | null) => {
      draftRef.current = value;
      setDraft(value);
      if (value) queryClient.setQueryData<LanyardRecords>(key, value);
    },
    [queryClient, key]
  );

  /** Puts the stored records back, dropping the draft. */
  const restore = useCallback(() => {
    keepDraft(null);
    if (stored.current) {
      queryClient.setQueryData<LanyardRecords>(key, stored.current);
    }
  }, [keepDraft, queryClient, key]);

  // A fetch of the records brings the repository's version; keep it as the
  // base, but keep showing the draft on top.
  useEffect(() => {
    const watched = hashKey(key);
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'success') return;
      if ('manual' in event.action && event.action.manual) return;
      if (event.query.queryHash !== watched) return;
      stored.current = event.query.state.data as LanyardRecords;
      setBase(stored.current);
      if (draftRef.current) {
        queryClient.setQueryData<LanyardRecords>(key, draftRef.current);
      }
    });
  }, [queryClient, key]);

  const edit = useCallback(
    (change: (records: LanyardRecords) => LanyardRecords) => {
      const from = stored.current;
      // A draft built before the records are read would delete them all.
      if (!from) return;
      const next = change(draftRef.current ?? from);
      if (diff(from, next).length === 0) {
        restore();
        return;
      }
      setBase(from);
      keepDraft(next);
    },
    [keepDraft, restore]
  );

  const nextKey = () => {
    counter.current += 1;
    return `${DRAFT_PREFIX}${counter.current}`;
  };

  const save = useCallback(async (): Promise<boolean> => {
    const current = draftRef.current;
    if (!current) return true;
    const owner = latest.current;
    if (!owner) return false;
    const changes = diff(stored.current ?? EMPTY, current);
    try {
      const now = new Date().toISOString();
      // Edits keep the stored record's createdAt.
      const createdAt = async (collection: WritableNsid, rkey: string) => {
        const read = await getRecord('lanyards', owner.did, collection, rkey);
        if (!read.ok) throw read.error;
        const value = read.value?.value as { createdAt?: unknown } | undefined;
        return typeof value?.createdAt === 'string' ? value.createdAt : now;
      };
      const ops = await Promise.all(
        changes.map(async (change): Promise<WriteOp> => {
          switch (change.op) {
            case 'create':
              return {
                type: 'create',
                collection: change.collection,
                fields: { ...change.fields, createdAt: now },
              };
            case 'delete':
              return {
                type: 'delete',
                collection: change.collection,
                rkey: change.rkey,
              };
            case 'update': {
              return {
                type: 'update',
                collection: change.collection,
                rkey: change.rkey,
                fields: {
                  ...change.fields,
                  createdAt: await createdAt(change.collection, change.rkey),
                },
              };
            }
          }
        })
      );
      await applyWrites(owner, ops);
      track('kept_record_saved', { changes: ops.length });
      // Saved: the draft goes, and its records stay on show until the
      // repository's version is read back.
      draftRef.current = null;
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: key, exact: true });
      return true;
    } catch (cause) {
      captureError(cause, { source: 'kept-records' });
      return false;
    }
  }, [queryClient, key]);

  // Closing the customiser drops the draft: everyone sees the stored
  // records again.
  useEffect(
    () => () => {
      if (draftRef.current) restore();
    },
    [restore]
  );

  const records = draft ?? query.data ?? EMPTY;
  // Every draft starts with setBase, so base is the stored records here.
  const changes = draft ? diff(base ?? EMPTY, draft).length : 0;

  return {
    records,
    ready: query.data !== undefined,
    dirty: changes > 0,
    changes,
    addMedia: (fields) =>
      edit((current) => ({
        ...current,
        media: [...current.media, { key: nextKey(), ...fields }],
      })),
    updateMedia: (mediaKey, fields) =>
      edit((current) => ({
        ...current,
        media: current.media.map((item) =>
          item.key === mediaKey ? { key: mediaKey, ...fields } : item
        ),
      })),
    removeMedia: (mediaKey) =>
      edit((current) => ({
        ...current,
        media: current.media.filter((item) => item.key !== mediaKey),
      })),
    save,
    discard: restore,
  };
}
