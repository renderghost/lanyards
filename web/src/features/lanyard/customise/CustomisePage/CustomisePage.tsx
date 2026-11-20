import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { AppHeader } from '@/components/AppHeader/AppHeader';
import { Button } from '@/components/Button/Button';
import { PermissionNotice } from '@/features/auth/components/PermissionNotice/PermissionNotice';
import { useSession } from '@/features/auth/session/useSession';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { canWrite, parseGrantedScope } from '@/lib/atproto/permissions';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { cn } from '@/lib/utils';

import { LanyardPage } from '../../components/LanyardPage/LanyardPage';
import { LanyardSurface } from '../../components/LanyardSurface/LanyardSurface';
import { KEPT_LISTS, useCustomiserDraft } from '../../hooks/useCustomiserDraft';
import { useMediaMove } from '../../hooks/useMediaMove';
import { CustomiserActions } from '../CustomiserActions/CustomiserActions';
import type { ViewAs } from '../CustomiserActions/CustomiserActions.types';
import { CustomiserToolbar } from '../CustomiserToolbar/CustomiserToolbar';
import { LanyardEditor } from '../LanyardEditor/LanyardEditor';
import { StyleSheet } from '../StyleSheet/StyleSheet';
import { StyleSidebar } from '../StyleSidebar/StyleSidebar';
import { CUSTOMISE_PATH, SIGN_IN_PATH } from './CustomisePage.constants';
import * as styles from './CustomisePage.styles';
import type { CustomisePageProps } from './CustomisePage.types';

/**
 * `/lanyard`: the signed-in owner customises their lanyard where it is
 * (spec §7.4): its style in the sidebar, its blocks and records on the
 * lanyard itself. Changes show at once and are one draft until Save, in
 * the route's own header (#118).
 */
export function CustomisePage({ className }: CustomisePageProps) {
  const { t } = useLingui();
  const router = useRouter();
  const session = useSession();
  const signedOut = session.status === 'signedOut';
  useDocumentTitle(t`Your lanyard`);

  useEffect(() => {
    if (signedOut) router.history.replace(SIGN_IN_PATH);
  }, [signedOut, router]);

  if (session.status !== 'signedIn') {
    return (
      <>
        <AppHeader title={t`Your lanyard`} />
        <main className={styles.main}>
          <p role="status" className={styles.loading}>
            {t`Loading…`}
          </p>
        </main>
      </>
    );
  }
  return (
    <Customiser
      did={session.session.did}
      scope={session.session.scope}
      className={className}
    />
  );
}

function Customiser({
  did,
  scope,
  className,
}: {
  did: Did;
  scope: string;
  className?: string;
}) {
  const { t } = useLingui();
  const headingId = useId();
  const draft = useCustomiserDraft(did);
  const { settings, records } = draft;
  const [viewAs, setViewAs] = useState<ViewAs>('edit');
  /** On phones, the style sheet opened from the bottom toolbar. */
  const [styleOpen, setStyleOpen] = useState(false);
  const styleButton = useRef<HTMLButtonElement>(null);

  const granted = useMemo(() => parseGrantedScope(scope), [scope]);
  const canEdit =
    canWrite(granted, LANYARDS_NSID.lanyard, 'create') &&
    canWrite(granted, LANYARDS_NSID.lanyard, 'update');
  const canKeep = KEPT_LISTS.every((collection) =>
    (['create', 'update', 'delete'] as const).every((action) =>
      canWrite(granted, collection, action)
    )
  );
  // Legacy podcasts and videos move to the one record type first (#132):
  // editing waits, so no edit builds on a record that is moving.
  const move = useMediaMove(did, {
    enabled: canEdit && canKeep && records.ready && settings.ready,
    records: records.records,
    hidden: settings.config.hidden,
  });
  const disabled = !canEdit || !settings.ready || move.moving;
  // A records save replaces the draft it sent, so edits wait for it.
  const recordsDisabled =
    !canKeep || !records.ready || draft.saving || move.moving;
  const { update } = settings;
  const editing = viewAs === 'edit';
  useUnsavedChangesGuard(
    draft.dirty,
    t`You have unsaved changes. Leave without saving?`
  );

  return (
    <>
      <AppHeader
        title={t`Your lanyard`}
        actions={
          <CustomiserActions
            viewAs={viewAs}
            onViewAsChange={setViewAs}
            dirty={draft.dirty}
            changes={draft.changes}
            saving={draft.saving}
            onSave={() => void draft.save()}
            onReset={draft.discard}
          />
        }
      />
      <main className={styles.main}>
        <div className={cn(styles.workspace, className)}>
          {editing && (
            <StyleSidebar
              config={settings.config}
              disabled={disabled}
              onChange={update}
            />
          )}
          <LanyardSurface className={styles.canvas}>
            <div className={styles.intro}>
              <h1 id={headingId} className={styles.heading}>
                {t`Customise your lanyard`}
              </h1>
              {(!canEdit || !canKeep || draft.permissionLost) && (
                <PermissionNotice returnTo={CUSTOMISE_PATH} />
              )}
              <p role="status" className={styles.moving}>
                {move.moving ? t`Updating your podcasts and videos…` : ''}
              </p>
              {settings.invalid && (
                <div role="status" className={styles.notice}>
                  <p className={styles.noticeHeading}>
                    {t`We couldn't read your lanyard settings`}
                  </p>
                  <p className={styles.noticeText}>
                    {t`They may have been saved in a form Lanyards doesn't recognise. Resetting replaces them with the defaults.`}
                  </p>
                  <Button
                    variant="secondary"
                    disabled={!canEdit}
                    onClick={settings.resetInvalid}
                  >
                    {t`Reset to defaults`}
                  </Button>
                </div>
              )}
              {!editing && (
                <p className={styles.publicNote}>
                  {t`You’re seeing your lanyard as the public sees it.`}
                </p>
              )}
            </div>
            <section aria-label={t`Preview`} className={styles.frame}>
              {editing ? (
                <LanyardEditor
                  did={did}
                  config={settings.config}
                  onChange={update}
                  disabled={disabled}
                  records={records}
                  recordsDisabled={recordsDisabled}
                />
              ) : (
                <LanyardPage did={did} preview="visitor" />
              )}
            </section>
          </LanyardSurface>
        </div>
        <CustomiserToolbar
          onOpenStyle={() => setStyleOpen(true)}
          styleButtonRef={styleButton}
          onReset={draft.discard}
          dirty={draft.dirty}
          changes={draft.changes}
        />
      </main>
      <StyleSheet
        open={styleOpen}
        onOpenChange={setStyleOpen}
        returnFocus={() => styleButton.current?.focus()}
        config={settings.config}
        disabled={disabled}
        onChange={update}
      />
    </>
  );
}
