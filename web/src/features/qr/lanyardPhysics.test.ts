import { describe, expect, it } from 'vitest';

import {
  atRest,
  type Badge,
  drawn,
  type Hang,
  MAX_ANGLE,
  MAX_SHIFT,
  type Push,
  REST,
  stepHang,
} from './lanyardPhysics';

const FRAME = 1 / 60;

/** The Share badge on a phone, and the homepage's billboard. */
const CARD: Badge = { width: 350, height: 560, pivot: 16 };
const BILLBOARD: Badge = { width: 930, height: 760, pivot: 24 };

/** A pointer brushing across the badge, `below` px under the clasp. */
const brush = (speed: number, below = 300): Push => ({ speed, below });

/**
 * Runs the lanyard for `seconds`, brushed by `push` for the first
 * `pushFor` seconds, a frame at a time.
 */
function run(
  push: Push,
  pushFor: number,
  seconds: number,
  { badge = CARD, frame = FRAME, from = REST } = {}
) {
  let hang: Hang = from;
  const angles: number[] = [];
  const shifts: number[] = [];
  let restedAt: number | null = null;
  for (let time = 0; time < seconds; time += frame) {
    hang = stepHang(hang, badge, time < pushFor ? push : null, frame);
    const shown = drawn(hang);
    angles.push(shown.angle);
    shifts.push(shown.shift);
    if (restedAt === null && time >= pushFor && atRest(hang)) restedAt = time;
  }
  return { hang, angles, shifts, restedAt };
}

/** The angle at each turn of the swing, in order. */
function turns(values: number[]) {
  return values.filter((value, index) => {
    const before = values[index - 1];
    const after = values[index + 1];
    if (before === undefined || after === undefined) return false;
    return (value - before) * (after - value) < 0;
  });
}

/** Seconds between the first two swings the same way: one period. */
function period(values: number[], frame = FRAME) {
  const peaks = values
    .map((value, index) => ({ value, index }))
    .filter(({ value, index }) => {
      const before = values[index - 1];
      const after = values[index + 1];
      return (
        before !== undefined &&
        after !== undefined &&
        value > before &&
        value >= after &&
        value > 0
      );
    });
  const [first, second] = peaks;
  return ((second?.index ?? 0) - (first?.index ?? 0)) * frame;
}

const biggest = (values: number[]) => Math.max(...values.map(Math.abs));

