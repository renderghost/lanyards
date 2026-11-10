import { getPdsEndpoint } from '@atcute/identity';
import {
  DocumentNotFoundError,
  ImproperDidError,
  UnsupportedDidMethodError,
} from '@atcute/identity-resolver';
import type { Did } from '@atcute/lexicons';

import { requestJson } from '@/lib/sources/request';
import {
  err,
  ok,
  type Result,
  type SourceErrorKind,
  type SourceName,
} from '@/lib/sources/result';

import { REQUEST_TIMEOUT_MS } from './endpoints';
import { didDocumentResolver } from './identity';

export type RawRecord = { uri: string; cid: string; value: unknown };

const PDS_TTL_MS = 60 * 60 * 1000;
const PAGE_SIZE = 100;

const pdsCache = new Map<string, { pds: string; expires: number }>();

type Lookup = { ok: true; pds: string } | { ok: false; kind: SourceErrorKind };

/** Lookups in progress, so parallel callers share one DID resolution. */
const inFlight = new Map<string, Promise<Lookup>>();

/** Resolves the DID document under its own timeout. Never rejects. */
async function lookUp(did: Did): Promise<Lookup> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const doc = await didDocumentResolver.resolve(did as never, {
      signal: controller.signal,
    });
    const pds = getPdsEndpoint(doc);
    if (!pds) return { ok: false, kind: 'notFound' };
    pdsCache.set(did, { pds, expires: Date.now() + PDS_TTL_MS });
    return { ok: true, pds };
  } catch (error) {
    const missing =
      error instanceof DocumentNotFoundError ||
      error instanceof ImproperDidError ||
      error instanceof UnsupportedDidMethodError;
    if (missing) return { ok: false, kind: 'notFound' };
    return {
      ok: false,
      kind: controller.signal.aborted ? 'timeout' : 'network',
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Waits for `lookup`, or settles with undefined once `signal` aborts. */
function unlessAborted(
  lookup: Promise<Lookup>,
  signal?: AbortSignal
): Promise<Lookup | undefined> {
  if (!signal) return lookup;
  if (signal.aborted) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const abort = () => resolve(undefined);
    signal.addEventListener('abort', abort, { once: true });
    void lookup.then((outcome) => {
      signal.removeEventListener('abort', abort);
      resolve(outcome);
    });
  });
}

/**
 * Finds the PDS that hosts `did`, remembering it for an hour. Parallel
 * callers share one lookup; a caller that aborts gives up on its own, and
 * a failed lookup isn't remembered.
 */
export async function resolvePds(
  did: Did,
  options: { source: SourceName; signal?: AbortSignal }
): Promise<Result<string>> {
  const cached = pdsCache.get(did);
  if (cached && cached.expires > Date.now()) return ok(cached.pds);

  let lookup = inFlight.get(did);
  if (!lookup) {
    lookup = lookUp(did).finally(() => inFlight.delete(did));
    inFlight.set(did, lookup);
  }
  const outcome = await unlessAborted(lookup, options.signal);
  if (!outcome) return err(options.source, 'timeout');
  return outcome.ok ? ok(outcome.pds) : err(options.source, outcome.kind);
}

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as RawRecord).uri === 'string' &&
  typeof (value as RawRecord).cid === 'string';

/** Lists up to `limit` records of one collection from a public repo. */
export async function listRecords(
  source: SourceName,
  did: Did,
  collection: string,
  options: { limit: number; signal?: AbortSignal }
): Promise<Result<RawRecord[]>> {
  const pds = await resolvePds(did, { source, signal: options.signal });
  if (!pds.ok) return pds;

  const records: RawRecord[] = [];
  let cursor: string | undefined;
  while (records.length < options.limit) {
    const url = new URL('/xrpc/com.atproto.repo.listRecords', pds.value);
    url.searchParams.set('repo', did);
    url.searchParams.set('collection', collection);
    url.searchParams.set(
      'limit',
      String(Math.min(PAGE_SIZE, options.limit - records.length))
    );
    if (cursor) url.searchParams.set('cursor', cursor);

    const page = await requestJson(source, url.href, options.signal);
    if (!page.ok) return page;
    const body = page.value as { records?: unknown; cursor?: unknown };
    if (!Array.isArray(body.records)) return err(source, 'invalid');
    records.push(...body.records.filter(isRecord));
    cursor = typeof body.cursor === 'string' ? body.cursor : undefined;
    if (!cursor || body.records.length === 0) break;
  }
  return ok(records.slice(0, options.limit));
}

/** Reads one record; a record that does not exist is `null`, not an error. */
export async function getRecord(
  source: SourceName,
  did: Did,
  collection: string,
  rkey: string,
  signal?: AbortSignal
): Promise<Result<RawRecord | null>> {
  const pds = await resolvePds(did, { source, signal });
  if (!pds.ok) return pds;

  const url = new URL('/xrpc/com.atproto.repo.getRecord', pds.value);
  url.searchParams.set('repo', did);
  url.searchParams.set('collection', collection);
  url.searchParams.set('rkey', rkey);

  const response = await requestJson(source, url.href, signal);
  if (!response.ok) {
    return response.error.code === 'RecordNotFound' ? ok(null) : response;
  }
  return isRecord(response.value) ? ok(response.value) : err(source, 'invalid');
}
