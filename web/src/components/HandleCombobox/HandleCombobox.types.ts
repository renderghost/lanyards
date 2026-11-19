import type { Ref } from 'react';

/** `ui` for the product chrome; `accent` on the lanyard itself. */
export type HandleComboboxTone = 'ui' | 'accent';

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
  tone?: HandleComboboxTone;
};
