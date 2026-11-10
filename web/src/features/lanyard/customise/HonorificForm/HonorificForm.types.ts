import type { Honorific } from './HonorificForm.constants';

export type HonorificFormProps = {
  /** The stored honorific; `none` when there isn't one. */
  current: Honorific;
  disabled?: boolean;
  className?: string;
};
