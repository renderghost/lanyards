import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { hashKey, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError, track } from '@/lib/analytics/analytics';
import {
  putRecord,
  RecordChangedError,
  type Reference,
  type WriteSession,
} from '@/lib/atproto/writes';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { validateRecord } from '@/lib/lexicons/validate';
import {
  type LanyardConfig,
  resolveConfig,
  serialiseConfig,
} from '@/lib/person/config';
import { sourceQueryOptions } from '@/lib/person/sourceQuery';
import { queryKeys } from '@/lib/query/keys';
import { fetchLanyardConfig } from '@/lib/sources/lanyards/lanyards';
import type { LanyardConfigRecord } from '@/lib/sources/lanyards/lanyards.types';

/** Changes this close together are saved as one write (spec §7.4). */
export const SAVE_DELAY_MS = 800;

/** One failure toast, however many saves fail in a row. */
const SAVE_FAILED_TOAST = 'lanyard-settings-save';

type RecordValue = Record<string, unknown>;

export type UseLanyardConfig = {
  config: LanyardConfig;
  /** The stored settings have been read; until then nothing is saved. */
  ready: boolean;
  /**
   * The stored record exists but doesn't pass its lexicon, so it can't be
   * edited safely; `reset` replaces it with the defaults.
   */
  invalid: boolean;
  update(patch: (config: LanyardConfig) => LanyardConfig): void;
  /** Replaces an unreadable record with the defaults, keeping createdAt. */
  reset(): void;
  /** A change is waiting to be saved, or being saved. */
  saving: boolean;
  /** The last save failed; the change is kept for `retry`. */
  error: boolean;
  retry(): void;
};

/** The stored createdAt, when it is still a valid record timestamp. */
function keptCreatedAt(value: unknown): string | null {
  const createdAt = (value as RecordValue | null)?.createdAt;
  return typeof createdAt === 'string' &&
    validateRecord(LANYARDS_NSID.lanyard, {
      $type: LANYARDS_NSID.lanyard,
      createdAt,
    }).ok
    ? createdAt
    : null;
}

/**
 * The signed-in owner's lanyard settings, edited optimistically.
 *
 * - Each change shows at once (the preview reads the same query) and is
 *   kept as an unsaved overlay until a save succeeds, so a refetch of the
 *   settings can never undo it.
 * - Saves go to the app.lanyards.actor.lanyard record 800 ms after the
 *   last change, or straight away when the page is hidden or closed.
 * - Leaving after a failed save puts the stored settings back in the
 *   shared cache, so the public lanyard never shows unsaved settings.
 * - A record that fails its lexicon is never edited, only reset on request.
 */
