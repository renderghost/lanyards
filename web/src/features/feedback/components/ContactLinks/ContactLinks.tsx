import { useLingui } from '@lingui/react/macro';

import { Button } from '@/components/Button/Button';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { notify } from '@/components/Toaster/notify';
import { captureError } from '@/lib/analytics/analytics';
import { cn } from '@/lib/utils';

import { BLUESKY_HANDLE, SIGNAL_USERNAME } from '../../feedback.constants';
import * as styles from './ContactLinks.styles';
import type { ContactLinksProps } from './ContactLinks.types';

/**
 * The other ways to reach us (#134): our UserInput board, our Bluesky,
 * and Signal, the private route.
 */
export function ContactLinks({ board, className }: ContactLinksProps) {
  const { t } = useLingui();

  async function copySignal() {
    try {
      await navigator.clipboard.writeText(SIGNAL_USERNAME);
      notify.success(t`Signal username copied`);
    } catch (cause) {
      captureError(cause, { source: 'copy-signal' });
      notify.error(t`Couldn't copy it. Please try again.`);
    }
  }

  return (
    <ul className={cn(styles.list, className)}>
      {board && (
        <li className={styles.item}>
          <ExternalLink href={board.url} className={styles.link}>
            {t`See our feedback board`}
          </ExternalLink>
        </li>
      )}
      <li className={styles.item}>
        <ExternalLink
          href={`https://bsky.app/profile/${BLUESKY_HANDLE}`}
          className={styles.link}
        >
          {t`Follow @${BLUESKY_HANDLE} on Bluesky`}
        </ExternalLink>
      </li>
      <li className={styles.item}>
        <p className={styles.text}>
          {t`Message us privately on Signal:`}{' '}
          <span className={styles.username}>{SIGNAL_USERNAME}</span>
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void copySignal()}
          className={styles.copy}
        >
          {t`Copy Signal username`}
        </Button>
      </li>
    </ul>
  );
}
