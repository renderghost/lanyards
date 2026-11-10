import { useLingui } from '@lingui/react/macro';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import * as styles from './BlogPostsBlock.styles';
import type { BlogPostsBlockProps } from './BlogPostsBlock.types';

/** The latest standard.site posts. */
export function BlogPostsBlock({ items, className }: BlogPostsBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((post) => (
        <li key={post.key} className={styles.item}>
          <ItemFrame
            itemKey={post.key}
            title={itemTitle('blogPosts', post, i18n)}
          >
            <ExternalLink href={post.url} className={styles.title}>
              {post.title}
            </ExternalLink>
            <p className={styles.meta}>
              {[post.publicationName, formatPartialDate(post.publishedAt)]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </ItemFrame>
        </li>
      ))}
    </ul>
  );
}
