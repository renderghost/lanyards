import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useRouter } from '@tanstack/react-router';
import {
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AppHeader } from '@/components/AppHeader/AppHeader';
import { Button } from '@/components/Button/Button';
import { PermissionNotice } from '@/features/auth/components/PermissionNotice/PermissionNotice';
import { initialsOf } from '@/design/covers';
import { useSession } from '@/features/auth/session/useSession';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { canWrite, parseGrantedScope } from '@/lib/atproto/permissions';
import { useProfile } from '@/lib/atproto/useProfile';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { cn } from '@/lib/utils';

import { LanyardSurface } from '../../components/LanyardSurface/LanyardSurface';
import { KEPT_LISTS, useCustomiserDraft } from '../../hooks/useCustomiserDraft';
import { useMediaMove } from '../../hooks/useMediaMove';
import { CustomiserActions } from '../CustomiserActions/CustomiserActions';
import { LanyardEditor } from '../LanyardEditor/LanyardEditor';
import { StyleSheet } from '../StyleSheet/StyleSheet';
import { StyleSidebar } from '../StyleSidebar/StyleSidebar';
import { CustomiserSidebar } from '../CustomiserSidebar/CustomiserSidebar';
import * as styles from './CustomisePage.styles';
import type { CustomisePageProps } from './CustomisePage.types';

/**
 * `/lanyard`: the signed-in owner customises their lanyard where it is
 * (spec §7.4): its style in the sidebar, its blocks and records on the
 * lanyard itself. Changes show at once and are one draft until Save, in
 * the route's own header (#118).
 */
export function CustomisePage({
  pending = false,
  className,
}: CustomisePageProps) {
  const { t } = useLingui();
  const router = useRouter();
  const path = useLocation({ select: (location) => location.pathname });
  const session = useSession();
  const signedOut = session.status === 'signedOut';
  useDocumentTitle(t`Your lanyard`);

  // Signed out: sign in, then come back to this page. Once, from where
  // they are: the page is still here while the sign-in page loads.
  const signIn = useEffectEvent(() => {
    router.history.replace(`/?returnTo=${encodeURIComponent(path)}`);
  });
  useEffect(() => {
    if (signedOut) signIn();
  }, [signedOut]);

  if (pending || session.status !== 'signedIn') {
    return (
      <>
        <AppHeader />
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
  const path = useLocation({ select: (location) => location.pathname });
  const headingId = useId();
  const draft = useCustomiserDraft(did);
  // For the monogram cover's preview.
  const profile = useProfile(did);
  const initials = initialsOf(
    profile.data?.displayName || profile.data?.handle || ''
  );
  const { settings, records } = draft;
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
  useUnsavedChangesGuard(
    draft.dirty,
    t`You have unsaved changes. Leave without saving?`
  );

  return (
    <div className={styles.shell}>
      <AppHeader
        actions={
          <CustomiserActions
            dirty={draft.dirty}
            changes={draft.changes}
            saving={draft.saving}
            onSave={() => void draft.save()}
            onReset={draft.discard}
            onOpenStyle={() => setStyleOpen(true)}
            styleButtonRef={styleButton}
          />
        }
      />
      <main className={styles.main}>
        <div className={cn(styles.workspace, className)}>
          <CustomiserSidebar>
            <StyleSidebar
              did={did}
              initials={initials}
              config={settings.config}
              disabled={disabled}
              onChange={update}
            />
          </CustomiserSidebar>
          <LanyardSurface className={styles.canvas}>
            <div className={styles.intro}>
              <h1 id={headingId} className={styles.heading}>
                {t`Customise your lanyard`}
              </h1>
              {(!canEdit || !canKeep || draft.permissionLost) && (
                <PermissionNotice returnTo={path} />
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
            </div>
            <section aria-label={t`Preview`} className={styles.frame}>
              <LanyardEditor
                did={did}
                config={settings.config}
                onChange={update}
                disabled={disabled}
                records={records}
                recordsDisabled={recordsDisabled}
              />
            </section>
          </LanyardSurface>
        </div>
      </main>
      <StyleSheet
        open={styleOpen}
        onOpenChange={setStyleOpen}
        returnFocus={() => styleButton.current?.focus()}
        did={did}
        initials={initials}
        config={settings.config}
        disabled={disabled}
        onChange={update}
      />
    </div>
  );
}
