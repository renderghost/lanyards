import { useLingui } from '@lingui/react/macro';

import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { CardLink } from '../CardLink/CardLink';
import { itemTitle } from '../itemTitle';
import * as styles from './BskyPostsBlock.styles';
import type { BskyPostsBlockProps } from './BskyPostsBlock.types';

/**
 * The latest Bluesky posts, without replies or reposts, as cards (#122):
 * the text is plain, and the date is the card's one link to the post.
 */
export function BskyPostsBlock({ items, className }: BskyPostsBlockProps) {
  const { t, i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((post) => {
        const date = formatPartialDate(post.createdAt);
        return (
          <li key={post.key}>
            <CardItem
              itemKey={post.key}
              title={itemTitle('bskyPosts', post, i18n)}
            >
              <p className={styles.text}>{post.text}</p>
              <CardLink
                href={post.url}
                label={t`Post on Bluesky, ${date}`}
                className={styles.date}
              >
                <time dateTime={post.createdAt}>{date}</time>
              </CardLink>
            </CardItem>
          </li>
        );
      })}
    </ul>
  );
}
