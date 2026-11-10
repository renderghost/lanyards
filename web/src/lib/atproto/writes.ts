import type {} from '@atcute/atproto';
import type { Client } from '@atcute/client';
import type { Did } from '@atcute/lexicons';
import { now as tidNow } from '@atcute/tid';

import { type KnownRecordNsid, validateRecord } from '@/lib/lexicons/validate';

import { canWrite, parseGrantedScope, type RepoAction } from './permissions';

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

function allow(
  session: WriteSession,
  collection: KnownRecordNsid,
  action: RepoAction
): void {
  if (!canWrite(parseGrantedScope(session.scope), collection, action)) {
    throw new MissingPermissionError(
      `No ${action} permission for ${collection}`
    );
  }
}

function typed(
  collection: KnownRecordNsid,
  fields: Record<string, unknown>
): Record<string, unknown> {
  const record = { $type: collection, ...fields };
  const result = validateRecord(collection, record);
  if (!result.ok) throw new InvalidRecordError(result.message);
  return record;
}

type Reference = { uri: string; cid: string };

/** Adds a record with a new TID key to the signed-in person's repository. */
export async function createRecord(
  session: WriteSession,
  collection: KnownRecordNsid,
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

/** Creates or replaces the record at `rkey`. */
export async function putRecord(
  session: WriteSession,
  collection: KnownRecordNsid,
  rkey: string,
  fields: Record<string, unknown>
): Promise<Reference> {
  allow(session, collection, 'update');
  const record = typed(collection, fields);
  const response = await session.rpc.post('com.atproto.repo.putRecord', {
    input: { repo: session.did, collection, rkey, record },
  });
  if (!response.ok) throw new WriteFailedError(response.data.error);
  return { uri: response.data.uri, cid: response.data.cid };
}

/** Removes the record at `rkey`. */
export async function deleteRecord(
  session: WriteSession,
  collection: KnownRecordNsid,
  rkey: string
): Promise<void> {
  allow(session, collection, 'delete');
  const response = await session.rpc.post('com.atproto.repo.deleteRecord', {
    input: { repo: session.did, collection, rkey },
  });
  if (!response.ok) throw new WriteFailedError(response.data.error);
}
