import { Switch as Primitive } from 'radix-ui';

import * as styles from './Switch.styles';
import type { SwitchProps } from './Switch.types';

/** An on/off switch named by `label`; Space toggles it. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  ref,
}: SwitchProps) {
  return (
    <Primitive.Root
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label}
      className={styles.root}
    >
      <Primitive.Thumb className={styles.thumb} />
    </Primitive.Root>
  );
}
