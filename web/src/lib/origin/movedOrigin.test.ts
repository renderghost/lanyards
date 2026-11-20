import { describe, expect, it, vi } from 'vitest';

import { leaveFor, movedTo } from './movedOrigin';

const HOME = 'https://lanyards.app';

describe('movedTo (#154)', () => {
  it('sends a visit to next.lanyards.app on to lanyards.app, path and all', () => {
    expect(
      movedTo('https://next.lanyards.app/alice.test/edit?x=1#top', HOME)
    ).toBe('https://lanyards.app/alice.test/edit?x=1#top');
    expect(movedTo('https://next.lanyards.app/', HOME)).toBe(
      'https://lanyards.app/'
    );
  });

  it('stays put where the app lives', () => {
    expect(movedTo('https://lanyards.app/alice.test', HOME)).toBeNull();
  });

  // Until the build's base URL moves, next.lanyards.app is still home.
  it('stays put on next.lanyards.app while that is the base URL', () => {
    expect(
      movedTo(
        'https://next.lanyards.app/alice.test',
        'https://next.lanyards.app'
      )
    ).toBeNull();
  });

  it('leaves every other origin alone: previews, local, Vercel URLs', () => {
    for (const href of [
      'https://lanyards-next-git-x-renderghost.vercel.app/',
      'https://lanyards-next.vercel.app/',
      'http://127.0.0.1:5173/',
    ]) {
      expect(movedTo(href, HOME)).toBeNull();
    }
  });
});

describe('leaveFor (#154)', () => {
  it('drops the old service worker and its caches, then goes', async () => {
    const unregister = vi.fn(async () => true);
    const remove = vi.fn(async (_key: string) => true);
    const go = vi.fn();
    await leaveFor('https://lanyards.app/', {
      registrations: async () => [{ unregister }, { unregister }],
      cacheKeys: async () => ['workbox-precache-v2', 'other'],
      deleteCache: remove,
      go,
    });
    expect(unregister).toHaveBeenCalledTimes(2);
    expect(remove.mock.calls.map(([key]) => key)).toEqual([
      'workbox-precache-v2',
      'other',
    ]);
    expect(go).toHaveBeenCalledWith('https://lanyards.app/');
  });

  it('goes anyway when clearing up fails or hangs', async () => {
    vi.useFakeTimers();
    const go = vi.fn();
    const leaving = leaveFor('https://lanyards.app/', {
      registrations: () => new Promise(() => undefined),
      cacheKeys: async () => {
        throw new Error('no caches');
      },
      deleteCache: async () => true,
      go,
    });
    await vi.advanceTimersByTimeAsync(2000);
    await leaving;
    expect(go).toHaveBeenCalledWith('https://lanyards.app/');
    vi.useRealTimers();
  });
});
