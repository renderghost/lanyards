import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { track } from '@/lib/analytics/analytics';
import { putRecord, type WriteSession } from '@/lib/atproto/writes';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
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

export type UseLanyardConfig = {
  config: LanyardConfig;
  /** The stored settings have been read; until then nothing is saved. */
  ready: boolean;
  update(patch: (config: LanyardConfig) => LanyardConfig): void;
  /** A change is waiting to be saved, or being saved. */
  saving: boolean;
  /** The last save failed; the change is kept for `retry`. */
  error: boolean;
  retry(): void;
};

/**
 * The signed-in owner's lanyard settings, edited optimistically: each
 * change shows at once (the preview reads the same query) and is saved to
 * the app.lanyards.actor.lanyard record 800 ms after the last one, or
 * straight away when the page is hidden or the customiser closes.
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
    ...sourceQueryOptions((signal) => fetchLanyardConfig(did, signal)),
  });
  const config = useMemo(
    () => resolveConfig(query.data?.value ?? null),
    [query.data]
  );
  const ready = query.status === 'success';

  const [pending, setPending] = useState(false);
  const [inFlight, setInFlight] = useState(0);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queue = useRef<Promise<void>>(Promise.resolve());
  // Read when a save runs or a change arrives, so both use the latest
  // session and load state. Kept current before any event can fire.
  const latest = useRef({ writer, ready });
  useLayoutEffect(() => {
    latest.current = { writer, ready };
  });
  // The failure toast's Retry outlives the render that showed it.
  const saveLater = useRef<() => void>(() => undefined);

  /** Sends what the cache holds now, after any save already under way. */
  const save = useCallback((): void => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setPending(false);
    setInFlight((count) => count + 1);
    queue.current = queue.current.then(async () => {
      const current = latest.current.writer;
      const stored = queryClient.getQueryData<LanyardConfigRecord | null>(key);
      try {
        if (!current || !stored) throw new Error('Nothing to save');
        const { $type: _type, ...fields } = stored.value as Record<
          string,
          unknown
        >;
        await putRecord(current, LANYARDS_NSID.lanyard, 'self', {
          ...fields,
          updatedAt: new Date().toISOString(),
        });
        setError(false);
        notify.success(t`Lanyard updated`);
        track('lanyard_updated');
      } catch {
        setError(true);
        notify.error(t`Failed to save. Please try again.`, {
          action: { label: t`Retry`, onClick: () => saveLater.current() },
        });
      } finally {
        setInFlight((count) => count - 1);
      }
    });
  }, [queryClient, key, t]);

  const update = useCallback(
    (patch: (config: LanyardConfig) => LanyardConfig): void => {
      if (!latest.current.ready) return;
      const stored = queryClient.getQueryData<LanyardConfigRecord | null>(key);
      const previous = stored?.value ?? null;
      const fields = serialiseConfig(
        patch(resolveConfig(previous)),
        previous,
        new Date().toISOString()
      );
      // A background refetch must not replace the change with older data.
      void queryClient.cancelQueries({ queryKey: key }, { revert: false });
      const next: LanyardConfigRecord = {
        value: { $type: LANYARDS_NSID.lanyard, ...fields },
        cid: stored?.cid ?? '',
      };
      queryClient.setQueryData<LanyardConfigRecord | null>(key, next);
      setPending(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(save, SAVE_DELAY_MS);
    },
    [queryClient, key, save]
  );

  useLayoutEffect(() => {
    saveLater.current = save;
  }, [save]);

  // Save a waiting change before the page goes away or the customiser
  // closes, rather than dropping it.
  useEffect(() => {
    const flush = () => {
      if (timer.current !== undefined) save();
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [save]);

  return {
    config,
    ready,
    update,
    saving: pending || inFlight > 0,
    error,
    retry: save,
  };
}
