import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/test/msw';

import { requestJson } from './request';

const URL_ = 'https://source.test/xrpc/example.get';

const respond = (response: () => Response | Promise<Response>) =>
  server.use(http.get(URL_, response));

afterEach(() => {
  vi.useRealTimers();
});

describe('requestJson', () => {
  it('returns the parsed body of a successful response', async () => {
    respond(() => HttpResponse.json({ ok: 1 }));
    await expect(requestJson('sifa', URL_)).resolves.toEqual({
      ok: true,
      value: { ok: 1 },
    });
  });

  it.each([
    [404, 'notFound'],
    [429, 'rateLimited'],
    [500, 'server'],
    [503, 'server'],
    [400, 'invalid'],
  ])('maps HTTP %i to %s', async (status, kind) => {
    respond(() => HttpResponse.json({ error: 'Nope' }, { status }));
    const result = await requestJson('sifa', URL_);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe(kind);
    expect(result.error.status).toBe(status);
    expect(result.error.source).toBe('sifa');
  });

  it('keeps the XRPC error name so adapters can recognise it', async () => {
    respond(() =>
      HttpResponse.json({ error: 'ProfileNotFound' }, { status: 400 })
    );
    const result = await requestJson('sifa', URL_);
    expect(!result.ok && result.error.code).toBe('ProfileNotFound');
  });

  it('maps a network failure to network', async () => {
    respond(() => HttpResponse.error());
    const result = await requestJson('orcid', URL_);
    expect(!result.ok && result.error.kind).toBe('network');
  });

  it('maps a body that is not JSON to invalid', async () => {
    respond(() => new HttpResponse('<html>oops</html>', { status: 200 }));
    const result = await requestJson('orcid', URL_);
    expect(!result.ok && result.error.kind).toBe('invalid');
  });

  it('gives up after the request timeout', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    respond(() => new Promise<Response>(() => undefined));
    const pending = requestJson('tangled', URL_);
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(!result.ok && result.error.kind).toBe('timeout');
  });

  it('settles as a timeout when the caller aborts', async () => {
    respond(() => new Promise<Response>(() => undefined));
    const controller = new AbortController();
    const pending = requestJson('semble', URL_, controller.signal);
    controller.abort();
    const result = await pending;
    expect(!result.ok && result.error.kind).toBe('timeout');
  });
});
