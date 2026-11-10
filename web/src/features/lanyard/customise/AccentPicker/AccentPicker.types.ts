import type { Accent } from '@/design/accents';

export type AccentPickerProps = {
  value: Accent;
  onChange(accent: Accent): void;
  disabled?: boolean;
  className?: string;
};
