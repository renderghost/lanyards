import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useId, useMemo, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { PermissionNotice } from '@/features/auth/components/PermissionNotice/PermissionNotice';
import { useSession } from '@/features/auth/session/useSession';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { canWrite, parseGrantedScope } from '@/lib/atproto/permissions';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { BLOCK_SOURCES } from '@/lib/person/blocks';
import { usePersonView } from '@/lib/person/usePersonView';
import { cn } from '@/lib/utils';

import {
  type ItemActions,
  ItemActionsContext,
} from '../../components/blocks/itemActions';
import { LanyardPage } from '../../components/LanyardPage/LanyardPage';
import { useKeptRecords } from '../../hooks/useKeptRecords';
import { useLanyardConfig } from '../../hooks/useLanyardConfig';
import { AccentPicker } from '../AccentPicker/AccentPicker';
import { BlockEditor } from '../BlockEditor/BlockEditor';
import { HiddenItems } from '../HiddenItems/HiddenItems';
import { HonorificForm } from '../HonorificForm/HonorificForm';
import { ItemMenu } from '../ItemMenu/ItemMenu';
import { MediaForm } from '../MediaForm/MediaForm';
import { MediaList } from '../MediaList/MediaList';
import { OrcidHelper } from '../OrcidHelper/OrcidHelper';
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
 * preview (spec §7.4). Changes show at once and save automatically.
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
      <p role="status" className={styles.loading}>
        {t`Loading…`}
      </p>
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
  const lanyard = useLanyardConfig();
  const view = usePersonView(did, { mode: 'owner' });
  const kept = useKeptRecords(did);
  const [viewAs, setViewAs] = useState<'owner' | 'visitor'>('owner');

  // "Saved" follows a save that finished without an error.
  const [wasSaving, setWasSaving] = useState(lanyard.saving);
  const [saved, setSaved] = useState(false);
  if (lanyard.saving !== wasSaving) {
    setWasSaving(lanyard.saving);
    setSaved(!lanyard.saving && !lanyard.error);
  }

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

  const itemActions = useMemo<ItemActions | null>(
    () =>
      viewAs === 'owner' && !disabled
        ? {
            renderMenu: (itemKey, title) => (
              <ItemMenu
                title={title}
                onHide={() =>
                  update((config) =>
                    config.hidden.includes(itemKey)
                      ? config
                      : { ...config, hidden: [...config.hidden, itemKey] }
                  )
                }
              />
            ),
          }
        : null,
    [viewAs, disabled, update]
  );

  return (
    <div className={cn(styles.page, className)}>
      <section aria-labelledby={headingId} className={styles.controls}>
        <h2 id={headingId} className={styles.heading}>
          {t`Customise your lanyard`}
        </h2>
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
              onClick={lanyard.reset}
            >
              {t`Reset to defaults`}
            </Button>
          </div>
        )}
        <p aria-live="polite" className={styles.status}>
          {lanyard.saving ? t`Saving…` : saved ? t`Saved` : ''}
        </p>
        <AccentPicker
          value={lanyard.config.accent}
          onChange={(accent) => update((config) => ({ ...config, accent }))}
          disabled={disabled}
        />
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={lanyard.config.showJob}
            onChange={(event) => {
              const showJob = event.target.checked;
              update((config) => ({ ...config, showJob }));
            }}
            disabled={disabled}
            className={styles.checkbox}
          />
          <span>{t`Show current job on your badge`}</span>
        </label>
        <BlockEditor
          config={lanyard.config}
          statuses={view.statuses}
          handle={view.hero?.handle ?? did}
          disabled={disabled}
          onChange={update}
          onRetry={(type) => BLOCK_SOURCES[type].forEach(view.retry)}
        />
        <HiddenItems
          items={view.hiddenItems}
          disabled={disabled}
          onShow={(key) =>
            update((config) => ({
              ...config,
              hidden: config.hidden.filter((hidden) => hidden !== key),
            }))
          }
        />
        <OrcidHelper
          did={did}
          handle={view.hero?.handle ?? did}
          orcidId={view.orcidId}
        />
        <HonorificForm
          current={kept.data?.honorific ?? 'none'}
          disabled={!canKeep || kept.status !== 'success'}
        />
        <section aria-labelledby={linksId} className={styles.kept}>
          <h3 id={linksId} className={styles.subheading}>
            {t`Your links`}
          </h3>
          <WebLinkList links={kept.data?.webLinks ?? []} disabled={!canKeep} />
          <WebLinkForm disabled={!canKeep} />
        </section>
        <section aria-labelledby={mediaId} className={styles.kept}>
          <h3 id={mediaId} className={styles.subheading}>
            {t`Your podcasts and videos`}
          </h3>
          <MediaList items={kept.data?.media ?? []} disabled={!canKeep} />
          <MediaForm disabled={!canKeep} />
        </section>
      </section>
      <section aria-label={t`Preview`} className={styles.preview}>
        <div className={styles.previewBar}>
          <Button
            variant="secondary"
            aria-pressed={viewAs === 'visitor'}
            onClick={() =>
              setViewAs((current) =>
                current === 'owner' ? 'visitor' : 'owner'
              )
            }
          >
            {t`View as visitor`}
          </Button>
        </div>
        <ItemActionsContext value={itemActions}>
          <LanyardPage did={did} preview={viewAs} />
        </ItemActionsContext>
      </section>
    </div>
  );
}
