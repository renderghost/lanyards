/** The places Lanyards reads a person's data from. */
export type SourceName =
  | 'bluesky'
  | 'sifa'
  | 'standardSite'
  | 'orcid'
  | 'tangled'
  | 'semble'
  | 'lanyards';

export type SourceErrorKind =
  /** The person or record does not exist there. */
  | 'notFound'
  /** The account exists but is deactivated, suspended or taken down. */
  | 'unavailable'
  | 'network'
  | 'timeout'
  | 'rateLimited'
  | 'server'
  /** The request was refused, or the response could not be understood. */
  | 'invalid';

export class SourceError extends Error {
  override name = 'SourceError';
  readonly source: SourceName;
  readonly kind: SourceErrorKind;
  readonly status?: number;
  /** The XRPC `error` name, when the service returned one. */
  readonly code?: string;

  constructor(
    source: SourceName,
    kind: SourceErrorKind,
    details: { status?: number; code?: string } = {}
  ) {
    super(`${source}: ${kind}`);
    this.source = source;
    this.kind = kind;
    this.status = details.status;
    this.code = details.code;
  }
}

export type Result<T> =
  { ok: true; value: T } | { ok: false; error: SourceError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const err = <T = never>(
  source: SourceName,
  kind: SourceErrorKind,
  details?: { status?: number; code?: string }
): Result<T> => ({ ok: false, error: new SourceError(source, kind, details) });
