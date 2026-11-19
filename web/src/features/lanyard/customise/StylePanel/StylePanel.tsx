import { useLingui } from '@lingui/react/macro';

import { Accordion } from '@/components/Accordion/Accordion';

import { AccentPicker } from '../AccentPicker/AccentPicker';
import { OPEN_AT_FIRST, SECTIONS } from './StylePanel.constants';
import * as styles from './StylePanel.styles';
import type { StylePanelProps } from './StylePanel.types';

/**
 * The lanyard's visual settings, and nothing else (#118): the accent and
 * the badge, as stacked disclosures.
 */
export function StylePanel({ config, disabled, onChange }: StylePanelProps) {
  const { t } = useLingui();
  return (
    <div className={styles.panel}>
      <Accordion
        defaultOpen={OPEN_AT_FIRST}
        items={[
          {
            id: SECTIONS.accent,
            title: t`Accent colour`,
            content: (
              <AccentPicker
                value={config.accent}
                onChange={(accent) =>
                  onChange((current) => ({ ...current, accent }))
                }
                disabled={disabled}
                hideLabel
              />
            ),
          },
          {
            id: SECTIONS.badge,
            title: t`Badge`,
            content: (
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={config.showJob}
                  onChange={(event) => {
                    const showJob = event.target.checked;
                    onChange((current) => ({ ...current, showJob }));
                  }}
                  disabled={disabled}
                  className={styles.checkbox}
                />
                <span>{t`Show current job`}</span>
              </label>
            ),
          },
        ]}
      />
      <p className={styles.note}>
        {t`Blocks, links and items are edited on your lanyard.`}
      </p>
    </div>
  );
}
