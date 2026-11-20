import { FeedbackButton } from '@/features/feedback/components/FeedbackButton/FeedbackButton';
import { cn } from '@/lib/utils';

import * as styles from './SiteFooter.styles';
import type { SiteFooterProps } from './SiteFooter.types';

/**
 * The foot of every page: "Send feedback" (#134). It reopens feedback when
 * the page comes back from the permission sign-in.
 */
export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn(styles.footer, className)}>
      <FeedbackButton autoOpen />
    </footer>
  );
}
