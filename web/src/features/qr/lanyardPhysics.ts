/**
 * How a badge hangs and swings on its lanyard (#174), as a real one does.
 *
 * Two bodies, coupled:
 * - The lanyard's tab, at the bottom of the straps, swings sideways: a
 *   pendulum of the strap below where it lies on the wearer's chest. The
 *   straps rub on clothes, so it follows the badge smoothly rather than
 *   trading swings with it, and moves only a little.
 * - The badge in its sleeve swings on the clasp below the tab: a physical
 *   pendulum, a flat card whose size sets its pace. A small card swings
 *   quickly; a billboard more slowly.
 *
 * Moving the tab swings the badge, and the badge's swing tugs the tab, so
 * the straps sway too and the badge follows through. A mouse brushing past
 * pushes at its own height: low on the badge it turns it; high, on the
 * straps, it moves the lanyard. It can't push faster than it moves. Air
 * drag and the clasp's friction bring it to a clean stop within about six
 * seconds, as asked in #163.
 *
 * Lengths are CSS pixels, and gravity is real at a pixel's nominal size
 * (0.26 mm), so a badge drawn life-size swings at a real badge's pace.
 * Angles are degrees, positive when the badge's foot moves right; CSS turns
 * the other way, so it draws them negated.
 */

/** Where the lanyard is, and how it's moving. */
export type Hang = {
  /** The tab's shift sideways, in px: positive is right. */
  shift: number;
  /** Px a second. */
  drift: number;
  /** The badge's turn from hanging straight, in degrees. */
  angle: number;
  /** Degrees a second. */
  spin: number;
};

/** The sleeve that swings, as drawn. */
export type Badge = {
  width: number;
  height: number;
  /** From the sleeve's top edge down to the clasp it turns on. */
  pivot: number;
};

/** A pointer brushing past. */
export type Push = {
  /** Px a second, sideways: positive is right. */
  speed: number;
  /** Px below the clasp; negative is above it, on the straps. */
  below: number;
};

export const REST: Hang = { shift: 0, drift: 0, angle: 0, spin: 0 };

/** The furthest the badge is ever drawn turned, either way. */
export const MAX_ANGLE = 5;

/** The furthest the tab is ever drawn shifted, either way. */
export const MAX_SHIFT = 16;

/** Gravity in px a second squared: 9.81 m/s² at 0.26 mm a pixel. */
const GRAVITY = 37_000;

/** The strap hanging free above the tab: about 24 cm. */
const STRAP = 900;

/**
 * The tab's weight beside the badge's 1: the straps, and the chest they
 * lie on, which holds them back. So a push turns the badge more than it
 * moves the lanyard.
 */
const STRAP_MASS = 3;

/**
 * How quickly a swing dies away in air, each second (an e-folding rate):
 * each swing about three quarters of the last.
 */
const AIR = 0.5;

/**
 * The lanyard's own sway, rubbing on clothes: more than enough to stop it
 * swinging on its own, so it never trades swings with the badge.
 */
const STRAP_AIR = 10;

/** Drag that grows with speed: big swings lose more, as in air. */
const DRAG = 0.004;

/** The clasp's friction, as an angular deceleration, and where it eases. */
const CLASP = 0.05;
const CLASP_EASE = 0.2;

/**
 * How firmly a brushing pointer pushes what it passes. Like the air a hand
 * pushes, it grows with the square of the speed it passes at, so a slow
 * pointer barely stirs it and a brisk one swings it.
 */
const BRUSH = 0.0006;

/** The fastest a pointer pushes: a brisk sweep, not a fling. */
const MAX_POINTER = 3_000;

/** The most the state may wind up past what's drawn. */
const MAX_WIND_ANGLE = MAX_ANGLE * 2;
const MAX_WIND_SHIFT = MAX_SHIFT * 2;

/** Integrated in short steps; a longer frame (a background tab) is cut. */
const SUBSTEP = 1 / 240;
const MAX_STEP = 1 / 30;

/** Below these, it's still: under half a pixel anywhere on the badge. */
const REST_ANGLE = 0.03;
const REST_SPIN = 0.1;
const REST_SHIFT = 0.3;
const REST_DRIFT = 1;

