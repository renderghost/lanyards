import type { InputHTMLAttributes, Ref } from 'react';

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};
