export type ViewAs = 'edit' | 'public';

export type CustomiserActionsProps = {
  viewAs: ViewAs;
  onViewAsChange(viewAs: ViewAs): void;
  /** The draft differs from the last save. */
  dirty: boolean;
  /** How many settings differ; Reset asks first when it's more than one. */
  changes: number;
  saving: boolean;
  onSave(): void;
  onReset(): void;
};
