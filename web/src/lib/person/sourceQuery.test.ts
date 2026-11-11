import { beforeEach, describe, expect, it, vi } from 'vitest';

import { captureError } from '@/lib/analytics/analytics';
import { err, ok, SourceError } from '@/lib/sources/result';

import { sourceQueryOptions } from './sourceQuery';

vi.mock('@/lib/analytics/analytics', () => ({ captureError: vi.fn() }));

const run = <T>(options: ReturnType<typeof sourceQueryOptions<T>>) =>
  options.queryFn({ signal: new AbortController().signal });

beforeEach(() => {
  vi.mocked(captureError).mockClear();
});

describe('sourceQueryOptions', () => {
  it('returns the value of a successful read', async () => {
    await expect(
      run(sourceQueryOptions('sifa', async () => ok(3)))
    ).resolves.toBe(3);
  });

  it('throws and reports an unexpected failure', async () => {
    const failure = new SourceError('sifa', 'server', { status: 502 });
    await expect(
      run(
        sourceQueryOptions('sifa', async () => ({ ok: false, error: failure }))
      )
    ).rejects.toBe(failure);
    expect(captureError).toHaveBeenCalledWith(failure, { source: 'sifa' });
  });

  it('throws an expected failure without reporting it', async () => {
    await expect(
      run(sourceQueryOptions('sifa', async () => err('sifa', 'notFound')))
    ).rejects.toMatchObject({ source: 'sifa', kind: 'notFound' });
    expect(captureError).not.toHaveBeenCalled();
  });

  it('keeps the source and reports it when an adapter throws', async () => {
    const thrown = new TypeError('Cannot read properties of undefined');
    const failing = sourceQueryOptions<number>('tangled', async () => {
      throw thrown;
    });
    const error = await run(failing).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(SourceError);
    expect(error).toMatchObject({ source: 'tangled' });
    expect(captureError).toHaveBeenCalledWith(thrown, { source: 'tangled' });
  });

  it('lets a cancelled read end quietly', async () => {
    const controller = new AbortController();
    const aborted = new DOMException('Aborted', 'AbortError');
    const options = sourceQueryOptions<number>('semble', async () => {
      controller.abort();
      throw aborted;
    });
    await expect(options.queryFn({ signal: controller.signal })).rejects.toBe(
      aborted
    );
    expect(captureError).not.toHaveBeenCalled();
  });
});
