import { useLingui } from '@lingui/react/macro';

import { AccountLink } from '@/components/AccountLink/AccountLink';
import { Button } from '@/components/Button/Button';
import { ToggleGroup } from '@/components/ToggleGroup/ToggleGroup';
import { ShowQrButton } from '@/features/qr/components/ShowQrButton/ShowQrButton';

import { RESET_WITHOUT_ASKING } from './CustomiserActions.constants';
import * as styles from './CustomiserActions.styles';
import type { CustomiserActionsProps, ViewAs } from './CustomiserActions.types';

/**
 * The customiser's top-bar controls: Edit / View as public, the save
 * status, Reset and Save, then Show QR and the account link. Save and
 * Reset stay focusable but unavailable when there's nothing to save.
 */
export function CustomiserActions({
  viewAs,
  onViewAsChange,
  dirty,
  changes,
  saving,
  onSave,
  onReset,
}: CustomiserActionsProps) {
  const { t } = useLingui();
  const resetMessage = t`Discard your unsaved changes?`;

  return (
    <div className={styles.actions}>
      <ToggleGroup<ViewAs>
        label={t`Preview mode`}
        value={viewAs}
        onValueChange={onViewAsChange}
        options={[
          { value: 'edit', label: t`Edit` },
          { value: 'public', label: t`View as public`, shortLabel: t`Public` },
        ]}
      />
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
        size="sm"
        variant="secondary"
        aria-disabled={!dirty || saving || undefined}
        className={styles.reset}
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
      <div className={styles.account}>
        <ShowQrButton />
        <AccountLink />
      </div>
    </div>
  );
}
