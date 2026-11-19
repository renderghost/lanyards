import type { ReactNode } from 'react';

export type DialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** The dialog's visible heading, which also names it. */
  title: string;
  children: ReactNode;
  /** Called once the dialog has closed, to put focus back on its opener. */
  returnFocus?(): void;
  className?: string;
};
