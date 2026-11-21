import { useEffect } from 'react';

import {
  strapPath,
  VIEW,
} from './components/LanyardRibbon/LanyardRibbon.constants';
import {
  atRest,
  type Badge,
  drawn,
  type Hang,
  type Push,
  REST,
  stepHang,
} from './lanyardPhysics';

/**
 * Sway only for a mouse or trackpad, and only for people who haven't
 * asked for less motion. Touch has no hover to brush past with, and on the
 * Share screen a phone's code stays still to be scanned.
 */
export const SWAY_MEDIA =
  '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

/** Swing in on arrival only with motion, and only on a wide screen. */
export const ARRIVAL_MEDIA =
  '(prefers-reduced-motion: no-preference) and (min-width: 48rem)';

/** The lean a badge arrives at, as if just let go, in degrees. */
const ARRIVAL_ANGLE = 3.5;

/** Where the clasp is below the sleeve's top, if the style doesn't say. */
const DEFAULT_PIVOT = 16;

/**
 * The elements themselves, not refs: held in state by callback refs, so
 * the sway starts when they appear, even a render later, as a dialog's
 * content does in its portal.
 */
export type LanyardSwayOptions = {
  /** Where a mouse brushing past pushes it: the lanyard and the badge. */
  area: HTMLElement | null;
  /** What swings: the sleeve, turning about its transform origin. */
  sleeve: HTMLElement | null;
  /** The lanyard's drawing (LanyardRibbon's ref): its tab sways too. */
  ribbon?: SVGSVGElement | null;
  /** Off: straight and still, as while it shows a form (#175). */
  enabled?: boolean;
  /** Swing in as it first appears, then settle (the homepage's). */
  arrive?: boolean;
};

/**
 * Moves the lanyard's tab, and the clasp under it, `units` of its drawing
 * sideways: the straps' feet follow it. 0 hangs it straight.
 */
function shiftTab(drawing: SVGSVGElement, units: number) {
  for (const side of ['left', 'right'] as const) {
    for (const strap of drawing.querySelectorAll(`[data-strap="${side}"]`)) {
      strap.setAttribute('d', strapPath(side, units));
    }
  }
  const tab = drawing.querySelector('[data-tab]');
  if (!tab) return;
  if (units === 0) tab.removeAttribute('transform');
  else
    tab.setAttribute(
      'transform',
      `translate(${Math.round(units * 100) / 100} 0)`
    );
}

/** The clasp's height in the sleeve, from its CSS transform origin. */
function pivotOf(element: HTMLElement): number {
  const [, y] = getComputedStyle(element).transformOrigin.split(' ');
  const pivot = Number.parseFloat(y ?? '');
  return Number.isFinite(pivot) ? pivot : DEFAULT_PIVOT;
}

/**
 * Hangs `sleeve` from its lanyard with real physics (#174): a mouse
 * brushing across `area` pushes it, at the mouse's height, and it swings
 * and settles (see ./lanyardPhysics). It animates only while it moves: at
 * rest there is no frame loop and no transform. The sleeve's transform is
 * set frame by frame here; its classes set the transform origin, where
 * the clasp is.
 */
export function useLanyardSway({
  area,
  sleeve,
  ribbon,
  enabled = true,
  arrive = false,
}: LanyardSwayOptions): void {
  useEffect(() => {
    const zone = area;
    const target = sleeve;
    if (!zone || !target || !enabled) return;
    const sway = window.matchMedia(SWAY_MEDIA);
    const arrival = window.matchMedia(ARRIVAL_MEDIA);

    let hang: Hang = REST;
    let frame = 0;
    let lastFrame: number | null = null;
    let lastX: number | null = null;
    let lastY = 0;
    /** Pixels moved sideways since the last frame. */
    let moved = 0;
    /**
     * The badge's size, its clasp on the page, and the lanyard's drawing
     * units a pixel, as it set off.
     */
    let geometry: { badge: Badge; pivotY: number; units: number } | null = null;

    function measure(element: HTMLElement) {
      const pivot = pivotOf(element);
      const top = element.getBoundingClientRect().top + window.scrollY;
      const drawn = ribbon?.getBoundingClientRect().height ?? 0;
      return {
        units: drawn > 0 ? VIEW.height / drawn : 1,
        badge: {
          width: element.offsetWidth,
          height: element.offsetHeight,
          pivot,
        },
        pivotY: top + pivot,
      };
    }

    function straighten() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = null;
      lastX = null;
      moved = 0;
      hang = REST;
      geometry = null;
      target?.style.removeProperty('transform');
      if (ribbon) shiftTab(ribbon, 0);
    }

    function draw() {
      const { shift, angle } = drawn(hang);
      target?.style.setProperty(
        'transform',
        `translateX(${shift.toFixed(2)}px) rotate(${(-angle).toFixed(3)}deg)`
      );
      if (ribbon) shiftTab(ribbon, shift * (geometry?.units ?? 1));
    }

    function tick(now: number) {
      const seconds = lastFrame === null ? 0 : (now - lastFrame) / 1000;
      lastFrame = now;
      // The first frame only starts the clock; the movement waits for it.
      if (seconds <= 0 || !geometry) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const push: Push | null =
        moved === 0
          ? null
          : {
              speed: moved / seconds,
              below: lastY + window.scrollY - geometry.pivotY,
            };
      moved = 0;
      hang = stepHang(hang, geometry.badge, push, seconds);
      if (!push && atRest(hang)) {
        straighten();
        return;
      }
      draw();
      frame = requestAnimationFrame(tick);
    }

    /** No box of its own (the Share screen sideways): nothing to turn. */
    const boxless = () =>
      !target || getComputedStyle(target).display === 'contents';

    function start() {
      if (boxless()) return;
      if (target && !geometry) geometry = measure(target);
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !sway.matches) return;
      if (lastX !== null) moved += event.clientX - lastX;
      lastX = event.clientX;
      lastY = event.clientY;
      start();
    }

    // Coming back in elsewhere isn't a sweep across the gap.
    function onLeave() {
      lastX = null;
    }

    // Asked for less motion mid-swing, or the mouse has gone: hang
    // straight at once, unless it's still swinging in as it arrives.
    function onMediaChange() {
      if (!sway.matches && !(arrive && arrival.matches)) straighten();
    }

    if (arrive && arrival.matches && !boxless()) {
      geometry = measure(target);
      hang = { ...REST, angle: ARRIVAL_ANGLE };
      draw();
      start();
    }

    zone.addEventListener('pointermove', onMove);
    zone.addEventListener('pointerleave', onLeave);
    sway.addEventListener('change', onMediaChange);
    arrival.addEventListener('change', onMediaChange);
    return () => {
      zone.removeEventListener('pointermove', onMove);
      zone.removeEventListener('pointerleave', onLeave);
      sway.removeEventListener('change', onMediaChange);
      arrival.removeEventListener('change', onMediaChange);
      straighten();
    };
  }, [area, sleeve, ribbon, enabled, arrive]);
}
