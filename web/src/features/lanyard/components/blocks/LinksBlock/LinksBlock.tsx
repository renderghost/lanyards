import { useLingui } from '@lingui/react/macro';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { PlatformIcon } from '@/components/PlatformIcon/PlatformIcon';
import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import * as styles from './LinksBlock.styles';
import type { LinksBlockProps } from './LinksBlock.types';

/** Important links with platform icons (spec §7.2). */
export function LinksBlock({ items, className }: LinksBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((item) => (
        <li key={item.key}>
          <ItemFrame itemKey={item.key} title={itemTitle('links', item, i18n)}>
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
          </ItemFrame>
        </li>
      ))}
    </ul>
  );
}
