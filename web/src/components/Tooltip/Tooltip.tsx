import { Tooltip as Primitive } from 'radix-ui';

import {
  TOOLTIP_COLLISION_PADDING,
  TOOLTIP_DELAY_MS,
  TOOLTIP_OFFSET,
} from './Tooltip.constants';
import * as styles from './Tooltip.styles';
import type { TooltipProps } from './Tooltip.types';

/**
 * A short label for an icon-only control. It shows after a brief hover and
 * at once on keyboard focus, and Escape hides it without moving focus.
 */
export function Tooltip({ label, children }: TooltipProps) {
  return (
    <Primitive.Provider delayDuration={TOOLTIP_DELAY_MS}>
      <Primitive.Root>
        <Primitive.Trigger asChild>{children}</Primitive.Trigger>
        <Primitive.Portal>
          <Primitive.Content
            className={styles.content}
            sideOffset={TOOLTIP_OFFSET}
            collisionPadding={TOOLTIP_COLLISION_PADDING}
          >
            {label}
          </Primitive.Content>
        </Primitive.Portal>
      </Primitive.Root>
    </Primitive.Provider>
  );
}
