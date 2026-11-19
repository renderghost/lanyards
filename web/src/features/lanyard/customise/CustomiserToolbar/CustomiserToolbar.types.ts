import type { Ref } from 'react';

export type CustomiserToolbarProps = {
  onOpenStyle(): void;
  /** The Style button, for the style sheet to return focus to. */
  styleButtonRef?: Ref<HTMLButtonElement>;
  onReset(): void;
  /** The draft differs from the last save. */
  dirty: boolean;
  /** How many settings differ; Reset asks first when it's more than one. */
  changes: number;
};
