import { useLingui } from '@lingui/react/macro';

import { Sheet } from '@/components/Sheet/Sheet';

import { SupportLinks } from '../SupportLinks/SupportLinks';
import * as styles from './SupportSheet.styles';
import type { SupportSheetProps } from './SupportSheet.types';

/**
 * On phones, "Beta support" from the customiser's toolbar (#134). Sending
 * feedback closes the sheet first; focus comes back to the toolbar after.
 */
export function SupportSheet({
  open,
  onOpenChange,
  returnFocus,
}: SupportSheetProps) {
  const { t } = useLingui();
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t`Beta support`}
      returnFocus={returnFocus}
    >
      <SupportLinks
        heading={false}
        onChoose={() => onOpenChange(false)}
        returnFocus={returnFocus}
        className={styles.body}
      />
    </Sheet>
  );
}
