import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useWakeLock } from './useWakeLock';

type Sentinel = {
  released: boolean;
  release: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  /** What the browser does when it drops the lock (page hidden). */
  drop(): void;
};

function mockWakeLock(options: { reject?: boolean } = {}) {
  const sentinels: Sentinel[] = [];
  const request = vi.fn(async () => {
    if (options.reject)
      throw new DOMException('Not allowed', 'NotAllowedError');
    const listeners: (() => void)[] = [];
    const sentinel: Sentinel = {
      released: false,
      release: vi.fn(async () => {
        sentinel.released = true;
        listeners.forEach((listener) => listener());
      }),
      addEventListener: vi.fn((type: string, listener: () => void) => {
        if (type === 'release') listeners.push(listener);
      }),
      removeEventListener: vi.fn(),
      drop: () => {
        sentinel.released = true;
        listeners.forEach((listener) => listener());
      },
    };
    sentinels.push(sentinel);
    return sentinel;
  });
  Object.defineProperty(navigator, 'wakeLock', {
    value: { request },
    configurable: true,
  });
  return { request, sentinels };
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'wakeLock');
  setVisibility('visible');
});

describe('useWakeLock', () => {
  it('holds the screen awake while active, and lets go when not', async () => {
    const { request, sentinels } = mockWakeLock();
    const { result, rerender } = renderHook(
      ({ active }) => useWakeLock(active),
      { initialProps: { active: true } }
    );
    await waitFor(() => expect(result.current.held).toBe(true));
    expect(result.current.supported).toBe(true);
    expect(request).toHaveBeenCalledWith('screen');
    rerender({ active: false });
    await waitFor(() => expect(result.current.held).toBe(false));
    expect(sentinels[0]?.release).toHaveBeenCalled();
  });

  it('asks again when the page comes back into view', async () => {
    const { request, sentinels } = mockWakeLock();
    const { result } = renderHook(() => useWakeLock(true));
    await waitFor(() => expect(result.current.held).toBe(true));
    act(() => {
      setVisibility('hidden');
      sentinels[0]?.drop();
    });
    await waitFor(() => expect(result.current.held).toBe(false));
    act(() => setVisibility('visible'));
    await waitFor(() => expect(result.current.held).toBe(true));
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('lets go when unmounted', async () => {
    const { sentinels } = mockWakeLock();
    const { result, unmount } = renderHook(() => useWakeLock(true));
    await waitFor(() => expect(result.current.held).toBe(true));
    unmount();
    expect(sentinels[0]?.release).toHaveBeenCalled();
  });

  it('does nothing where the browser has no wake lock', () => {
    const { result } = renderHook(() => useWakeLock(true));
    expect(result.current).toEqual({ supported: false, held: false });
  });

  it('quietly gives up when the browser refuses', async () => {
    const { request } = mockWakeLock({ reject: true });
    const { result } = renderHook(() => useWakeLock(true));
    await waitFor(() => expect(request).toHaveBeenCalled());
    expect(result.current).toEqual({ supported: true, held: false });
  });
});
