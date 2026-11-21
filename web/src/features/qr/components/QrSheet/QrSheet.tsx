import { useLingui } from '@lingui/react/macro';
import { Link2, Share as ShareIcon, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { Logo } from '@/components/Logo/Logo';
import { QrCode } from '@/components/QrCode/QrCode';
import { notify } from '@/components/Toaster/notify';
import { useWakeLock } from '@/hooks/useWakeLock';
import { captureError } from '@/lib/analytics/analytics';
import { heroName } from '@/lib/person/hero';

import { qrUrl } from '../../qrUrl';
import { useOwnerBadge } from '../../useOwnerBadge';
import { LanyardRibbon } from '../LanyardRibbon/LanyardRibbon';
import { NAME_LENGTHS } from './QrSheet.constants';
import * as styles from './QrSheet.styles';
import type { QrSheetProps } from './QrSheet.types';

type NameSize = 'large' | 'medium' | 'small';

const nameSize = (name: string): NameSize => {
  const length = [...name].length;
  if (length <= NAME_LENGTHS.large) return 'large';
  if (length <= NAME_LENGTHS.medium) return 'medium';
  return 'small';
};

/** Whether this browser can open the device's share sheet. */
const canShare = () =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

/**
 * The Share badge (spec §8, #169): the owner's badge in a clear sleeve,
 * on a lanyard printed with their handle, with the code to their lanyard
 * and their avatar in its centre. Share opens the device's share sheet
 * where there is one; Copy link is the code's text alternative. It wears
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
  const size = nameSize(name);
  const url = qrUrl(did);
  // An avatar that won't load gives way to the initials, not a blank disc.
  const [brokenAvatar, setBrokenAvatar] = useState<string | null>(null);
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

  async function share() {
    try {
      await navigator.share({ title: name, text: t`${name} on Lanyards`, url });
    } catch (cause) {
      // Closing the share sheet without sharing isn't a failure.
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      captureError(cause, { source: 'share-link' });
      notify.error(t`Couldn't open sharing. Copy the link instead.`);
    }
  }

  const role = hero?.role
    ? [hero.role.title, hero.role.company].filter(Boolean).join(' · ')
    : undefined;
  const meta = hero
    ? [hero.pronouns, `@${hero.handle}`].filter(Boolean).join(' · ')
    : undefined;
  const avatar =
    hero?.avatar && hero.avatar !== brokenAvatar ? hero.avatar : undefined;
  const centre = avatar ? (
    <img
      src={avatar}
      alt=""
      onError={() => setBrokenAvatar(avatar)}
      className={styles.avatar}
    />
  ) : (
    <span className={styles.initials.avatar}>{hero?.initials ?? ''}</span>
  );

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
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{t`Share`}</p>
            <Dialog.Title className={styles.titles[size]}>{name}</Dialog.Title>
            <Dialog.Description className={styles.hint}>
              {t`Point a camera at the code to open my lanyard, or send the link.`}
            </Dialog.Description>
          </div>
          <div className={styles.hang}>
            {hero && (
              <LanyardRibbon
                text={`@${hero.handle}`}
                className={styles.ribbon}
              />
            )}
            <div className={styles.sleeve}>
              <span aria-hidden="true" className={styles.slot} />
              <span aria-hidden="true" className={styles.glare} />
              <div className={styles.card}>
                <div aria-hidden="true" className={styles.top}>
                  <Logo
                    fixed={accent === 'blue' ? 'lime' : 'blue'}
                    className={styles.mark}
                  />
                  <span className={styles.site}>lanyards.app</span>
                </div>
                <div className={styles.scan}>
                  <div className={styles.code}>
                    <QrCode value={url} centre={centre} />
                  </div>
                  <p className={styles.prompt}>{t`Scan to see my lanyard`}</p>
                </div>
                <div className={styles.who}>
                  {/* The dialog's title says the name to screen readers. */}
                  <p aria-hidden="true" className={styles.names[size]}>
                    {name}
                  </p>
                  {meta && <p className={styles.meta}>{meta}</p>}
                </div>
                {(role || hero?.location) && (
                  <dl className={styles.strip}>
                    {role && (
                      <div className={styles.cell}>
                        <dt className={styles.label}>{t`Now`}</dt>
                        <dd className={styles.value}>{role}</dd>
                      </div>
                    )}
                    {hero?.location && (
                      <div className={styles.cell}>
                        <dt className={styles.label}>{t`Based`}</dt>
                        <dd className={styles.value}>{hero.location}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            {canShare() && (
              <Button
                tone="badge"
                size="lg"
                onClick={() => void share()}
                className={styles.share}
              >
                <ShareIcon aria-hidden="true" className={styles.icon} />
                {t`Share`}
              </Button>
            )}
            <Button
              tone="badge"
              variant="secondary"
              size="lg"
              onClick={() => void copy()}
              className={styles.copy}
            >
              <Link2 aria-hidden="true" className={styles.icon} />
              {t`Copy link`}
            </Button>
            <Dialog.Close aria-label={t`Close`} className={styles.close}>
              <X aria-hidden="true" className={styles.closeIcon} />
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
