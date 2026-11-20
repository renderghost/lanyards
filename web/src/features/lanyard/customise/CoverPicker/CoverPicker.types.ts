import type { CoverPattern } from '@/design/covers';

export type CoverPickerProps = {
  value: CoverPattern;
  /** The owner's initials, for the monogram's preview. */
  initials: string;
  onChange(cover: CoverPattern): void;
  disabled?: boolean;
  className?: string;
};
