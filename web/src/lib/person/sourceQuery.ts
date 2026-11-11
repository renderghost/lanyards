import type { UseQueryResult } from '@tanstack/react-query';

import { captureError } from '@/lib/analytics/analytics';
import type { Result, SourceName } from '@/lib/sources/result';
import { SourceError } from '@/lib/sources/result';

import type { SourceState } from './personView.types';

const SOURCE_STALE_MS = 5 * 60 * 1000;

/** Not worth retrying or reporting: the person or record simply isn't there. */
const EXPECTED = new Set(['notFound', 'unavailable']);

/**
 * Query options for a source adapter: unwraps its Result (throwing the
 * SourceError so TanStack Query tracks it), reports unexpected failures
 * without identifiers, and retries once only when a retry could help.
 * An adapter that throws instead of returning a Result is reported under
 * its own source, never mistaken for another.
 */
export function sourceQueryOptions<T>(
  source: SourceName,
  fetcher: (signal: AbortSignal) => Promise<Result<T>>
) {
  return {
    staleTime: SOURCE_STALE_MS,
    retry: (failures: number, error: unknown) =>
      failures < 1 &&
      !(error instanceof SourceError && EXPECTED.has(error.kind)),
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<T> => {
      let result: Result<T>;
      try {
        result = await fetcher(signal);
      } catch (cause) {
        // A cancelled query isn't a failure.
        if (signal.aborted) throw cause;
        captureError(cause, { source });
        throw new SourceError(source, 'invalid');
      }
      if (result.ok) return result.value;
      if (!EXPECTED.has(result.error.kind)) {
        captureError(result.error, { source: result.error.source });
      }
      throw result.error;
    },
  };
}

/** A query's state for the composer; undefined while it is disabled. */
export function toSourceState<T>(
  query: UseQueryResult<T, unknown>,
  enabled: boolean
): SourceState<T> | undefined {
  if (!enabled) return undefined;
  if (query.status === 'success') return { status: 'ready', value: query.data };
  if (query.status === 'error') {
    const error =
      query.error instanceof SourceError
        ? query.error
        : new SourceError('bluesky', 'network');
    return { status: 'error', error };
  }
  return { status: 'loading' };
}
