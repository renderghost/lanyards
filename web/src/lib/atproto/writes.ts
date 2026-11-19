import type {} from '@atcute/atproto';
import type { Client } from '@atcute/client';
import type { Did } from '@atcute/lexicons';
import { now as tidNow } from '@atcute/tid';

import { AUTH_FULL_COLLECTIONS } from '@/lib/lexicons/nsids';
import { validateRecord } from '@/lib/lexicons/validate';

import { canWrite, parseGrantedScope, type RepoAction } from './permissions';

/**
 * The only collections Lanyards writes: its own records and Bluesky
 * follows. A broad (transition:generic) session could write anything, so
 * this is checked at run time as well as by the types.
 */
export const WRITABLE_COLLECTIONS = [
  ...AUTH_FULL_COLLECTIONS,
  'app.bsky.graph.follow',
] as const;

export type WritableNsid = (typeof WRITABLE_COLLECTIONS)[number];

const writable: ReadonlySet<string> = new Set(WRITABLE_COLLECTIONS);

/** What a write needs from the signed-in session. */
export type WriteSession = { did: Did; scope: string; rpc: Client };

/** The session was not granted permission for this write. */
export class MissingPermissionError extends Error {
  override name = 'MissingPermissionError';
}

/** The record does not match its lexicon, so it is never sent. */
export class InvalidRecordError extends Error {
  override name = 'InvalidRecordError';
}

/** The PDS refused or failed the write. */
export class WriteFailedError extends Error {
  override name = 'WriteFailedError';
}

/**
 * The record changed since it was read (another device saved it), so a
 * write that named the version it replaces was refused.
 */
export class RecordChangedError extends WriteFailedError {
  override name = 'RecordChangedError';
}

function allow(
  session: WriteSession,
  collection: WritableNsid,
  action: RepoAction
): void {
  if (!writable.has(collection)) {
    throw new MissingPermissionError(`Lanyards doesn't write ${collection}`);
  }
  if (!canWrite(parseGrantedScope(session.scope), collection, action)) {
    throw new MissingPermissionError(
      `No ${action} permission for ${collection}`
    );
  }
}

function typed(
  collection: WritableNsid,
  fields: Record<string, unknown>
): Record<string, unknown> {
  const record = { $type: collection, ...fields };
  const result = validateRecord(collection, record);
  if (!result.ok) throw new InvalidRecordError(result.message);
  return record;
}

export type Reference = { uri: string; cid: string };

/** Adds a record with a new TID key to the signed-in person's repository. */
export async function createRecord(
  session: WriteSession,
  collection: WritableNsid,
  fields: Record<string, unknown>
): Promise<Reference> {
  allow(session, collection, 'create');
  const record = typed(collection, fields);
  const response = await session.rpc.post('com.atproto.repo.createRecord', {
    input: { repo: session.did, collection, rkey: tidNow(), record },
  });
  if (!response.ok) throw new WriteFailedError(response.data.error);
  return { uri: response.data.uri, cid: response.data.cid };
}

/**
 * Creates or replaces the record at `rkey`. With `swapRecord` (the CID of
 * the version that was read, or null when there was none), it replaces
 * only that version, and throws RecordChangedError if the record has
 * changed since.
 */
export async function putRecord(
  session: WriteSession,
  collection: WritableNsid,
  rkey: string,
  fields: Record<string, unknown>,
  options: { swapRecord?: string | null } = {}
): Promise<Reference> {
  allow(session, collection, 'update');
  const record = typed(collection, fields);
  const response = await session.rpc.post('com.atproto.repo.putRecord', {
    input: {
      repo: session.did,
      collection,
      rkey,
      record,
      ...(options.swapRecord !== undefined
        ? { swapRecord: options.swapRecord }
        : {}),
    },
  });
  if (!response.ok) {
    if (response.data.error === 'InvalidSwap') {
      throw new RecordChangedError(response.data.error);
    }
    throw new WriteFailedError(response.data.error);
  }
  return { uri: response.data.uri, cid: response.data.cid };
}

/** Removes the record at `rkey`. */
export async function deleteRecord(
  session: WriteSession,
  collection: WritableNsid,
  rkey: string
): Promise<void> {
  allow(session, collection, 'delete');
  const response = await session.rpc.post('com.atproto.repo.deleteRecord', {
    input: { repo: session.did, collection, rkey },
  });
  if (!response.ok) throw new WriteFailedError(response.data.error);
}
