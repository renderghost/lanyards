import { useLingui } from '@lingui/react/macro';
import { Dialog } from 'radix-ui';

import { Button } from '@/components/Button/Button';
import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { QrCode } from '@/components/QrCode/QrCode';
import { notify } from '@/components/Toaster/notify';
import { coverFor } from '@/design/covers';
import { useWakeLock } from '@/hooks/useWakeLock';
import { captureError } from '@/lib/analytics/analytics';
import { heroName } from '@/lib/person/hero';

import { qrUrl } from '../../qrUrl';
import { useOwnerBadge } from '../../useOwnerBadge';
import { LanyardStraps } from '../LanyardStraps/LanyardStraps';
import { NAME_LENGTHS } from './QrSheet.constants';
import * as styles from './QrSheet.styles';
import type { QrSheetProps } from './QrSheet.types';

const nameSize = (name: string): keyof typeof styles.names => {
  const length = [...name].length;
  if (length <= NAME_LENGTHS.large) return 'large';
  if (length <= NAME_LENGTHS.medium) return 'medium';
  return 'small';
};

/**
 * The Share badge (spec §8): the owner's badge, full screen, with the
 * code to their lanyard and Copy link as its text alternative. It wears
 * the owner's accent on itself alone, never on the page behind, which may
 * be someone else's lanyard. Keeps the screen awake while open.
 */
export function QrSheet({
  did,
  open,
  onOpenChange,
  returnFocus,
}: QrSheetProps) {
  const { t } = useLingui();
  const { hero, accent } = useOwnerBadge(did);
  const name = hero ? heroName(hero) : t`Your lanyard`;
  const url = qrUrl(did);
  useWakeLock(open);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      notify.success(t`Link copied`);
    } catch (cause) {
      captureError(cause, { source: 'copy-link' });
      notify.error(t`Couldn't copy the link. Please try again.`);
    }
  }

  const role = hero?.role
    ? [hero.role.title, hero.role.company].filter(Boolean).join(' · ')
    : undefined;
  const meta = hero
    ? [hero.pronouns, `@${hero.handle}`].filter(Boolean).join(' · ')
    : undefined;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          data-accent={accent}
          className={styles.content}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus();
          }}
        >
          <div className={styles.badge}>
            <LanyardStraps className={styles.straps} />
            <div className={styles.card}>
              <div className={styles.cover}>
                <CoverPattern
                  pattern={hero?.cover ?? coverFor(did)}
                  initials={hero?.initials ?? ''}
                />
                <span className={styles.slot} aria-hidden="true" />
              </div>
              <div className={styles.body}>
                <div className={styles.identity}>
                  <Dialog.Title className={styles.names[nameSize(name)]}>
                    {name}
                  </Dialog.Title>
                  {role && <p className={styles.role}>{role}</p>}
                  {meta && <p className={styles.meta}>{meta}</p>}
                </div>
                <div className={styles.scan}>
                  <div className={styles.code}>
                    <QrCode value={url} />
                  </div>
                  <Dialog.Description className={styles.description}>
                    {t`Scan to see my lanyard`}
                  </Dialog.Description>
                </div>
              </div>
              <div className={styles.strip}>
                {hero?.location && (
                  <dl className={styles.based}>
                    <dt className={styles.label}>{t`Based`}</dt>
                    <dd className={styles.value}>{hero.location}</dd>
                  </dl>
                )}
                <span className={styles.site}>lanyards.app</span>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              tone="badge"
              size="lg"
              onClick={() => void copy()}
              className={styles.copy}
            >
              {t`Copy link`}
            </Button>
            <Dialog.Close asChild>
              <Button tone="badge" size="lg" className={styles.close}>
                {t`Close`}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
