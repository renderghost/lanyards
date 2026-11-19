import { useLingui } from '@lingui/react/macro';

import { hostOf } from '@/lib/normalise';
import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { CardLink } from '../CardLink/CardLink';
import { itemTitle } from '../itemTitle';
import { PLATFORM_LABELS, TYPE_LABELS } from './MediaBlock.constants';
import * as styles from './MediaBlock.styles';
import type { MediaBlockProps } from './MediaBlock.types';

/**
 * Podcasts, videos and interviews from the person's Lanyards records, as
 * cards opening each in a new tab (#122).
 */
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
          <li key={media.key}>
            <CardItem
              itemKey={media.key}
              title={itemTitle('media', media, i18n)}
            >
              <CardLink href={media.url} className={styles.title}>
                {media.title ?? hostOf(media.url)}
              </CardLink>
              {meta.length > 0 && (
                <p className={styles.meta}>{meta.join(' · ')}</p>
              )}
            </CardItem>
          </li>
        );
      })}
    </ul>
  );
}
