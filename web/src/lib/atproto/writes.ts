import type {} from '@atcute/atproto';
import type { Client } from '@atcute/client';
import type { Did } from '@atcute/lexicons';
import { now as tidNow } from '@atcute/tid';

import { AUTH_FULL_COLLECTIONS, USERINPUT_NSID } from '@/lib/lexicons/nsids';
import { validateRecord } from '@/lib/lexicons/validate';

import {
  canUploadBlob,
  canWrite,
  parseGrantedScope,
  type RepoAction,
} from './permissions';

/**
 * The only collections Lanyards writes: its own records, Bluesky follows
 * and feedback to our UserInput board (#134). A broad (transition:generic) session could write anything, so
 * this is checked at run time as well as by the types.
 */
export const WRITABLE_COLLECTIONS = [
  ...AUTH_FULL_COLLECTIONS,
  'app.bsky.graph.follow',
  USERINPUT_NSID.discussion,
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

  /**
   * @param applied How many of a batch's writes landed before it failed:
   * those must not be sent again.
   */
  constructor(
    message?: string,
    readonly applied = 0,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
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

/**
 * The PDS refused a write for a scope the session lacks, though the app's
 * own check passed: the granted permission set is older than the app's
 * (#132). The owner is asked to sign in again.
 */
export class ScopeRefusedError extends WriteFailedError {
  override name = 'ScopeRefusedError';
}

function refused(status: number, error: string, applied = 0): void {
  if (status === 403 || /scope/i.test(error)) {
    throw new ScopeRefusedError(error, applied);
  }
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
  if (!response.ok) {
    refused(response.status, response.data.error);
    throw new WriteFailedError(response.data.error);
  }
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
    refused(response.status, response.data.error);
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
  if (!response.ok) {
    refused(response.status, response.data.error);
    throw new WriteFailedError(response.data.error);
  }
}

/** At most this many writes go in one applyWrites call; each is atomic. */
const BATCH_SIZE = 10;

/** One change in a batch: create, update or delete a record. */
export type WriteOp =
  | {
      type: 'create';
      collection: WritableNsid;
      /** A new TID when left out. */
      rkey?: string;
      fields: Record<string, unknown>;
    }
  | {
      type: 'update';
      collection: WritableNsid;
      rkey: string;
      fields: Record<string, unknown>;
    }
  | { type: 'delete'; collection: WritableNsid; rkey: string };

const WRITE_TYPE = {
  create: 'com.atproto.repo.applyWrites#create',
  update: 'com.atproto.repo.applyWrites#update',
  delete: 'com.atproto.repo.applyWrites#delete',
} as const;

/**
 * Applies several writes to the signed-in person's repository. Every one
 * is checked (permission and lexicon) before anything is sent; then they go
 * in com.atproto.repo.applyWrites calls of at most 10, each all-or-nothing.
 */
export function applyWrites(
  session: WriteSession,
  ops: WriteOp[]
): Promise<void> {
  return applyWriteGroups(
    session,
    ops.map((op) => [op])
  );
}

/**
 * Applies groups of writes, a group never split across calls: what must
 * land together (moving a record is a create and a delete) lands together
 * or not at all. A failure says how many writes earlier calls landed, so a
 * retry sends only the rest.
 */
export async function applyWriteGroups(
  session: WriteSession,
  groups: WriteOp[][]
): Promise<void> {
  const prepared = groups.map((group) =>
    group.map((op) => {
      allow(session, op.collection, op.type);
      return op.type === 'delete'
        ? {
            $type: WRITE_TYPE.delete,
            collection: op.collection,
            rkey: op.rkey,
          }
        : {
            $type: WRITE_TYPE[op.type],
            collection: op.collection,
            rkey: op.rkey ?? tidNow(),
            value: typed(op.collection, op.fields),
          };
    })
  );
  const calls: (typeof prepared)[number][] = [];
  for (const group of prepared) {
    const call = calls.at(-1);
    if (call && call.length + group.length <= BATCH_SIZE) call.push(...group);
    else calls.push([...group]);
  }
  let applied = 0;
  for (const writes of calls) {
    let response;
    try {
      response = await session.rpc.post('com.atproto.repo.applyWrites', {
        input: { repo: session.did, writes: writes as never },
      });
    } catch (cause) {
      throw new WriteFailedError('Network error', applied, { cause });
    }
    if (!response.ok) {
      refused(response.status, response.data.error, applied);
      throw new WriteFailedError(response.data.error, applied);
    }
    applied += writes.length;
  }
}

/** A blob as a record refers to it. */
export type BlobRef = {
  $type: 'blob';
  ref: { $link: string };
  mimeType: string;
  size: number;
};

/**
 * Uploads `blob` to the signed-in person's repository, for a record to
 * refer to: a screenshot on their feedback (#134).
 */
export async function uploadBlob(
  session: WriteSession,
  blob: Blob
): Promise<BlobRef> {
  if (!canUploadBlob(parseGrantedScope(session.scope), blob.type)) {
    throw new MissingPermissionError(`No permission to upload ${blob.type}`);
  }
  const response = await session.rpc.post('com.atproto.repo.uploadBlob', {
    input: blob,
    headers: { 'content-type': blob.type },
  });
  if (!response.ok) {
    refused(response.status, response.data.error);
    throw new WriteFailedError(response.data.error);
  }
  return response.data.blob as unknown as BlobRef;
}
