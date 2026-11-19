import type { ReactElement, ReactNode } from 'react';

export type SheetProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** The sheet's visible title, which also names the dialog. */
  title: string;
  children: ReactNode;
  /** The button that opens the sheet; focus returns to it on close. */
  trigger?: ReactElement;
  /**
   * Without a trigger: puts focus back on what opened the sheet. If left
   * out, focus returns to whatever had it when the sheet opened.
   */
  returnFocus?(): void;
};
