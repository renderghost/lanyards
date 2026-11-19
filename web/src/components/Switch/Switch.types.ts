import type { Ref } from 'react';

export type SwitchProps = {
  checked: boolean;
  onCheckedChange(checked: boolean): void;
  /** The switch's accessible name, e.g. "Show Links". */
  label: string;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
};
