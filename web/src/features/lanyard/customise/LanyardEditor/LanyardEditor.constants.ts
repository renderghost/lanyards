/** A mouse drag starts once the pointer has moved this far. */
export const MOUSE_DRAG = { distance: 4 };

/**
 * A finger drag starts after a press held this long without moving more
 * than `tolerance` pixels, so a swipe that starts on a handle still scrolls.
 */
export const TOUCH_DRAG = { delay: 250, tolerance: 5 };
