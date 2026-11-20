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
  mergeConfig,
  resolveConfig,
  serialiseConfig,
} from '@/lib/person/config';
import { sourceQueryOptions } from '@/lib/person/sourceQuery';
import { queryKeys } from '@/lib/query/keys';
import { fetchLanyardConfig } from '@/lib/sources/lanyards/lanyards';
import type { LanyardConfigRecord } from '@/lib/sources/lanyards/lanyards.types';

/** One failure toast, however many saves fail in a row. */
const SAVE_FAILED_TOAST = 'lanyard-settings-save';

type RecordValue = Record<string, unknown>;

export type UseLanyardDraft = {
  /** The draft: the last save with the owner's unsaved changes on top. */
  config: LanyardConfig;
  /** The settings as last saved. */
  saved: LanyardConfig;
  /** The stored settings have been read; until then nothing changes. */
  ready: boolean;
  /**
   * The stored record exists but doesn't pass its lexicon, so it can't be
   * edited safely; `resetInvalid` replaces it with the defaults.
   */
  invalid: boolean;
  /** The draft differs from the last save. */
  dirty: boolean;
  /**
   * How many edits differ from the last save: the accent, the badge, each
   * block that moved or changed, and each item hidden or shown.
   */
  changes: number;
  update(patch: (config: LanyardConfig) => LanyardConfig): void;
  /**
   * Writes the draft; resolves true once it is saved (or had nothing).
   * `announce: false` leaves the success toast to the caller.
   */
  save(options?: { announce?: boolean }): Promise<boolean>;
  /** Drops the draft, back to the last save. */
  discard(): void;
  /** Replaces an unreadable record with the defaults, keeping createdAt. */
  resetInvalid(): void;
  /** A save is under way. */
  saving: boolean;
  /** The last save failed; the draft is kept for another try. */
  error: boolean;
};

/**
 * How many edits separate two configs: the accent, the cover and each
 * badge setting count one each, every block whose place or settings differ counts one, and every
 * item hidden or shown counts one (so Reset can ask before discarding
 * several).
 */
