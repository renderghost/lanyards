import { useLingui } from '@lingui/react/macro';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { PLATFORM_LABELS, TYPE_LABELS } from './MediaBlock.constants';
import * as styles from './MediaBlock.styles';
import type { MediaBlockProps } from './MediaBlock.types';

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** Podcasts, videos and interviews from the person's Lanyards records. */
export function MediaBlock({ items, className }: MediaBlockProps) {
  const { i18n } = useLingui();
  const label = (labels: typeof TYPE_LABELS, value?: string) => {
    const message = value ? labels[value] : undefined;
    return message ? i18n._(message) : undefined;
  };
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((media) => {
        const meta = [
          label(TYPE_LABELS, media.type),
          label(PLATFORM_LABELS, media.platform),
        ].filter(Boolean);
        return (
          <li key={media.key} className={styles.item}>
            <ExternalLink href={media.url} className={styles.title}>
              {media.title ?? hostOf(media.url)}
            </ExternalLink>
            {meta.length > 0 && (
              <p className={styles.meta}>{meta.join(' · ')}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
