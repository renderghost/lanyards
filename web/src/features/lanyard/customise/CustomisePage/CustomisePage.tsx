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
import { profileId } from '@/lib/atproto/profileId';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { usePersonView } from '@/lib/person/usePersonView';
import { cn } from '@/lib/utils';

import { LanyardPage } from '../../components/LanyardPage/LanyardPage';
import { useKeptRecords } from '../../hooks/useKeptRecords';
import { useLanyardDraft } from '../../hooks/useLanyardDraft';
import { CustomiserActions } from '../CustomiserActions/CustomiserActions';
import type { ViewAs } from '../CustomiserActions/CustomiserActions.types';
import { CustomiserToolbar } from '../CustomiserToolbar/CustomiserToolbar';
import { HonorificForm } from '../HonorificForm/HonorificForm';
import { MediaForm } from '../MediaForm/MediaForm';
import { MediaList } from '../MediaList/MediaList';
import { OrcidHelper } from '../OrcidHelper/OrcidHelper';
import { LanyardEditor } from '../LanyardEditor/LanyardEditor';
import { StyleSheet } from '../StyleSheet/StyleSheet';
import { StyleSidebar } from '../StyleSidebar/StyleSidebar';
import { WebLinkForm } from '../WebLinkForm/WebLinkForm';
import { WebLinkList } from '../WebLinkList/WebLinkList';
import { CUSTOMISE_PATH, SIGN_IN_PATH } from './CustomisePage.constants';
import * as styles from './CustomisePage.styles';
import type { CustomisePageProps } from './CustomisePage.types';

/** Kept-record lists the owner adds to and deletes from. */
const KEPT_LISTS = [
  LANYARDS_NSID.webLink,
  LANYARDS_NSID.audio,
  LANYARDS_NSID.video,
] as const;

/**
 * `/lanyard`: the signed-in owner customises their lanyard beside a live
 * preview (spec §7.4). Changes show at once and are a draft until Save, in
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
  const linksId = useId();
  const mediaId = useId();
  const moreId = useId();
  const linksHeading = useRef<HTMLHeadingElement>(null);
  const mediaHeading = useRef<HTMLHeadingElement>(null);
  const lanyard = useLanyardDraft();
  const view = usePersonView(did, { mode: 'owner' });
  const kept = useKeptRecords(did);
  const [viewAs, setViewAs] = useState<ViewAs>('edit');
  /** On phones, the style sheet opened from the bottom toolbar. */
  const [styleOpen, setStyleOpen] = useState(false);
  const styleButton = useRef<HTMLButtonElement>(null);

  const granted = useMemo(() => parseGrantedScope(scope), [scope]);
  const canEdit =
    canWrite(granted, LANYARDS_NSID.lanyard, 'create') &&
    canWrite(granted, LANYARDS_NSID.lanyard, 'update');
  const disabled = !canEdit || !lanyard.ready;
  const canKeep =
    canWrite(granted, LANYARDS_NSID.honorific, 'create') &&
    canWrite(granted, LANYARDS_NSID.honorific, 'update') &&
    KEPT_LISTS.every(
      (collection) =>
        canWrite(granted, collection, 'create') &&
        canWrite(granted, collection, 'delete')
    );
  const { update } = lanyard;
  const editing = viewAs === 'edit';
  useUnsavedChangesGuard(
    lanyard.dirty,
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
            dirty={lanyard.dirty}
            changes={lanyard.changes}
            saving={lanyard.saving}
            onSave={() => void lanyard.save()}
            onReset={lanyard.discard}
          />
        }
      />
      <main className={styles.main}>
        <div className={cn(styles.workspace, className)}>
          {editing && (
            <StyleSidebar
              config={lanyard.config}
              disabled={disabled}
              onChange={update}
            />
          )}
          <div className={styles.canvas}>
            <div className={styles.intro}>
              <h1 id={headingId} className={styles.heading}>
                {t`Customise your lanyard`}
              </h1>
              {!canEdit && <PermissionNotice returnTo={CUSTOMISE_PATH} />}
              {lanyard.invalid && (
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
                    onClick={lanyard.resetInvalid}
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
                  config={lanyard.config}
                  onChange={update}
                  disabled={disabled}
                />
              ) : (
                <LanyardPage did={did} preview="visitor" />
              )}
            </section>
            {editing && (
              <section aria-labelledby={moreId} className={styles.more}>
                <div className={styles.moreIntro}>
                  <h2 id={moreId} className={styles.moreHeading}>
                    {t`More settings`}
                  </h2>
                  <p className={styles.moreHint}>
                    {t`Your links, podcasts, videos and honorific save as soon as you change them.`}
                  </p>
                </div>
                <OrcidHelper
                  did={did}
                  profile={profileId(did, view.hero?.handle)}
                  orcidId={view.orcidId}
                />
                <HonorificForm
                  current={kept.data?.honorific ?? 'none'}
                  disabled={!canKeep || kept.status !== 'success'}
                />
                <section aria-labelledby={linksId} className={styles.kept}>
                  <h2
                    ref={linksHeading}
                    id={linksId}
                    tabIndex={-1}
                    className={styles.subheading}
                  >
                    {t`Your links`}
                  </h2>
                  <WebLinkList
                    links={kept.data?.webLinks ?? []}
                    disabled={!canKeep}
                    onEmptied={() => linksHeading.current?.focus()}
                  />
                  <WebLinkForm disabled={!canKeep} />
                </section>
                <section aria-labelledby={mediaId} className={styles.kept}>
                  <h2
                    ref={mediaHeading}
                    id={mediaId}
                    tabIndex={-1}
                    className={styles.subheading}
                  >
                    {t`Your podcasts and videos`}
                  </h2>
                  <MediaList
                    items={kept.data?.media ?? []}
                    disabled={!canKeep}
                    onEmptied={() => mediaHeading.current?.focus()}
                  />
                  <MediaForm disabled={!canKeep} />
                </section>
              </section>
            )}
          </div>
        </div>
        <CustomiserToolbar
          onOpenStyle={() => setStyleOpen(true)}
          styleButtonRef={styleButton}
          onReset={lanyard.discard}
          dirty={lanyard.dirty}
          changes={lanyard.changes}
        />
      </main>
      <StyleSheet
        open={styleOpen}
        onOpenChange={setStyleOpen}
        returnFocus={() => styleButton.current?.focus()}
        config={lanyard.config}
        disabled={disabled}
        onChange={update}
      />
    </>
  );
}
