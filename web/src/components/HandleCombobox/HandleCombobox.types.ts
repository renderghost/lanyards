import type { Ref } from 'react';

export type HandleComboboxProps = {
  id: string;
  label: string;
  value: string;
  onChange(value: string): void;
  onBlur?(): void;
  /** Called when a suggestion lookup fails; the UI itself stays silent. */
  onLookupError?(error: unknown): void;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
};
