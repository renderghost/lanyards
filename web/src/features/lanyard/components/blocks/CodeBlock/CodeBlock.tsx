import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { CardLink } from '../CardLink/CardLink';
import { itemTitle } from '../itemTitle';
import * as styles from './CodeBlock.styles';
import type { CodeBlockProps } from './CodeBlock.types';

/** Code repositories from Tangled, as cards opening each one (#122). */
export function CodeBlock({ items, className }: CodeBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((repo) => (
        <li key={repo.key}>
          <CardItem itemKey={repo.key} title={itemTitle('code', repo, i18n)}>
            <CardLink href={repo.url} className={styles.title}>
              {repo.name}
            </CardLink>
            {repo.description && (
              <p className={styles.meta}>{repo.description}</p>
            )}
          </CardItem>
        </li>
      ))}
    </ul>
  );
}
