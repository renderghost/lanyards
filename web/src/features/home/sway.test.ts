import { describe, expect, it } from 'vitest';

import {
  atRest,
  MAX_ANGLE,
  REST,
  stepSway,
  swayAngle,
  type Sway,
} from './sway';

const FRAME = 1 / 60;

/** Runs the sway for `seconds`, pushed at `speed` px/s for `pushFor`. */
function run(speed: number, pushFor: number, seconds: number, from = REST) {
  let sway: Sway = from;
  const angles: number[] = [];
  let restedAt: number | null = null;
  for (let time = 0; time < seconds; time += FRAME) {
    sway = stepSway(sway, time < pushFor ? speed : 0, FRAME);
    angles.push(swayAngle(sway));
    if (restedAt === null && time >= pushFor && atRest(sway)) restedAt = time;
  }
  return { sway, angles, restedAt };
}

/** The angle at each turn of the swing, in order. */
function turns(angles: number[]) {
  return angles.filter((angle, index) => {
    const before = angles[index - 1];
    const after = angles[index + 1];
    if (before === undefined || after === undefined) return false;
    return (angle - before) * (after - angle) < 0;
  });
}

describe('sway', () => {
  it('stays still with nothing pushing it', () => {
    const { sway } = run(0, 0, 2);
    expect(sway).toEqual(REST);
    expect(atRest(sway)).toBe(true);
  });

  // CSS turns clockwise for a positive angle: the bottom moves left.
  it('swings the bottom of the badge the way the pointer moves', () => {
    const right = run(1200, 0.5, 0.6).angles.at(-1) ?? 0;
    const left = run(-1200, 0.5, 0.6).angles.at(-1) ?? 0;
    expect(right).toBeLessThan(-0.3);
    expect(left).toBeGreaterThan(0.3);
  });

  it('barely moves for a slow pointer', () => {
    const { angles } = run(150, 1, 3);
    expect(Math.max(...angles.map(Math.abs))).toBeLessThan(0.25);
  });

  it('never leans past its cap, however hard it is pushed', () => {
    for (const speed of [5_000, 100_000, -100_000, Number.MAX_VALUE]) {
      const { angles } = run(speed, 10, 12);
      expect(Math.max(...angles.map(Math.abs))).toBeLessThan(MAX_ANGLE);
    }
  });

  it('swings back lightly, each swing smaller, then rests', () => {
    const { angles, restedAt, sway } = run(1200, 0.5, 8);
    const [first, second, third] = turns(angles);
    // A swing, a smaller one back the other way, a smaller one again.
    expect(first).toBeLessThan(0);
    expect(second).toBeGreaterThan(0);
    expect(Math.abs(second ?? 0)).toBeLessThan(Math.abs(first ?? 0) / 2);
    expect(Math.abs(third ?? 0)).toBeLessThan(Math.abs(second ?? 0) / 2);
    expect(restedAt).not.toBeNull();
    expect(restedAt).toBeLessThan(5);
    expect(sway).toEqual(REST);
  });

  it('comes to rest from its cap within a few seconds', () => {
    const { restedAt } = run(100_000, 3, 12);
    expect(restedAt).not.toBeNull();
    expect((restedAt ?? 0) - 3).toBeLessThan(5);
  });

  // A tab in the background, or a long frame, doesn't fling it.
  it('treats a long gap between frames as one short frame', () => {
    const swinging = run(1200, 0.5, 0.5).sway;
    const after = stepSway(swinging, 0, 5);
    const short = stepSway(swinging, 0, 1 / 30);
    expect(after).toEqual(short);
    expect(stepSway(swinging, 0, -1)).toEqual(swinging);
  });

  it('ignores a pointer speed that isn’t a number', () => {
    expect(stepSway(REST, Number.NaN, FRAME)).toEqual(REST);
    expect(stepSway(REST, Number.POSITIVE_INFINITY, FRAME).angle).toBeLessThan(
      0
    );
  });
});
