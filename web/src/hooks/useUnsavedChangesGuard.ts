import { useBlocker } from '@tanstack/react-router';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

/** Guards that currently have changes to save, and who's listening. */
let unsaved = 0;
const listeners = new Set<() => void>();

function changeUnsaved(by: number) {
  unsaved += by;
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Whether any part of the app has unsaved changes: for things that are
 * about to leave the page, such as the feedback permission sign-in (#134).
 */
export function useHasUnsavedChanges(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => unsaved > 0,
    () => false
  );
}

/**
 * While `dirty`, asks before leaving: `message` in a confirm for any move
 * within the app (a link, browser Back), and the browser's own prompt when
 * the tab closes or reloads. Leaving with nothing to save never asks.
 */
export function useUnsavedChangesGuard(dirty: boolean, message: string): void {
  // The blocker reads these when a navigation happens, not when it was
  // registered, so it never decides on a stale render.
  const latest = useRef({ dirty, message });
  useLayoutEffect(() => {
    latest.current = { dirty, message };
  });

  useBlocker({
    shouldBlockFn: () =>
      latest.current.dirty && !window.confirm(latest.current.message),
    // Handled below, only while there are changes.
    enableBeforeUnload: false,
  });

  useEffect(() => {
    if (!dirty) return;
    changeUnsaved(1);
    return () => changeUnsaved(-1);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // Browsers show their own wording; preventDefault is what asks.
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);
}
