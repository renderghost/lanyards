import type { Ref } from 'react';

export type CustomiserToolbarProps = {
  onOpenStyle(): void;
  /** The Style button, for the style sheet to return focus to. */
  styleButtonRef?: Ref<HTMLButtonElement>;
  onReset(): void;
  /** Opens "Beta support": feedback, docs, Signal and Bluesky (#134). */
  onOpenSupport(): void;
  /** The Support button, for the support sheet to return focus to. */
  supportButtonRef?: Ref<HTMLButtonElement>;
  /** The draft differs from the last save. */
  dirty: boolean;
  /** How many settings differ; Reset asks first when it's more than one. */
  changes: number;
};
