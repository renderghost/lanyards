import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';

import { StylePanel } from '../StylePanel/StylePanel';
import * as styles from './StyleSidebar.styles';
import type { StyleSidebarProps } from './StyleSidebar.types';

/** From `md` up, the style panel pinned to the left of the lanyard. */
export function StyleSidebar(props: StyleSidebarProps) {
  const { t } = useLingui();
  const headingId = useId();
  return (
    <aside aria-labelledby={headingId} className={styles.sidebar}>
      <h2 id={headingId} className={styles.heading}>
        {t`Style`}
      </h2>
      <StylePanel {...props} />
    </aside>
  );
}
