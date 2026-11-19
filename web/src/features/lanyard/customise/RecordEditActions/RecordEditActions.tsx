import { useLingui } from '@lingui/react/macro';
import { Pencil, Trash2 } from 'lucide-react';

import { IconButton } from '@/components/IconButton/IconButton';

import * as styles from './RecordEditActions.styles';
import type { RecordEditActionsProps } from './RecordEditActions.types';

/**
 * Edit and Delete for one kept record, beside its show/hide control.
 * Unavailable rather than disabled, so they keep focus while saving.
 */
export function RecordEditActions({
  title,
  onEdit,
  onDelete,
  editRef,
  disabled = false,
}: RecordEditActionsProps) {
  const { t } = useLingui();
  const guarded = (action: () => void) => () => {
    if (!disabled) action();
  };
  return (
    <div className={styles.actions}>
      <IconButton
        ref={editRef}
        label={t`Edit ${title}`}
        icon={<Pencil />}
        aria-disabled={disabled || undefined}
        onClick={guarded(onEdit)}
      />
      <IconButton
        label={t`Delete ${title}`}
        icon={<Trash2 />}
        aria-disabled={disabled || undefined}
        onClick={guarded(onDelete)}
      />
    </div>
  );
}
