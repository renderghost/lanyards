import { useLingui } from '@lingui/react/macro';
import { BadgeCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { CardLink } from '../CardLink/CardLink';
import { itemTitle } from '../itemTitle';
import * as styles from './PublicationsBlock.styles';
import type { PublicationsBlockProps } from './PublicationsBlock.types';

/** Publications, as cards opening their DOI or page (#122). */
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
          <li key={publication.key}>
            <CardItem
              itemKey={publication.key}
              title={itemTitle('publications', publication, i18n)}
            >
              <div className={styles.heading}>
                {href ? (
                  <CardLink href={href} className={styles.title}>
                    {publication.title}
                  </CardLink>
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
            </CardItem>
          </li>
        );
      })}
    </ul>
  );
}