describe('lanyard physics (#174)', () => {
  it('hangs still with nothing touching it', () => {
    const { hang } = run(brush(0), 0, 2);
    expect(hang).toEqual(REST);
    expect(atRest(hang)).toBe(true);
  });

  it('swings the badge, and the lanyard with it, the way the pointer moves', () => {
    const right = run(brush(1500), 0.3, 0.45);
    const left = run(brush(-1500), 0.3, 0.45);
    // Positive is the badge's foot moving right; the tab follows a little.
    expect(Math.max(...right.angles)).toBeGreaterThan(0.5);
    expect(Math.max(...right.shifts)).toBeGreaterThan(0.3);
    expect(Math.min(...left.angles)).toBeLessThan(-0.5);
    expect(Math.min(...left.shifts)).toBeLessThan(-0.3);
  });

  it('swings well for a brisk sweep, about 3 degrees (#163)', () => {
    const { angles } = run(brush(1500), 0.3, 1.5);
    expect(biggest(angles)).toBeGreaterThan(2);
    expect(biggest(angles)).toBeLessThan(4);
  });

  it('moves only a little for a slow pointer', () => {
    const { angles } = run(brush(150), 1, 3);
    expect(biggest(angles)).toBeLessThan(0.75);
  });

  it('turns the badge most when brushed low, and the lanyard when high', () => {
    const low = run(brush(1500, 500), 0.3, 1);
    const high = run(brush(1500, -60), 0.3, 1);
    expect(biggest(low.angles)).toBeGreaterThan(biggest(high.angles) * 2);
    expect(biggest(high.shifts)).toBeGreaterThan(0.3);
  });

  it('can never be pushed faster than the pointer moves', () => {
    // Brushed for ever at a steady speed, the badge goes with the pointer,
    // never past it: the lanyard pulls it back long before.
    const { angles } = run(brush(600), 10, 10);
    expect(biggest(angles)).toBeLessThan(MAX_ANGLE);
  });

  it('swings back and forth, each swing smaller, then rests within 6 s', () => {
    const { angles, restedAt, hang } = run(brush(1500), 0.3, 10);
    const swings = turns(angles);
    expect(swings.length).toBeGreaterThanOrEqual(6);
    for (let index = 1; index < 4; index += 1) {
      expect(Math.abs(swings[index] ?? 0)).toBeLessThan(
        Math.abs(swings[index - 1] ?? 0)
      );
    }
    expect(restedAt).not.toBeNull();
    expect((restedAt ?? 0) - 0.3).toBeGreaterThan(3.5);
    expect((restedAt ?? 0) - 0.3).toBeLessThan(6.5);
    expect(hang).toEqual(REST);
  });

  it('swings at a real badge’s pace: a bigger badge swings slower', () => {
    const card = period(run(brush(1500), 0.2, 4).angles);
    const billboard = period(
      run(brush(1500), 0.2, 4, { badge: BILLBOARD }).angles
    );
    // A 9 cm card swings in about 0.65 s; a billboard more slowly.
    expect(card).toBeGreaterThan(0.5);
    expect(card).toBeLessThan(0.9);
    expect(billboard).toBeGreaterThan(card);
    expect(billboard).toBeLessThan(1.2);
  });

  it('never leans past its caps, however hard it is pushed', () => {
    for (const speed of [5_000, 100_000, -100_000, Number.MAX_VALUE]) {
      for (const below of [-200, 0, 300, 2_000]) {
        const { angles, shifts } = run(brush(speed, below), 5, 12);
        expect(biggest(angles)).toBeLessThan(MAX_ANGLE);
        expect(biggest(shifts)).toBeLessThan(MAX_SHIFT);
      }
    }
  });

  it('comes to rest from its caps within 6 s', () => {
    const { restedAt } = run(brush(100_000), 3, 14);
    expect(restedAt).not.toBeNull();
    expect((restedAt ?? 0) - 3).toBeLessThan(6.5);
  });

  it('moves the same at 60 and 144 frames a second', () => {
    const slow = run(brush(1500), 0.3, 1.2);
    const fast = run(brush(1500), 0.3, 1.2, { frame: 1 / 144 });
    expect(Math.abs(biggest(slow.angles) - biggest(fast.angles))).toBeLessThan(
      0.15
    );
  });

  // A tab in the background, or a long frame, doesn't fling it.
  it('treats a long gap between frames as one short frame', () => {
    const swinging = run(brush(1500), 0.3, 0.3).hang;
    expect(stepHang(swinging, CARD, null, 5)).toEqual(
      stepHang(swinging, CARD, null, 1 / 30)
    );
    expect(stepHang(swinging, CARD, null, -1)).toEqual(swinging);
  });

  it('ignores a push that isn’t a number', () => {
    expect(stepHang(REST, CARD, brush(Number.NaN), FRAME)).toEqual(REST);
    expect(stepHang(REST, CARD, brush(1500, Number.NaN), FRAME)).toEqual(REST);
  });

  it('swings in from a lean and settles, as it arrives', () => {
    const { angles, restedAt } = run(brush(0), 0, 10, {
      from: { ...REST, angle: 4 },
    });
    expect(angles[0]).toBeGreaterThan(3);
    expect(Math.min(...angles)).toBeLessThan(-1);
    expect(restedAt).not.toBeNull();
    expect(restedAt ?? 0).toBeLessThan(6.5);
  });
});
