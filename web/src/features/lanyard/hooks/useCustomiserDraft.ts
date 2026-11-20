import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { useLayoutEffect, useRef, useState } from 'react';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { canWrite, parseGrantedScope } from '@/lib/atproto/permissions';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';

import {
  useKeptRecordsDraft,
  type UseKeptRecordsDraft,
} from './useKeptRecordsDraft';
import { useLanyardDraft, type UseLanyardDraft } from './useLanyardDraft';

/** One failure toast for the customiser, replaced rather than stacked. */
const SAVE_FAILED_TOAST = 'lanyard-settings-save';

/** The kept-record lists the owner adds to, edits and deletes from. */
export const KEPT_LISTS = [LANYARDS_NSID.legacyAudio, LANYARDS_NSID.legacyVideo] as const;

export type UseCustomiserDraft = {
  settings: UseLanyardDraft;
  records: UseKeptRecordsDraft;
  dirty: boolean;
  changes: number;
  saving: boolean;
  /** The session can no longer write what the draft changes. */
  permissionLost: boolean;
  /** Records first (one atomic batch), then settings (conflict-safe). */
  save(): Promise<void>;
  discard(): void;
};

/**
 * The customiser's whole draft (#118): lanyard settings and kept records,
 * saved together by one Save. Whatever saved isn't sent again; whatever
 * didn't stays in the draft, with one error and Retry.
 */
export function useCustomiserDraft(did: Did): UseCustomiserDraft {
  const { t } = useLingui();
  const session = useSession();
  const settings = useLanyardDraft();
  const records = useKeptRecordsDraft(did);
  const [savingRecords, setSavingRecords] = useState(false);
  const [permissionLost, setPermissionLost] = useState(false);
  // The failure toast's Retry outlives the render that showed it.
  const saveLater = useRef<() => void>(() => undefined);

  /** Whether the session may write everything the draft changes. */
  function allowed(): boolean {
    if (session.status !== 'signedIn') return false;
    const granted = parseGrantedScope(session.session.scope);
    const settingsAllowed =
      !settings.dirty ||
      (canWrite(granted, LANYARDS_NSID.lanyard, 'create') &&
        canWrite(granted, LANYARDS_NSID.lanyard, 'update'));
    const recordsAllowed =
      !records.dirty ||
      KEPT_LISTS.every((collection) =>
        (['create', 'update', 'delete'] as const).every((action) =>
          canWrite(granted, collection, action)
        )
      );
    return settingsAllowed && recordsAllowed;
  }

  async function save(): Promise<void> {
    if (!allowed()) {
      // Nothing is sent; the whole draft stays for after signing in again.
      setPermissionLost(true);
      return;
    }
    setPermissionLost(false);
    if (records.dirty) {
      setSavingRecords(true);
      const saved = await records.save();
      setSavingRecords(false);
      if (!saved) {
        notify.error(t`Failed to save. Please try again.`, {
          id: SAVE_FAILED_TOAST,
          action: { label: t`Retry`, onClick: () => saveLater.current() },
        });
        return;
      }
    }
    // Settings show their own error, whose Retry sends only them.
    if (settings.dirty && !(await settings.save({ announce: false }))) return;
    notify.dismiss(SAVE_FAILED_TOAST);
    notify.success(t`Lanyard updated`);
  }

  useLayoutEffect(() => {
    saveLater.current = () => void save();
  });

  return {
    settings,
    records,
    dirty: settings.dirty || records.dirty,
    changes: settings.changes + records.changes,
    saving: settings.saving || savingRecords,
    permissionLost,
    save,
    discard: () => {
      settings.discard();
      records.discard();
      setPermissionLost(false);
    },
  };
}
