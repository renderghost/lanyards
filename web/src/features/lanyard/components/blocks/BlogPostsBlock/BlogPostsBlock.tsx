import { useLingui } from '@lingui/react/macro';
import { FileText } from 'lucide-react';

import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { CardLink } from '../CardLink/CardLink';
import { itemTitle } from '../itemTitle';
import * as styles from './BlogPostsBlock.styles';
import type { BlogPostsBlockProps } from './BlogPostsBlock.types';

/** The latest standard.site posts, as cards with their covers (#122). */
export function BlogPostsBlock({ items, className }: BlogPostsBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((post) => (
        <li key={post.key}>
          <CardItem
            itemKey={post.key}
            title={itemTitle('blogPosts', post, i18n)}
            thumbnail={
              post.thumbnail ? (
                <img src={post.thumbnail} alt="" loading="lazy" />
              ) : (
                <FileText aria-hidden="true" />
              )
            }
          >
            <CardLink href={post.url} className={styles.title}>
              {post.title}
            </CardLink>
            <p className={styles.meta}>
              {[post.publicationName, formatPartialDate(post.publishedAt)]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </CardItem>
        </li>
      ))}
    </ul>
  );
}
