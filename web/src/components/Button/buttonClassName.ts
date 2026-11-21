import { cn } from '@/lib/utils';

import { base, sizes, tones } from './Button.styles';
import type { ButtonSize, ButtonTone, ButtonVariant } from './Button.types';

type ButtonLook = {
  tone?: ButtonTone;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/**
 * A button's classes, merged as Button merges them, for a link that looks
 * like one (#162): Sign in, and calls to action that go to another page.
 */
export function buttonClassName({
  tone = 'ui',
  variant = 'primary',
  size = 'md',
  className,
}: ButtonLook = {}): string {
  return cn(base, tones[tone][variant], sizes[size], className);
}
