import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { CardLink } from '../CardLink/CardLink';
import { itemTitle } from '../itemTitle';
import * as styles from './CollectionsBlock.styles';
import type { CollectionsBlockProps } from './CollectionsBlock.types';

/**
 * Semble collections, as cards opening each collection (#122). Their
 * links aren't listed: the collection is the thing to open.
 */
export function CollectionsBlock({ items, className }: CollectionsBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((collection) => (
        <li key={collection.key}>
          <CardItem
            itemKey={collection.key}
            title={itemTitle('collections', collection, i18n)}
          >
            <CardLink href={collection.url} className={styles.title}>
              {collection.name}
            </CardLink>
            {collection.description && (
              <p className={styles.description}>{collection.description}</p>
            )}
          </CardItem>
        </li>
      ))}
    </ul>
  );
}
