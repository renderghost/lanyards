import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

export type IconButtonVariant = 'ghost' | 'outline';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** The button's accessible name, also shown as its tooltip. */
  label: string;
  /** A decorative icon; it is hidden from assistive technology. */
  icon: ReactNode;
  variant?: IconButtonVariant;
  ref?: Ref<HTMLButtonElement>;
};
