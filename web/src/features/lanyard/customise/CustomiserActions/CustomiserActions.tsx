import { useLingui } from '@lingui/react/macro';

import { Palette } from 'lucide-react';

import { Button } from '@/components/Button/Button';

import { RESET_WITHOUT_ASKING } from './CustomiserActions.constants';
import * as styles from './CustomiserActions.styles';
import type { CustomiserActionsProps } from './CustomiserActions.types';

/**
 * The customiser's own top-bar controls (#150): the save status, Style on
 * phones, Reset and Save. The header puts Share and Account after them.
 * Save and Reset stay focusable but unavailable with nothing to save.
 */
export function CustomiserActions({
  dirty,
  changes,
  saving,
  onSave,
  onReset,
  onOpenStyle,
  styleButtonRef,
}: CustomiserActionsProps) {
  const { t } = useLingui();
  const resetMessage = t`Discard your unsaved changes?`;

  return (
    <div className={styles.actions}>
      <p role="status" className={styles.status}>
        {saving ? (
          t`Saving…`
        ) : dirty ? (
          <>
            <span className={styles.dot} aria-hidden="true" />
            {t`Unsaved changes`}
          </>
        ) : (
          t`All changes saved`
        )}
      </p>
      <Button
        ref={styleButtonRef}
        size="sm"
        variant="secondary"
        className={styles.style}
        onClick={onOpenStyle}
      >
        <Palette aria-hidden="true" className={styles.icon} />
        {t`Style`}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        aria-disabled={!dirty || saving || undefined}
        onClick={() => {
          if (!dirty || saving) return;
          if (changes > RESET_WITHOUT_ASKING && !window.confirm(resetMessage)) {
            return;
          }
          onReset();
        }}
      >
        {t`Reset`}
      </Button>
      <Button
        size="sm"
        aria-disabled={!dirty || undefined}
        loading={saving}
        onClick={() => {
          if (dirty) onSave();
        }}
      >
        {t`Save`}
      </Button>
    </div>
  );
}
