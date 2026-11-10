import { useLingui } from '@lingui/react/macro';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { RichText } from '@/components/RichText/RichText';
import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import * as styles from './BskyPostsBlock.styles';
import type { BskyPostsBlockProps } from './BskyPostsBlock.types';

/** The latest Bluesky posts, without replies or reposts. */
export function BskyPostsBlock({ items, className }: BskyPostsBlockProps) {
  const { t } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((post) => {
        const date = formatPartialDate(post.createdAt);
        return (
          <li key={post.key} className={styles.post}>
            <RichText text={post.text} facets={post.facets} />
            <p className={styles.footer}>
              <time dateTime={post.createdAt}>{date}</time>
              {' · '}
              <ExternalLink href={post.url}>{t`View on Bluesky`}</ExternalLink>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
