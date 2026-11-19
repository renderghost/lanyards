import { useLingui } from '@lingui/react/macro';

import { PlatformIcon } from '@/components/PlatformIcon/PlatformIcon';
import { cn } from '@/lib/utils';

import { itemTitle } from '../itemTitle';
import { PillItem } from '../PillItem/PillItem';
import * as styles from './LinksBlock.styles';
import type { LinksBlockProps } from './LinksBlock.types';

/** Important links as pills, each with its icon (spec §7.2, #122). */
export function LinksBlock({ items, className }: LinksBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.pills, className)}>
      {items.map((item) => (
        <li key={item.key} className={styles.item}>
          <PillItem
            itemKey={item.key}
            title={itemTitle('links', item, i18n)}
            label={item.title}
            href={item.url}
            icon={
              item.iconUrl ? (
                <img
                  src={item.iconUrl}
                  alt=""
                  width={20}
                  height={20}
                  className={styles.icon}
                />
              ) : (
                <PlatformIcon platform={item.platform} />
              )
            }
          />
        </li>
      ))}
    </ul>
  );
}
