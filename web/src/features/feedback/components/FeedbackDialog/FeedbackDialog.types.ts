export type FeedbackDialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Puts focus back on what opened the dialog, once it closes. */
  returnFocus(): void;
  /** Where the person is: for the technical details, and to come back to. */
  page: string;
};
