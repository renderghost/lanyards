import { useLingui } from '@lingui/react/macro';
import { BadgeCheck } from 'lucide-react';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import * as styles from './PublicationsBlock.styles';
import type { PublicationsBlockProps } from './PublicationsBlock.types';

/** Publications from ORCID and Sifa, with a tick for verified ORCID works. */
export function PublicationsBlock({
  items,
  className,
}: PublicationsBlockProps) {
  const { t, i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((publication) => {
        const href =
          publication.url ??
          (publication.doi ? `https://doi.org/${publication.doi}` : undefined);
        return (
          <li key={publication.key} className={styles.item}>
            <ItemFrame
              itemKey={publication.key}
              title={itemTitle('publications', publication, i18n)}
            >
              <div className={styles.heading}>
                {href ? (
                  <ExternalLink href={href} className={styles.title}>
                    {publication.title}
                  </ExternalLink>
                ) : (
                  <p className={styles.title}>{publication.title}</p>
                )}
                {publication.orcidVerified && (
                  <span
                    role="img"
                    aria-label={t`Verified on ORCID`}
                    className={styles.verified}
                  >
                    <BadgeCheck
                      aria-hidden="true"
                      className={styles.verifiedIcon}
                    />
                  </span>
                )}
              </div>
              <p className={styles.meta}>
                {[publication.venue, publication.year]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </ItemFrame>
          </li>
        );
      })}
    </ul>
  );
}
