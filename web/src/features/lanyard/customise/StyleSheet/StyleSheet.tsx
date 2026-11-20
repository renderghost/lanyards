import { useLingui } from '@lingui/react/macro';

import { Sheet } from '@/components/Sheet/Sheet';
import { SupportLinks } from '@/features/feedback/components/SupportLinks/SupportLinks';

import { StylePanel } from '../StylePanel/StylePanel';
import * as styles from './StyleSheet.styles';
import type { StyleSheetProps } from './StyleSheet.types';

/**
 * On phones, the style panel in a bottom sheet titled "Style", with
 * "Beta support" pinned at its foot, as in the sidebar (#134).
 */
export function StyleSheet({
  open,
  onOpenChange,
  returnFocus,
  ...panel
}: StyleSheetProps) {
  const { t } = useLingui();
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t`Style`}
      returnFocus={returnFocus}
      footer={
        <SupportLinks
          // Feedback opens over the page, so the sheet closes first.
          onChoose={() => onOpenChange(false)}
          returnFocus={returnFocus}
          className={styles.support}
        />
      }
    >
      <div className={styles.body}>
        <StylePanel {...panel} />
      </div>
    </Sheet>
  );
}
