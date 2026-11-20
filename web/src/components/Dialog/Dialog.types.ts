import type { ReactNode } from 'react';

export type DialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** The dialog's visible heading, which also names it. */
  title: string;
  children: ReactNode;
  /** Called once the dialog has closed, to put focus back on its opener. */
  returnFocus?(): void;
  /**
   * Hides the dialog and its backdrop while it stays open, e.g. for a
   * moment while the page behind it is captured (#134).
   */
  concealed?: boolean;
  className?: string;
};
