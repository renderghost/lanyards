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

export type LinkFields = { url: string; title?: string };
export type MediaFields = Omit<MediaLink, 'key'>;
export type HonorificValue = 'Dr' | 'Prof' | 'none';

export type UseKeptRecordsDraft = {
  /** The stored records with the draft's changes applied. */
  records: LanyardRecords;
  /** The stored records have been read; until then edits are ignored. */
  ready: boolean;
  dirty: boolean;
  /** How many records the draft creates, edits or deletes. */
  changes: number;
  addLink(fields: LinkFields): void;
  updateLink(key: string, fields: LinkFields): void;
  removeLink(key: string): void;
  addMedia(fields: MediaFields): void;
  updateMedia(key: string, fields: MediaFields): void;
  removeMedia(key: string): void;
  setHonorific(value: HonorificValue): void;
  /** Writes the changes in one batch; clears them on success. */
  save(): Promise<boolean>;
  discard(): void;
};

/** New records' keys until they are saved: `draft:1`, `draft:2`… */
const DRAFT_PREFIX = 'draft:';

const EMPTY: LanyardRecords = { webLinks: [], media: [] };

const MEDIA_COLLECTION = {
  audio: LANYARDS_NSID.audio,
  video: LANYARDS_NSID.video,
} as const;

/** A link record's fields, leaving out empty ones. */
const linkFields = ({ url, title }: LinkFields) => ({
  url,
  ...(title ? { title } : {}),
});

/** A media record's fields (its kind is its collection). */
const mediaFields = ({ kind: _kind, ...fields }: MediaFields) =>
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
  | { op: 'delete'; collection: WritableNsid; rkey: string }
  | { op: 'honorific'; value: HonorificValue };

/** What it takes to turn `stored` into `draft`. */
function diff(stored: LanyardRecords, draft: LanyardRecords): Change[] {
  const changes: Change[] = [];
  const web = LANYARDS_NSID.webLink;
  const storedLinks = new Map(stored.webLinks.map((link) => [link.key, link]));
  const keptLinks = new Set(draft.webLinks.map((link) => link.key));
  for (const link of draft.webLinks) {
    const before = storedLinks.get(link.key);
    if (!before) {
      changes.push({ op: 'create', collection: web, fields: linkFields(link) });
    } else if (!same(linkFields(before), linkFields(link))) {
      changes.push({
        op: 'update',
        collection: web,
        rkey: rkeyOf(link.key),
        fields: linkFields(link),
      });
    }
  }
  for (const link of stored.webLinks) {
    if (!keptLinks.has(link.key)) {
      changes.push({ op: 'delete', collection: web, rkey: rkeyOf(link.key) });
    }
  }

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

  const honorific = draft.honorific ?? 'none';
  if (honorific !== (stored.honorific ?? 'none')) {
    changes.push({ op: 'honorific', value: honorific });
  }
  return changes;
}

/**
 * The owner's kept records (links, podcasts and videos, the honorific) as a
 * draft until Save (#118). Changes show at once: the lanyard reads the same
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
        return {
          exists: Boolean(read.value),
          createdAt:
            typeof value?.createdAt === 'string' ? value.createdAt : now,
        };
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
              const kept = await createdAt(change.collection, change.rkey);
              return {
                type: 'update',
                collection: change.collection,
                rkey: change.rkey,
                fields: { ...change.fields, createdAt: kept.createdAt },
              };
            }
            case 'honorific': {
              const collection = LANYARDS_NSID.honorific;
              const kept = await createdAt(collection, 'self');
              return {
                type: kept.exists ? 'update' : 'create',
                collection,
                rkey: 'self',
                fields: { value: change.value, createdAt: kept.createdAt },
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
    addLink: (fields) =>
      edit((current) => ({
        ...current,
        webLinks: [
          ...current.webLinks,
          { key: nextKey(), ...linkFields(fields) },
        ],
      })),
    updateLink: (linkKey, fields) =>
      edit((current) => ({
        ...current,
        webLinks: current.webLinks.map((link) =>
          link.key === linkKey ? { key: linkKey, ...linkFields(fields) } : link
        ),
      })),
    removeLink: (linkKey) =>
      edit((current) => ({
        ...current,
        webLinks: current.webLinks.filter((link) => link.key !== linkKey),
      })),
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
    setHonorific: (value) =>
      edit((current) => {
        const { honorific: _previous, ...rest } = current;
        return value === 'none' ? rest : { ...rest, honorific: value };
      }),
    save,
    discard: restore,
  };
}
