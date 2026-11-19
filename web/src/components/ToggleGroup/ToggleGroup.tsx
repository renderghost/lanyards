import { ToggleGroup as Primitive } from 'radix-ui';

import * as styles from './ToggleGroup.styles';
import type { ToggleGroupProps } from './ToggleGroup.types';

/**
 * A named group of toggle buttons where exactly one is pressed: one tab
 * stop, arrow keys between options, Enter or Space to press.
 *
 * Radix exposes single-choice groups as radios, but its arrow keys only move
 * focus, which radios never do; plain pressed/unpressed buttons describe
 * what actually happens (spec #118).
 */
export function ToggleGroup<T extends string>({
  value,
  onValueChange,
  label,
  options,
}: ToggleGroupProps<T>) {
  return (
    <Primitive.Root
      type="single"
      value={value}
      // Pressing the pressed option would clear it; one is always chosen.
      onValueChange={(next) => {
        const chosen = options.find((option) => option.value === next);
        if (chosen) onValueChange(chosen.value);
      }}
      role="group"
      aria-label={label}
      className={styles.root}
    >
      {options.map((option) => (
        <Primitive.Item
          key={option.value}
          value={option.value}
          role={undefined}
          aria-checked={undefined}
          aria-pressed={option.value === value}
          className={styles.item}
        >
          {option.label}
        </Primitive.Item>
      ))}
    </Primitive.Root>
  );
}
