import { type RefObject, useEffect } from 'react';

import { atRest, REST, stepSway, type Sway, swayAngle } from './sway';

/**
 * Sway only for a mouse or trackpad, and only for people who haven't
 * asked for less motion. Touch has no hover to brush past with.
 */
export const SWAY_MEDIA =
  '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

/**
 * Sways `target` as a mouse moves sideways over `area` (#151), then lets
 * it settle (see ./sway). It animates only while it moves: at rest there
 * is no frame loop and no transform. The turn is drawn as the target's
 * transform, set frame by frame here, so it adds to any tilt the
 * target's classes give it with `rotate`.
 */
export function usePointerSway(
  area: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    const zone = area.current;
    const badge = target.current;
    if (!zone || !badge) return;
    const media = window.matchMedia(SWAY_MEDIA);

    let sway: Sway = REST;
    let frame = 0;
    let lastFrame: number | null = null;
    let lastX: number | null = null;
    /** Pixels moved sideways since the last frame. */
    let moved = 0;

    function straighten() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = null;
      lastX = null;
      moved = 0;
      sway = REST;
      badge?.style.removeProperty('transform');
    }

    function tick(now: number) {
      const seconds = lastFrame === null ? 0 : (now - lastFrame) / 1000;
      lastFrame = now;
      // The first frame only starts the clock; the movement waits for it.
      if (seconds <= 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      sway = stepSway(sway, moved / seconds, seconds);
      moved = 0;
      if (atRest(sway)) {
        straighten();
        return;
      }
      badge?.style.setProperty(
        'transform',
        `rotate(${swayAngle(sway).toFixed(3)}deg)`
      );
      frame = requestAnimationFrame(tick);
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !media.matches) return;
      if (lastX !== null) moved += event.clientX - lastX;
      lastX = event.clientX;
      if (!frame) frame = requestAnimationFrame(tick);
    }

    // Coming back in elsewhere isn't a sweep across the gap.
    function onLeave() {
      lastX = null;
    }

    function onMediaChange() {
      if (!media.matches) straighten();
    }

    zone.addEventListener('pointermove', onMove);
    zone.addEventListener('pointerleave', onLeave);
    media.addEventListener('change', onMediaChange);
    return () => {
      zone.removeEventListener('pointermove', onMove);
      zone.removeEventListener('pointerleave', onLeave);
      media.removeEventListener('change', onMediaChange);
      straighten();
    };
  }, [area, target]);
}
