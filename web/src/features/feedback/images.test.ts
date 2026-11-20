import { describe, expect, it } from 'vitest';

import { fitUnder, ImageTooLargeError } from './images';

const blobOf = (size: number) => new Blob([new Uint8Array(size)]);

/** An encoder whose output fits from call `fitsAt` (1-based) on. */
function encoder(fitsAt: number) {
  const calls: [number, number][] = [];
  const encode = async (scale: number, quality: number) => {
    calls.push([Number(scale.toFixed(4)), quality]);
    return blobOf(calls.length >= fitsAt ? 900 : 5000);
  };
  return { calls, encode };
}

// Screenshots must fit a UserInput image's 1 MB limit (#134).
describe('fitUnder', () => {
  it('returns the first encoding under the limit', async () => {
    const { calls, encode } = encoder(1);
    expect((await fitUnder(1000, encode)).size).toBe(900);
    expect(calls).toEqual([[1, 0.85]]);
  });

  it('steps the quality down, then the size, until it fits', async () => {
    const { calls, encode } = encoder(5);
    await fitUnder(1000, encode);
    expect(calls).toEqual([
      [1, 0.85],
      [1, 0.7],
      [1, 0.55],
      [0.75, 0.7],
      [0.5625, 0.7],
    ]);
  });

  it('gives up below a fifth of the size', async () => {
    const { calls, encode } = encoder(Infinity);
    await expect(fitUnder(1000, encode)).rejects.toBeInstanceOf(
      ImageTooLargeError
    );
    const scales = calls.map(([scale]) => scale);
    expect(Math.min(...scales)).toBeGreaterThanOrEqual(0.2);
    expect(scales.at(-1)).toBe(0.2373);
  });
});
