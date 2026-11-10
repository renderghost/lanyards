import { useLingui } from '@lingui/react/macro';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import * as styles from './CollectionsBlock.styles';
import type { CollectionsBlockProps } from './CollectionsBlock.types';

/** Semble collections and their latest links (no third-party images). */
export function CollectionsBlock({ items, className }: CollectionsBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((collection) => (
        <li key={collection.key} className={styles.item}>
          <ItemFrame
            itemKey={collection.key}
            title={itemTitle('collections', collection, i18n)}
          >
            <ExternalLink href={collection.url} className={styles.title}>
              {collection.name}
            </ExternalLink>
            {collection.description && (
              <p className={styles.meta}>{collection.description}</p>
            )}
            {collection.links.length > 0 && (
              <ul className={styles.links}>
                {collection.links.map((link) => (
                  <li key={link.key} className={styles.link}>
                    <ExternalLink href={link.url}>{link.title}</ExternalLink>
                    {link.siteName && (
                      <span className={styles.meta}> · {link.siteName}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ItemFrame>
        </li>
      ))}
    </ul>
  );
}
