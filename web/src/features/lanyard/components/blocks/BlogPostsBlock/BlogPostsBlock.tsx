import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import * as styles from './BlogPostsBlock.styles';
import type { BlogPostsBlockProps } from './BlogPostsBlock.types';

/** The latest standard.site posts. */
export function BlogPostsBlock({ items, className }: BlogPostsBlockProps) {
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((post) => (
        <li key={post.key} className={styles.item}>
          <ExternalLink href={post.url} className={styles.title}>
            {post.title}
          </ExternalLink>
          <p className={styles.meta}>
            {[post.publicationName, formatPartialDate(post.publishedAt)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </li>
      ))}
    </ul>
  );
}
