/**
 * How the homepage badge sways when a pointer brushes past it (#151): a
 * damped spring, pushed by how fast the pointer moves sideways. A brisk
 * sweep swings it nearly 3 degrees (#163), then back and forth,
 * each swing about half the last, and it's still about six seconds after
 * the pointer stops. The angle shown never reaches MAX_ANGLE, however
 * hard it's pushed.
 *
 * Angles are in degrees, as CSS turns them: positive is clockwise, which
 * moves the bottom of the badge left.
 */
export type Sway = {
  /** Degrees from hanging straight. */
  angle: number;
  /** Degrees a second. */
  velocity: number;
};

export const REST: Sway = { angle: 0, velocity: 0 };

/** The furthest the badge ever leans, either way. */
export const MAX_ANGLE = 5;

/** About 1.6 seconds a swing. */
const STIFFNESS = 4;

/**
 * Light enough to sway on, heavy enough that each swing is about half the
 * last, so it's still in about six seconds.
 */
const DAMPING = 0.2;

/** Degrees a second, squared, for each pixel a second of pointer. */
const GAIN = 0.032;

/** The most the pointer pushes: a brisk sweep, not a fling. */
const MAX_PUSH = 80;

/** The fastest it turns, and how far it can wind up past what it shows. */
const MAX_VELOCITY = 60;
const MAX_WIND = MAX_ANGLE * 2;

/** A longer frame (a tab in the background) counts as this. */
const MAX_STEP = 1 / 30;

/** Below these, it's still: under half a pixel at the badge's foot. */
const REST_ANGLE = 0.03;
const REST_VELOCITY = 0.1;

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

/**
 * Advances the sway by `seconds`, pushed by the pointer moving sideways
 * at `pointerSpeed` pixels a second (rightwards positive).
 */
export function stepSway(
  sway: Sway,
  pointerSpeed: number,
  seconds: number
): Sway {
  const step = Math.min(Math.max(seconds, 0), MAX_STEP);
  if (step === 0) return sway;
  const speed = Number.isNaN(pointerSpeed) ? 0 : pointerSpeed;
  // Moving right pushes the bottom right: an anticlockwise turn.
  const push = clamp(-speed * GAIN, MAX_PUSH);
  const spring = -STIFFNESS * STIFFNESS * sway.angle;
  const drag = -2 * DAMPING * STIFFNESS * sway.velocity;
  // Semi-implicit Euler: velocity first, then the angle from it.
  const velocity = clamp(
    sway.velocity + (spring + drag + push) * step,
    MAX_VELOCITY
  );
  const angle = clamp(sway.angle + velocity * step, MAX_WIND);
  const next = { angle, velocity };
  return atRest(next) && push === 0 ? REST : next;
}

/** The angle to draw: eases into MAX_ANGLE rather than stopping at it. */
export function swayAngle(sway: Sway): number {
  return MAX_ANGLE * Math.tanh(sway.angle / MAX_ANGLE);
}

/** Still enough to stop animating. */
export function atRest(sway: Sway): boolean {
  return (
    Math.abs(sway.angle) < REST_ANGLE && Math.abs(sway.velocity) < REST_VELOCITY
  );
}
