import { SupportLinks } from '@/features/feedback/components/SupportLinks/SupportLinks';
import { cn } from '@/lib/utils';

import * as styles from './CustomiserSidebar.styles';
import type { CustomiserSidebarProps } from './CustomiserSidebar.types';

/**
 * From `md` up, the customiser's left column: the style sidebar while
 * editing, and "Beta support" pinned at its foot at all times (#134).
 */
export function CustomiserSidebar({
  children,
  className,
}: CustomiserSidebarProps) {
  return (
    <div className={cn(styles.sidebar, className)}>
      <div className={styles.scroll}>{children}</div>
      <SupportLinks className={styles.support} />
    </div>
  );
}
