import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { RadioGroup } from 'radix-ui';

import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { COVERS, type CoverPattern as Cover } from '@/design/covers';
import { cn } from '@/lib/utils';

import { COVER_NAMES } from './CoverPicker.constants';
import * as styles from './CoverPicker.styles';
import type { CoverPickerProps } from './CoverPicker.types';

/** The eight covers as live previews in the current accent (#129). */
export function CoverPicker({
  value,
  initials,
  onChange,
  disabled = false,
  className,
}: CoverPickerProps) {
  const { t, i18n } = useLingui();
  const labelId = useId();

  return (
    <div className={cn(styles.group, className)}>
      <p id={labelId} className={styles.label}>
        {t`Cover`}
      </p>
      <RadioGroup.Root
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next) => onChange(next as Cover)}
        disabled={disabled}
        className={styles.options}
      >
        {COVERS.map((cover) => (
          <RadioGroup.Item key={cover} value={cover} className={styles.option}>
            <span className={styles.preview}>
              <CoverPattern pattern={cover} initials={initials} />
            </span>
            <span className={styles.name}>{i18n._(COVER_NAMES[cover])}</span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}
