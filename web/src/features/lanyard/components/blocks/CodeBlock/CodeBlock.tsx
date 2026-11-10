import { useLingui } from '@lingui/react/macro';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import * as styles from './CodeBlock.styles';
import type { CodeBlockProps } from './CodeBlock.types';

/** Recent repositories on Tangled. */
export function CodeBlock({ items, className }: CodeBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((repo) => (
        <li key={repo.key} className={styles.item}>
          <ItemFrame itemKey={repo.key} title={itemTitle('code', repo, i18n)}>
            <ExternalLink href={repo.url} className={styles.title}>
              {repo.name}
            </ExternalLink>
            {repo.description && (
              <p className={styles.meta}>{repo.description}</p>
            )}
          </ItemFrame>
        </li>
      ))}
    </ul>
  );
}