export function useLanyardConfig(): UseLanyardConfig {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const session = useSession();
  const writer: WriteSession | null =
    session.status === 'signedIn' ? session.session : null;
  const did = (writer?.did ?? '') as Did;
  const key = useMemo(() => queryKeys.source('lanyards', did, 'config'), [did]);

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(writer),
    ...sourceQueryOptions('lanyards', (signal) =>
      fetchLanyardConfig(did, signal)
    ),
  });
  const config = useMemo(
    () => resolveConfig(query.data?.value ?? null),
    [query.data]
  );
  const invalid = query.status === 'success' && query.data?.valid === false;
  const ready = query.status === 'success' && !invalid;

  const [pending, setPending] = useState(false);
  const [inFlight, setInFlight] = useState(0);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queue = useRef<Promise<void>>(Promise.resolve());
  /** The record with the owner's changes not yet confirmed saved. */
  const unsaved = useRef<RecordValue | null>(null);
  /** The record as the server last returned or confirmed it. */
  const server = useRef<LanyardConfigRecord | null | undefined>(undefined);
  /**
   * The stored version the unsaved changes were built on: its CID (null
   * when there was no record) and value, for swapping and merging.
   */
  const base = useRef<{ cid: string | null; value: unknown } | undefined>(
    undefined
  );
  const mounted = useRef(true);
  // Read when a save runs or a change arrives, so both use the latest
  // session and load state. Kept current before any event can fire.
  const latest = useRef({ writer, ready, invalid });
  useLayoutEffect(() => {
    latest.current = { writer, ready, invalid };
    if (server.current === undefined && query.status === 'success') {
      server.current = query.data;
    }
  });
  // The failure toast's Retry outlives the render that showed it.
  const saveLater = useRef<() => void>(() => undefined);

  const show = useCallback(
    (value: RecordValue) => {
      const shown: LanyardConfigRecord = {
        value,
        cid: server.current?.cid ?? '',
        valid: true,
      };
      queryClient.setQueryData<LanyardConfigRecord | null>(key, shown);
    },
    [queryClient, key]
  );

  /** Puts the stored settings back, dropping changes that weren't saved. */
  const restore = useCallback(() => {
    unsaved.current = null;
    if (server.current !== undefined) {
      queryClient.setQueryData<LanyardConfigRecord | null>(key, server.current);
    }
  }, [queryClient, key]);

  // A fetch of the settings (a retry, a refocus) brings the server's
  // record; keep it, but keep showing the owner's unsaved changes on top.
  useEffect(() => {
    const watched = hashKey(key);
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'success') return;
      if ('manual' in event.action && event.action.manual) return;
      if (event.query.queryHash !== watched) return;
      server.current = event.query.state.data as LanyardConfigRecord | null;
      if (unsaved.current) show(unsaved.current);
    });
  }, [queryClient, key, show]);

  /** Sends the unsaved changes, after any save already under way. */
  const save = useCallback((): void => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setPending(false);
    const changes = unsaved.current;
    if (!changes) return;
    setInFlight((count) => count + 1);
    queue.current = queue.current.then(async () => {
      try {
        const current = latest.current.writer;
        if (!current) throw new Error('Not signed in');
        // Replaces only the stored version the record was built on.
        const send = (
          value: RecordValue,
          swapRecord: string | null | undefined
        ) => {
          const { $type: _type, ...fields } = value;
          return putRecord(
            current,
            LANYARDS_NSID.lanyard,
            'self',
            { ...fields, updatedAt: new Date().toISOString() },
            swapRecord === undefined ? {} : { swapRecord }
          );
        };
        let record = changes;
        let reference: Reference;
        try {
          reference = await send(changes, base.current?.cid);
        } catch (cause) {
          if (!(cause instanceof RecordChangedError)) throw cause;
          // Another device saved the settings since this change was built
          // on them. Apply the owner's customiser settings over that
          // version, keeping everything else it holds (such as per-event
          // overrides), and save once more.
          const fresh = await fetchLanyardConfig(current.did);
          if (!fresh.ok || fresh.value?.valid === false) throw cause;
          server.current = fresh.value;
          record = {
            $type: LANYARDS_NSID.lanyard,
            ...serialiseConfig(
              resolveConfig(changes),
              fresh.value?.value ?? null,
              new Date().toISOString()
            ),
          };
          reference = await send(record, fresh.value?.cid ?? null);
        }
        server.current = { value: record, cid: reference.cid, valid: true };
        if (unsaved.current === changes) {
          unsaved.current = null;
          // Show what's stored, with its CID, so a later visit builds on
          // (and swaps against) this version.
          queryClient.setQueryData<LanyardConfigRecord | null>(
            key,
            server.current
          );
        } else if (record === changes) {
          // Later changes were built on what was just saved. (After a
          // merge they weren't, so they keep the old base and merge too.)
          base.current = { cid: reference.cid, value: record };
        }
        setError(false);
        notify.dismiss(SAVE_FAILED_TOAST);
        notify.success(t`Lanyard updated`);
        track('lanyard_updated');
      } catch (cause) {
        captureError(cause, { source: 'lanyard-settings' });
        if (!mounted.current) {
          restore();
          return;
        }
        setError(true);
        notify.error(t`Failed to save. Please try again.`, {
          id: SAVE_FAILED_TOAST,
          action: { label: t`Retry`, onClick: () => saveLater.current() },
        });
      } finally {
        setInFlight((count) => count - 1);
      }
    });
  }, [t, restore, queryClient, key]);

  const schedule = useCallback(
    (value: RecordValue) => {
      // A new run of changes builds on the stored version now shown.
      if (!unsaved.current) {
        base.current =
          server.current === undefined
            ? undefined
            : {
                cid: server.current?.cid || null,
                value: server.current?.value ?? null,
              };
      }
      unsaved.current = value;
      show(value);
      setPending(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(save, SAVE_DELAY_MS);
    },
    [show, save]
  );

  const update = useCallback(
    (patch: (config: LanyardConfig) => LanyardConfig): void => {
      if (!latest.current.ready) return;
      const previous =
        unsaved.current ??
        queryClient.getQueryData<LanyardConfigRecord | null>(key)?.value ??
        null;
      const fields = serialiseConfig(
        patch(resolveConfig(previous)),
        previous,
        new Date().toISOString()
      );
      schedule({ $type: LANYARDS_NSID.lanyard, ...fields });
    },
    [queryClient, key, schedule]
  );

  const reset = useCallback((): void => {
    if (!latest.current.invalid) return;
    const stored = queryClient.getQueryData<LanyardConfigRecord | null>(key);
    const createdAt = keptCreatedAt(stored?.value);
    const fields = serialiseConfig(
      resolveConfig(null),
      createdAt ? { createdAt } : null,
      new Date().toISOString()
    );
    schedule({ $type: LANYARDS_NSID.lanyard, ...fields });
    save();
  }, [queryClient, key, schedule, save]);

  useLayoutEffect(() => {
    saveLater.current = save;
  }, [save]);

  // Save a waiting change before the page goes away, the app goes into the
  // background (phones often skip pagehide) or the customiser closes.
  useEffect(() => {
    mounted.current = true;
    const flush = () => {
      if (timer.current !== undefined) save();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted.current = false;
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      if (timer.current !== undefined) save();
      // A change whose save already failed won't be saved now: show
      // everyone the stored settings again.
      else if (unsaved.current) restore();
    };
  }, [save, restore]);

  return {
    config,
    ready,
    invalid,
    update,
    reset,
    saving: pending || inFlight > 0,
    error,
    retry: save,
  };
}
