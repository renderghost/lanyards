import { REQUEST_TIMEOUT_MS } from '@/lib/atproto/endpoints';

import {
  err,
  ok,
  type Result,
  type SourceErrorKind,
  type SourceName,
} from './result';

function kindForStatus(status: number): SourceErrorKind {
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimited';
  if (status >= 500) return 'server';
  return 'invalid';
}

/**
 * GETs JSON from a source. Never throws: every failure, including a
 * timeout or the caller aborting, becomes an error Result.
 */
export async function requestJson(
  source: SourceName,
  url: string,
  signal?: AbortSignal,
  headers?: Record<string, string>
): Promise<Result<unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', ...headers },
    });
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const code =
        body && typeof body === 'object' && 'error' in body
          ? String((body as { error: unknown }).error)
          : undefined;
      return err(source, kindForStatus(response.status), {
        status: response.status,
        code,
      });
    }
    if (body === undefined) return err(source, 'invalid');
    return ok(body);
  } catch {
    return err(source, controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

type XrpcResponse =
  | { ok: true; data: unknown; status: number }
  | { ok: false; data: { error?: string }; status: number };

/**
 * Runs an atcute client call with the same timeout and error mapping as
 * requestJson, for authenticated reads through the user's PDS.
 */
export async function requestXrpc<T>(
  source: SourceName,
  call: (signal: AbortSignal) => Promise<XrpcResponse>,
  signal?: AbortSignal
): Promise<Result<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await call(controller.signal);
    if (!response.ok) {
      return err(source, kindForStatus(response.status), {
        status: response.status,
        code: response.data.error,
      });
    }
    return ok(response.data as T);
  } catch {
    return err(source, controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
