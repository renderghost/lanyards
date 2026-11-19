import type { Accent } from '@/design/accents';

export type AccentPickerProps = {
  value: Accent;
  onChange(accent: Accent): void;
  disabled?: boolean;
  /** Keeps "Accent colour" as the group's name but doesn't show it. */
  hideLabel?: boolean;
  className?: string;
};
