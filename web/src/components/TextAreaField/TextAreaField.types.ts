import type { Ref, TextareaHTMLAttributes } from 'react';

export type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
};
