import { useLingui } from '@lingui/react/macro';
import { use } from 'react';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { ItemActionsContext } from '../itemActions';
import * as styles from './PillItem.styles';
import type { PillItemProps } from './PillItem.types';

/**
 * One short item as a pill: a link (with its icon) or a plain label. On
 * the public lanyard a linked pill is the link; in the customiser the pill
 * holds the link and its show/hide toggle side by side, and a hidden pill
 * stays in place, dashed (#122).
 */
export function PillItem({
  itemKey,
  title,
  label,
  href,
  icon,
  className,
}: PillItemProps) {
  const { t } = useLingui();
  const actions = use(ItemActionsContext);
  const content = (
    <>
      {icon}
      <span className={styles.label}>{label}</span>
    </>
  );

  if (!actions) {
    const shape = cn(styles.pill, styles.plain, className);
    return href ? (
      <ExternalLink
        tone="accent"
        href={href}
        className={cn(shape, styles.link)}
      >
        {content}
      </ExternalLink>
    ) : (
      <span className={shape}>{content}</span>
    );
  }

  const hidden = actions.isHidden(itemKey);
  const inner = cn(styles.content, hidden && styles.faded);
  return (
    <span
      data-hidden={hidden ? 'true' : undefined}
      className={cn(
        styles.pill,
        styles.editing,
        hidden && styles.hidden,
        className
      )}
    >
      {href ? (
        <ExternalLink tone="accent" href={href} className={inner}>
          {content}
        </ExternalLink>
      ) : (
        <span className={inner}>{content}</span>
      )}
      {hidden && <span className={styles.srOnly}>{t`(hidden)`}</span>}
      {actions.renderToggle(itemKey, title)}
    </span>
  );
}
