import { use } from 'react';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { ItemActionsContext } from '../itemActions';
import * as styles from './CardLink.styles';
import type { CardLinkProps } from './CardLink.types';

/**
 * A card's one link (#122). On the public lanyard it covers the card, so
 * a click anywhere opens it; in the customiser it's a plain link, so a
 * stray click while arranging doesn't leave the page.
 */
export function CardLink({ href, children, label, className }: CardLinkProps) {
  const editing = use(ItemActionsContext) !== null;
  return (
    <ExternalLink
      tone="accent"
      href={href}
      label={label}
      className={cn(styles.link, !editing && styles.stretched, className)}
    >
      {children}
    </ExternalLink>
  );
}