export function countChanges(a: LanyardConfig, b: LanyardConfig): number {
  let count =
    Number(a.accent !== b.accent) +
    Number(a.cover !== b.cover) +
    Number(a.showRole !== b.showRole) +
    Number(a.showLocation !== b.showLocation) +
    Number(a.showOpenTo !== b.showOpenTo);
  const places = (config: LanyardConfig) =>
    new Map(
      config.blocks.map((block, index) => [
        block.type,
        JSON.stringify({ index, block }),
      ])
    );
  const before = places(b);
  const after = places(a);
  for (const type of new Set([...before.keys(), ...after.keys()])) {
    if (before.get(type) !== after.get(type)) count += 1;
  }
  const hiddenBefore = new Set(b.hidden);
  const hiddenAfter = new Set(a.hidden);
  for (const key of hiddenAfter) if (!hiddenBefore.has(key)) count += 1;
  for (const key of hiddenBefore) if (!hiddenAfter.has(key)) count += 1;
  return count;
}

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
 * The signed-in owner's lanyard settings, as a draft until Save (#118).
 *
 * - Each change shows at once (the preview reads the same query) and stays
 *   an unsaved overlay until Save succeeds, so a refetch of the settings
 *   never undoes it.
 * - Save writes the app.lanyards.actor.lanyard record once, swapping
 *   against the version the draft was built on and merging with what
 *   another device saved meanwhile (#114).
 * - Closing the customiser with a draft puts the stored settings back in
 *   the shared cache, so the public lanyard never shows unsaved settings.
 * - A record that fails its lexicon is never edited, only reset on request.
 */
export function useLanyardDraft(): UseLanyardDraft {
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
  // Read settings stay editable when a later refetch fails.
  const loaded = query.data !== undefined;
  const invalid = loaded && query.data?.valid === false;
  const ready = loaded && !invalid;

  const [inFlight, setInFlight] = useState(0);
  /** Saves under way, for event handlers (the state lags a render). */
  const saving = useRef(0);
  /** The defaults record a "Reset to defaults" is writing, if any. */
  const resetting = useRef<RecordValue | null>(null);
  const [error, setError] = useState(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  /** The record with the owner's changes not yet saved. */
  const unsaved = useRef<RecordValue | null>(null);
  /** The record as the server last returned or confirmed it. */
  const server = useRef<LanyardConfigRecord | null | undefined>(undefined);
  // Mirrors of the two refs above, so `saved`, `dirty` and `changes`
  // render when they change.
  const [draft, setDraft] = useState<RecordValue | null>(null);
  const [stored, setStored] = useState<LanyardConfigRecord | null>(null);
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
  const resetLater = useRef<() => void>(() => undefined);

  const keepUnsaved = useCallback((value: RecordValue | null) => {
    unsaved.current = value;
    setDraft(value);
  }, []);

  const keepServer = useCallback((value: LanyardConfigRecord | null) => {
    server.current = value;
    setStored(value);
  }, []);

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

  /** Puts the stored settings back, dropping the draft. */
  const restore = useCallback(() => {
    keepUnsaved(null);
    if (server.current !== undefined) {
      queryClient.setQueryData<LanyardConfigRecord | null>(key, server.current);
    }
  }, [queryClient, key, keepUnsaved]);

  // A fetch of the settings (a retry, a refocus) brings the server's
  // record; keep it as the last save, but keep showing the draft on top.
  useEffect(() => {
    const watched = hashKey(key);
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'success') return;
      if ('manual' in event.action && event.action.manual) return;
      if (event.query.queryHash !== watched) return;
      keepServer(event.query.state.data as LanyardConfigRecord | null);
      if (unsaved.current) show(unsaved.current);
    });
  }, [queryClient, key, show, keepServer]);

  /** Writes the draft, after any save already under way. */
  const save = useCallback(
    (options: { announce?: boolean } = {}): Promise<boolean> => {
      const changes = unsaved.current;
      if (!changes) return Promise.resolve(true);
      saving.current += 1;
      setInFlight((count) => count + 1);
      const run = queue.current.then(async (): Promise<boolean> => {
        try {
          const current = latest.current.writer;
          if (!current) throw new Error('Not signed in');
          // Replaces only the stored version the draft was built on.
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
            // Another device saved the settings since this draft was built
            // on them. Merge: the settings changed here win, the rest come
            // from that version, as does everything else it holds (such as
            // per-event overrides). Then save once more.
            const fresh = await fetchLanyardConfig(current.did);
            if (!fresh.ok) throw cause;
            keepServer(fresh.value);
            if (fresh.value?.valid === false) {
              // Saved elsewhere in a form Lanyards can't read: show that,
              // with its Reset, rather than a Retry that can never succeed.
              keepUnsaved(null);
              queryClient.setQueryData<LanyardConfigRecord | null>(
                key,
                fresh.value
              );
              setError(false);
              notify.dismiss(SAVE_FAILED_TOAST);
              return false;
            }
            record = {
              $type: LANYARDS_NSID.lanyard,
              ...serialiseConfig(
                mergeConfig(
                  resolveConfig(base.current?.value ?? null),
                  resolveConfig(changes),
                  resolveConfig(fresh.value?.value ?? null)
                ),
                fresh.value?.value ?? null,
                new Date().toISOString()
              ),
            };
            reference = await send(record, fresh.value?.cid ?? null);
          }
          keepServer({ value: record, cid: reference.cid, valid: true });
          if (unsaved.current === changes || unsaved.current === null) {
            // Nothing changed meanwhile (or the draft was dropped): show
            // what's stored, with its CID, so later changes build on (and
            // swap against) this version.
            keepUnsaved(null);
            queryClient.setQueryData<LanyardConfigRecord | null>(
              key,
              server.current
            );
          } else {
            if (record === changes) {
              // Later changes were built on what was just saved. (After a
              // merge they weren't, so they keep the old base and merge too.)
              base.current = { cid: reference.cid, value: record };
            }
            // Changes made during the save that end where it did leave
            // nothing to save; any others stay in the draft.
            if (
              countChanges(
                resolveConfig(unsaved.current),
                resolveConfig(record)
              ) === 0
            ) {
              keepUnsaved(null);
              queryClient.setQueryData<LanyardConfigRecord | null>(
                key,
                server.current
              );
            }
          }
          if (resetting.current === changes) resetting.current = null;
          setError(false);
          notify.dismiss(SAVE_FAILED_TOAST);
          if (options.announce !== false) notify.success(t`Lanyard updated`);
          track('lanyard_updated');
          return true;
        } catch (cause) {
          captureError(cause, { source: 'lanyard-settings' });
          if (!mounted.current) {
            restore();
            return false;
          }
          // A reset that failed puts the unreadable record (and its notice)
          // back: nothing changed, and Retry tries the reset again.
          const wasReset = resetting.current === changes;
          if (wasReset) {
            resetting.current = null;
            if (unsaved.current === changes) restore();
          }
          setError(true);
          notify.error(t`Failed to save. Please try again.`, {
            id: SAVE_FAILED_TOAST,
            action: {
              label: t`Retry`,
              onClick: () =>
                wasReset ? resetLater.current() : saveLater.current(),
            },
          });
          return false;
        } finally {
          saving.current -= 1;
          setInFlight((count) => count - 1);
        }
      });
      queue.current = run;
      return run;
    },
    [t, restore, queryClient, key, keepServer, keepUnsaved]
  );

  /** Makes `value` the draft, or drops the draft if it matches the save. */
  const keepDraft = useCallback(
    (value: RecordValue) => {
      // A new draft builds on the stored version now shown.
      if (!unsaved.current) {
        base.current =
          server.current === undefined
            ? undefined
            : {
                cid: server.current?.cid || null,
                value: server.current?.value ?? null,
              };
        setStored(server.current ?? null);
      }
      // Back to the last save: nothing to save. (Not while a save is
      // under way: the last save is about to change, so keep the draft
      // and let the save's outcome decide.)
      const last = resolveConfig(server.current?.value ?? null);
      if (
        saving.current === 0 &&
        countChanges(resolveConfig(value), last) === 0
      ) {
        restore();
        return;
      }
      keepUnsaved(value);
      show(value);
    },
    [show, restore, keepUnsaved]
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
      keepDraft({ $type: LANYARDS_NSID.lanyard, ...fields });
    },
    [queryClient, key, keepDraft]
  );

  const discard = useCallback((): void => {
    restore();
    setError(false);
    notify.dismiss(SAVE_FAILED_TOAST);
  }, [restore]);

  const resetInvalid = useCallback((): void => {
    if (!latest.current.invalid) return;
    const current = queryClient.getQueryData<LanyardConfigRecord | null>(key);
    const createdAt = keptCreatedAt(current?.value);
    const fields = serialiseConfig(
      resolveConfig(null),
      createdAt ? { createdAt } : null,
      new Date().toISOString()
    );
    // Saved at once: the owner asked for it, and the unreadable record
    // can't be edited as a draft.
    base.current =
      server.current === undefined
        ? undefined
        : {
            cid: server.current?.cid || null,
            value: server.current?.value ?? null,
          };
    const value = { $type: LANYARDS_NSID.lanyard, ...fields };
    resetting.current = value;
    keepUnsaved(value);
    show(value);
    void save();
  }, [queryClient, key, keepUnsaved, show, save]);

  useLayoutEffect(() => {
    saveLater.current = () => void save();
    resetLater.current = resetInvalid;
  }, [save, resetInvalid]);

  // Closing the customiser drops the draft: everyone, the public lanyard
  // included, sees the stored settings again.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (unsaved.current) restore();
    };
  }, [restore]);

  const saved = useMemo(
    () => (draft ? resolveConfig(stored?.value ?? null) : config),
    [draft, stored, config]
  );
  const changes = draft ? countChanges(config, saved) : 0;

  return {
    config,
    saved,
    ready,
    invalid,
    dirty: changes > 0,
    changes,
    update,
    save,
    discard,
    resetInvalid,
    saving: inFlight > 0,
    error,
  };
}
