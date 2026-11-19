import { useLingui } from '@lingui/react/macro';

import { Sheet } from '@/components/Sheet/Sheet';

import { StylePanel } from '../StylePanel/StylePanel';
import * as styles from './StyleSheet.styles';
import type { StyleSheetProps } from './StyleSheet.types';

/** On phones, the style panel in a bottom sheet titled "Style". */
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
    >
      <div className={styles.body}>
        <StylePanel {...panel} />
      </div>
    </Sheet>
  );
}
