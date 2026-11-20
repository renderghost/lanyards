export type SupportSheetProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Puts focus back on what opened the sheet, or feedback from it. */
  returnFocus(): void;
};
