import type { Did } from '@atcute/lexicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session/useSession';
import { getRecord } from '@/lib/atproto/pds';
import {
  createRecord,
  deleteRecord,
  putRecord,
  type Reference,
  type WritableNsid,
} from '@/lib/atproto/writes';
import { sourceQueryOptions } from '@/lib/person/sourceQuery';
import { queryKeys } from '@/lib/query/keys';
import { fetchLanyardRecords } from '@/lib/sources/lanyards/lanyards';

/** The owner's kept records (honorific, web links, media), as the lanyard reads them. */
export function useKeptRecords(did: Did) {
  return useQuery({
    queryKey: queryKeys.source('lanyards', did),
    ...sourceQueryOptions('lanyards', (signal) =>
      fetchLanyardRecords(did, signal)
    ),
  });
}

/** The last segment of an AT-URI: its record key. */
export const rkeyOf = (uri: string): string => uri.split('/').pop() ?? '';

/**
 * Writes the signed-in owner's kept records, then refreshes them so the
 * preview shows the change. Only the records query is refreshed, never
 * the lanyard settings, whose unsaved changes it would replace.
 */
export function useKeptRecordWriter() {
  const session = useSession();
  const queryClient = useQueryClient();
  const writer = session.status === 'signedIn' ? session.session : null;

  const signedIn = () => {
    if (!writer) throw new Error('Not signed in');
    return writer;
  };
  const refresh = (did: Did) =>
    void queryClient.invalidateQueries({
      queryKey: queryKeys.source('lanyards', did),
      exact: true,
    });

  return {
    did: writer?.did,
    async create(
      collection: WritableNsid,
      fields: Record<string, unknown>
    ): Promise<Reference> {
      const current = signedIn();
      const reference = await createRecord(current, collection, fields);
      refresh(current.did);
      return reference;
    },
    async put(
      collection: WritableNsid,
      rkey: string,
      fields: Record<string, unknown>
    ): Promise<Reference> {
      const current = signedIn();
      const reference = await putRecord(current, collection, rkey, fields);
      refresh(current.did);
      return reference;
    },
    /**
     * Deletes the record at `rkey`, returning what it held so `restore` can
     * put it back exactly, or null when it couldn't be read first.
     */
    async remove(
      collection: WritableNsid,
      rkey: string
    ): Promise<Record<string, unknown> | null> {
      const current = signedIn();
      const stored = await getRecord('lanyards', current.did, collection, rkey);
      await deleteRecord(current, collection, rkey);
      refresh(current.did);
      const value = stored.ok ? stored.value?.value : null;
      return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : null;
    },
    /** Puts back a record `remove` deleted, at the same key. */
    async restore(
      collection: WritableNsid,
      rkey: string,
      value: Record<string, unknown>
    ): Promise<void> {
      const current = signedIn();
      const { $type: _type, ...fields } = value;
      await putRecord(current, collection, rkey, fields);
      refresh(current.did);
    },
  };
}
