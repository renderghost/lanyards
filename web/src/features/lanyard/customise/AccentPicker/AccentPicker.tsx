import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { RadioGroup } from 'radix-ui';

import { type Accent, ACCENTS } from '@/design/accents';
import { cn } from '@/lib/utils';

import { ACCENT_NAMES } from './AccentPicker.constants';
import * as styles from './AccentPicker.styles';
import type { AccentPickerProps } from './AccentPicker.types';

/** The eight accent palettes as swatches with visible names (spec §7.4). */
export function AccentPicker({
  value,
  onChange,
  disabled = false,
  className,
}: AccentPickerProps) {
  const { t, i18n } = useLingui();
  const labelId = useId();

  return (
    <div className={cn(styles.group, className)}>
      <p id={labelId} className={styles.label}>
        {t`Accent colour`}
      </p>
      <RadioGroup.Root
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next) => onChange(next as Accent)}
        disabled={disabled}
        className={styles.options}
      >
        {ACCENTS.map((accent) => (
          <RadioGroup.Item
            key={accent}
            value={accent}
            className={styles.option}
          >
            <span
              data-accent={accent}
              className={styles.swatch}
              aria-hidden="true"
            />
            <span>{i18n._(ACCENT_NAMES[accent])}</span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}
