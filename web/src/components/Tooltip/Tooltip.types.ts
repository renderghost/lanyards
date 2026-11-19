import type { ReactElement } from 'react';

export type TooltipProps = {
  /** The text shown; usually the trigger's own accessible name. */
  label: string;
  /** One focusable element, such as a button. */
  children: ReactElement;
};
