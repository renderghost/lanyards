import type { ButtonHTMLAttributes, Ref } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
/**
 * `ui` for the product chrome; `accent` for buttons on the lanyard itself;
 * `badge` for buttons on the badge's accent field (#129).
 */
export type ButtonTone = 'ui' | 'accent' | 'badge';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Disables the button and marks it busy while an action runs. */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
};
