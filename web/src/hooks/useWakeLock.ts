import { useEffect, useState } from 'react';

/**
 * Keeps the screen awake while `active`, e.g. while a QR code is shown
 * (spec §7.6). Browsers drop the lock when the page is hidden, so it is
 * asked for again when the page is visible. Refusals are ignored: there
 * is nothing useful to show, and iOS 16.4–18.3 Home Screen apps refuse.
 */
export function useWakeLock(active: boolean): {
  supported: boolean;
  held: boolean;
} {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!active || !supported) return;
    let sentinel: WakeLockSentinel | null = null;
    let stopped = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      if (sentinel && !sentinel.released) return;
      try {
        const next = await navigator.wakeLock.request('screen');
        if (stopped) {
          void Promise.resolve(next.release()).catch(() => undefined);
          return;
        }
        sentinel = next;
        next.addEventListener('release', () => {
          if (sentinel === next) setHeld(false);
        });
        setHeld(true);
      } catch {
        // Refused or unavailable: the sheet works the same without it.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (sentinel && !sentinel.released) {
        void Promise.resolve(sentinel.release()).catch(() => undefined);
      }
      setHeld(false);
    };
  }, [active, supported]);

  return { supported, held: supported && active && held };
}
