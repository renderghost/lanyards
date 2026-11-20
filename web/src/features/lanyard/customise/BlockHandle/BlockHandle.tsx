import { useLingui } from '@lingui/react/macro';
import { GripVertical } from 'lucide-react';

import { BLOCK_HEADINGS } from '@/features/lanyard/components/LanyardBlocks/LanyardBlocks.constants';

import * as styles from './BlockHandle.styles';
import type { BlockHandleProps } from './BlockHandle.types';

/** The block's drag handle, first in its header row (#122). */
export function BlockHandle({ type, disabled, dragHandle }: BlockHandleProps) {
  const { t, i18n } = useLingui();
  const name = i18n._(BLOCK_HEADINGS[type]);
  return (
    <button
      type="button"
      ref={dragHandle?.ref}
      {...dragHandle?.attributes}
      {...dragHandle?.listeners}
      aria-label={t`Reorder ${name}`}
      disabled={disabled}
      className={styles.handle}
    >
      <GripVertical aria-hidden="true" className={styles.icon} />
    </button>
  );
}
