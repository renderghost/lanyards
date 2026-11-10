import type { Ref, SelectHTMLAttributes } from 'react';

export type SelectOption = { value: string; label: string };

export type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'value'
> & {
  label: string;
  name: string;
  options: SelectOption[];
  value: string;
  onChange(value: string): void;
  /** The empty first option, e.g. "Choose a platform". */
  placeholder?: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
};
