import { useLingui } from '@lingui/react/macro';

import { Accordion } from '@/components/Accordion/Accordion';
import { coverFor } from '@/design/covers';
import { track } from '@/lib/analytics/analytics';

import { AccentPicker } from '../AccentPicker/AccentPicker';
import { CoverPicker } from '../CoverPicker/CoverPicker';
import {
  BADGE_SETTINGS,
  OPEN_AT_FIRST,
  SECTIONS,
} from './StylePanel.constants';
import * as styles from './StylePanel.styles';
import type { StylePanelProps } from './StylePanel.types';

/**
 * The lanyard's visual settings, and nothing else (#118): the accent, the
 * badge's cover and what the badge shows, as stacked disclosures.
 */
export function StylePanel({
  did,
  initials,
  config,
  disabled,
  onChange,
}: StylePanelProps) {
  const { t } = useLingui();
  const settingNames = {
    showRole: t`Show current role`,
    showLocation: t`Show location`,
    showOpenTo: t`Show what you’re open to`,
  };
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
            id: SECTIONS.cover,
            title: t`Cover`,
            content: (
              <CoverPicker
                value={config.cover ?? coverFor(did)}
                initials={initials}
                onChange={(cover) => {
                  track('cover_changed', { cover });
                  onChange((current) => ({ ...current, cover }));
                }}
                disabled={disabled}
              />
            ),
          },
          {
            id: SECTIONS.badge,
            title: t`Badge`,
            content: (
              <div className={styles.settings}>
                {BADGE_SETTINGS.map((setting) => (
                  <label key={setting} className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={config[setting]}
                      onChange={(event) => {
                        const on = event.target.checked;
                        track('badge_setting_changed', { setting, on });
                        onChange((current) => ({ ...current, [setting]: on }));
                      }}
                      disabled={disabled}
                      className={styles.checkbox}
                    />
                    <span>{settingNames[setting]}</span>
                  </label>
                ))}
              </div>
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
