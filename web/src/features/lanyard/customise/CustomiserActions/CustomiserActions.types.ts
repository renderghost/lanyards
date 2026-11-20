import type { Ref } from 'react';

export type CustomiserActionsProps = {
  /** The draft differs from the last save. */
  dirty: boolean;
  /** How many settings differ; Reset asks first when it's more than one. */
  changes: number;
  saving: boolean;
  onSave(): void;
  onReset(): void;
  /** On phones, opens the style sheet (the sidebar from md up). */
  onOpenStyle(): void;
  /** The Style button, for the style sheet to return focus to. */
  styleButtonRef?: Ref<HTMLButtonElement>;
};