const RADIANS = Math.PI / 180;

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

const finite = (value: number) => (Number.isFinite(value) ? value : 0);

/** One short step of the coupled tab and badge. */
function substep(hang: Hang, badge: Badge, push: Push | null, h: number) {
  const height = Math.max(badge.height, 1);
  const width = Math.max(badge.width, 1);
  // The badge's centre below the clasp, and its inertia about the clasp:
  // a flat rectangle of mass 1.
  const reach = Math.max(height / 2 - badge.pivot, 1);
  const inertia = (width * width + height * height) / 12 + reach * reach;
  const mass = 1 + STRAP_MASS;

  const theta = hang.angle * RADIANS;
  const omega = hang.spin * RADIANS;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  // The pointer drags what it passes towards its own speed.
  let force = 0;
  let torque = 0;
  if (push) {
    const speed = clamp(finite(push.speed), MAX_POINTER);
    const below = finite(push.below);
    const arm = Math.max(Math.min(below, height - badge.pivot), 0);
    const passing = hang.drift + arm * omega * cos;
    const relative = speed - passing;
    const brush = BRUSH * relative * Math.abs(relative);
    force = brush;
    torque = brush * arm * cos;
  }

  // The tab: gravity on the straps' pendulum, air, and the push.
  const pull = (-mass * GRAVITY * hang.shift) / STRAP;
  const strapAir = -2 * STRAP_AIR * mass * hang.drift;
  const sideways = pull + strapAir + force + reach * sin * omega * omega;

  // The badge: gravity about the clasp, air, drag, friction, and the push.
  const weight = -GRAVITY * reach * sin;
  const air = -2 * AIR * inertia * omega;
  const drag = -DRAG * inertia * omega * Math.abs(omega);
  const clasp = -CLASP * inertia * Math.tanh(omega / CLASP_EASE);
  const turning = weight + air + drag + clasp + torque;

  // The two are coupled: solve for both accelerations at once.
  const coupling = reach * cos;
  const determinant = mass * inertia - coupling * coupling;
  const along = (inertia * sideways - coupling * turning) / determinant;
  const around = (mass * turning - coupling * sideways) / determinant;

  // Semi-implicit Euler: velocities first, then positions from them.
  const drift = hang.drift + along * h;
  const spin = omega + around * h;
  return {
    shift: clamp(hang.shift + drift * h, MAX_WIND_SHIFT),
    drift,
    angle: clamp((theta + spin * h) / RADIANS, MAX_WIND_ANGLE),
    spin: spin / RADIANS,
  };
}

/** Advances the lanyard by `seconds`, brushed by `push` if it's moving. */
export function stepHang(
  hang: Hang,
  badge: Badge,
  push: Push | null,
  seconds: number
): Hang {
  const time = Math.min(Math.max(finite(seconds), 0), MAX_STEP);
  if (time === 0) return hang;
  const pushing =
    push !== null &&
    Number.isFinite(push.speed) &&
    Number.isFinite(push.below) &&
    push.speed !== 0;
  if (!pushing && hang === REST) return REST;
  const steps = Math.ceil(time / SUBSTEP);
  let next = hang;
  for (let step = 0; step < steps; step += 1) {
    next = substep(next, badge, pushing ? push : null, time / steps);
  }
  return !pushing && atRest(next) ? REST : next;
}

/** What to draw: eases into each cap rather than stopping at it. */
export function drawn(hang: Hang): { shift: number; angle: number } {
  return {
    shift: MAX_SHIFT * Math.tanh(hang.shift / MAX_SHIFT),
    angle: MAX_ANGLE * Math.tanh(hang.angle / MAX_ANGLE),
  };
}

/** Still enough to stop animating. */
export function atRest(hang: Hang): boolean {
  return (
    Math.abs(hang.angle) < REST_ANGLE &&
    Math.abs(hang.spin) < REST_SPIN &&
    Math.abs(hang.shift) < REST_SHIFT &&
    Math.abs(hang.drift) < REST_DRIFT
  );
}
