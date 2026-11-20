import { use } from 'react';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { ItemActionsContext } from '../itemActions';
import * as styles from './CardLink.styles';
import type { CardLinkProps } from './CardLink.types';

/**
 * A card's one link (#122): what keyboards and screen readers meet. On the
 * public lanyard its card opens it from a click anywhere (CardItem), and
 * shows its focus ring.
 */
export function CardLink({ href, children, label, className }: CardLinkProps) {
  const editing = use(ItemActionsContext) !== null;
  return (
    <ExternalLink
      tone="accent"
      href={href}
      label={label}
      className={cn(styles.link, !editing && styles.onCard, className)}
    >
      {children}
    </ExternalLink>
  );
}
