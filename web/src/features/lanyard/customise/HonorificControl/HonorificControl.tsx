import { useLingui } from '@lingui/react/macro';

import { SelectField } from '@/components/SelectField/SelectField';
import { cn } from '@/lib/utils';

import type { HonorificValue } from '../../hooks/useKeptRecordsDraft';
import { HONORIFIC_LABELS, HONORIFICS } from './HonorificControl.constants';
import * as styles from './HonorificControl.styles';
import type { HonorificControlProps } from './HonorificControl.types';

const isHonorific = (value: string): value is HonorificValue =>
  (HONORIFICS as string[]).includes(value);

/**
 * The title before the owner's name on their badge: None, Dr or Prof
 * (spec §7.4). It shows on the badge at once and saves with the rest.
 */
export function HonorificControl({
  value,
  onChange,
  disabled,
  className,
}: HonorificControlProps) {
  const { t, i18n } = useLingui();
  return (
    <div className={cn(styles.control, className)}>
      <SelectField
        label={t`Title`}
        name="honorific"
        hint={t`Shown before your name`}
        options={HONORIFICS.map((option) => ({
          value: option,
          label: i18n._(HONORIFIC_LABELS[option]),
        }))}
        value={value}
        onChange={(next) => {
          if (isHonorific(next)) onChange(next);
        }}
        disabled={disabled}
      />
    </div>
  );
}
