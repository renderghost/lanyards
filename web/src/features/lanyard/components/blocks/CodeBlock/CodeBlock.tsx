import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import * as styles from './CodeBlock.styles';
import type { CodeBlockProps } from './CodeBlock.types';

/** Recent repositories on Tangled. */
export function CodeBlock({ items, className }: CodeBlockProps) {
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((repo) => (
        <li key={repo.key} className={styles.item}>
          <ExternalLink href={repo.url} className={styles.title}>
            {repo.name}
          </ExternalLink>
          {repo.description && (
            <p className={styles.meta}>{repo.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
