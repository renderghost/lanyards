import { useLingui } from '@lingui/react/macro';
import { AtSign, Info, MessageCircleHeart, MessageSquare } from 'lucide-react';
import { useId, useRef } from 'react';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import {
  BLUESKY_HANDLE,
  DOCS_URL,
  SIGNAL_GROUP_URL,
} from '../../feedback.constants';
import { useFeedback } from '../../useFeedback';
import * as styles from './SupportLinks.styles';
import type { SupportLinksProps } from './SupportLinks.types';

/**
 * "Beta support" (#134): give feedback, read the docs, join our Signal
 * group, or connect with us on Bluesky.
 */
export function SupportLinks({
  onChoose,
  returnFocus,
  className,
}: SupportLinksProps) {
  const { t } = useLingui();
  const id = useId();
  const feedback = useFeedback();
  const button = useRef<HTMLButtonElement>(null);

  return (
    <section aria-labelledby={id} className={cn(styles.section, className)}>
      <h2 id={id} className={styles.heading}>
        {t`Beta support`}
      </h2>
      <ul className={styles.list}>
        <li>
          <button
            ref={button}
            type="button"
            className={styles.item}
            onClick={() => {
              onChoose?.();
              feedback.show(returnFocus ?? (() => button.current?.focus()));
            }}
          >
            <MessageSquare aria-hidden="true" className={styles.icon} />
            {t`Give feedback`}
          </button>
        </li>
        <li>
          <ExternalLink href={DOCS_URL} className={styles.item}>
            <Info aria-hidden="true" className={styles.icon} />
            {t`Documentation`}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink href={SIGNAL_GROUP_URL} className={styles.item}>
            <MessageCircleHeart aria-hidden="true" className={styles.icon} />
            {t`Signal group`}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink
            href={`https://bsky.app/profile/${BLUESKY_HANDLE}`}
            className={styles.item}
          >
            <AtSign aria-hidden="true" className={styles.icon} />
            {t`Connect on Bluesky`}
          </ExternalLink>
        </li>
      </ul>
    </section>
  );
}
