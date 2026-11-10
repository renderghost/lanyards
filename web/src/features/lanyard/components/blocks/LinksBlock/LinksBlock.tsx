import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { PlatformIcon } from '@/components/PlatformIcon/PlatformIcon';
import { cn } from '@/lib/utils';

import * as styles from './LinksBlock.styles';
import type { LinksBlockProps } from './LinksBlock.types';

/** Important links with platform icons (spec §7.2). */
export function LinksBlock({ items, className }: LinksBlockProps) {
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((item) => (
        <li key={item.key}>
          <ExternalLink href={item.url} className={styles.link}>
            {item.iconUrl ? (
              <img
                src={item.iconUrl}
                alt=""
                width={20}
                height={20}
                className={styles.icon}
              />
            ) : (
              <PlatformIcon platform={item.platform} />
            )}
            <span className={styles.title}>{item.title}</span>
          </ExternalLink>
        </li>
      ))}
    </ul>
  );
}
