import type { Did } from '@atcute/lexicons';

export type QrSheetProps = {
  did: Did;
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Puts focus back on what opened the sheet, once it closes. */
  returnFocus(): void;
};
